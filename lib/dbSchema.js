function json2mysql(obj) {
  if (typeof obj === 'string') {
    try {
      obj = JSON.parse(obj);
    } catch {
      throw new Error('json config is invalid');
    }
  }
  const tableName = obj.tableName;
  if (!tableName) {
    throw new Error('table name is not configured');
  }
  const columns = obj.columns;
  if (!columns || columns.length === 0) {
    throw new Error('table columns is not configuired');
  }
  const columnNames = obj.columns.map((c) => c.name);
  if (obj.indexes) {
    Object.values(obj.indexes).forEach((idx) => {
      idx.columns.forEach((col) => {
        if (!columnNames.includes(col)) {
          throw new Error(`table indexes include column ${col} that does not configuire in columns`);
        }
      });
    });
  }
  const opts = {
    overwrite: false,
    engine: 'InnoDB',
    autoIncrement: 0,
    ...obj.options,
  };
  let createStat = `CREATE TABLE IF NOT EXISTS \`${tableName}\``;
  if (opts.overwrite) {
    createStat = `DROP TABLE IF EXISTS \`${tableName}\`;\n${createStat}`;
  }

  const columnsStat = columns.map((col) => {
    let stat = `\`${col.name}\` ${col.type.toUpperCase()}`;
    if (col.length) {
      stat += `(${col.length})`;
    }
    if (col.autoIncrement) {
      stat += ' AUTO_INCREMENT';
    }
    if (!col.nullable) {
      stat += ' NOT NULL';
    }
    if (col.default !== null && col.default !== undefined) {
      if (col.default === 'CURRENT_TIMESTAMP') {
        stat += ` DEFAULT ${col.default}`;
      } else {
        stat += ` DEFAULT '${col.default}'`;
      }
    }
    if (col.onUpdate) {
      stat += ` ON UPDATE ${col.onUpdate}`;
    }
    if (col.comment) {
      stat += ` COMMENT '${col.comment}'`;
    }
    return stat;
  }).join(',\n');

  let indexesStat = '';
  let hasPrimary = false;
  if (obj.indexes) {
    indexesStat = Object.entries(obj.indexes).map(([k, v]) => {
      let stat = 'KEY';
      if (v.primary && !hasPrimary) {
        // If there are more than 1 indexes are set as primary, just use the first one
        stat = `PRIMARY KEY`;
        hasPrimary = true;
      } else if (v.unique) {
        stat = 'UNIQUE KEY';
      }
      stat += ` ${k}(${v.columns.map((col) => `\`${col}\``).join(',')})`;
      return stat;
    }).join(',\n');
  }

  const autoIncrement = opts.autoIncrement ? ` AUTO_INCREMENT=${opts.autoIncrement}` : '';
  const tableStat = `ENGINE=${opts.engine}${autoIncrement} DEFAULT CHARSET=utf8;`;

  return `${createStat}(
${columnsStat}${indexesStat ? `,\n${indexesStat}` : ''}
)${tableStat}`;
}

module.exports = {
  json2mysql,
};
