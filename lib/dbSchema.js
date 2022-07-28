function checkAndParse(obj) {
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
  return {tableName, columns, opts};
}

function json2mysql(obj) {
  const {tableName, columns, opts} = checkAndParse(obj);
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

function json2pgsql(obj) {
  const {tableName, columns, opts} = checkAndParse(obj);
  let createStat = `CREATE TABLE IF NOT EXISTS ${tableName}`;
  if (opts.overwrite) {
    createStat = `DROP TABLE IF EXISTS ${tableName};\n${createStat}`;
  }

  let autoIncrCol = '';
  let columnStat = columns.map((col) => {
    let stat = `${col.name} `;
    if (col.type) {
      stat += col.type.toUpperCase();
    }
    if (col.length) {
      stat += `(${col.length})`;
    }
    if (col.autoIncrement) {
      stat += ' SERIAL';
      autoIncrCol = col.name;
    }
    if (!col.nullable) {
      stat += ' NOT NULL';
    }
    if (col.default !== null && col.default !== undefined) {
      if (col.default.toUpperCase() === 'CURRENT_TIMESTAMP') {
        stat += ` DEFAULT ${col.default}`;
      } else {
        stat += ` DEFAULT '${col.default}'`;
      }
    }
    if (col.onUpdate) {
      stat += ` ON UPDATE ${col.onUpdate}`;
    }

    return stat;
  }).join(',\n');
  const commentStat = columns.filter((col) => col.comment)
    .map((col) => `COMMENT ON COLUMN ${tableName}.${col.name} IS '${col.comment}'`)
    .join(';\n');

  const indexStat = [];
  const hasPrimary = false;
  if (obj.indexes) {
    Object.entries(obj.indexes).forEach(([k, v]) => {
      const colStr = v.columns.join(',');
      let stat = 'INDEX';
      if (v.primary && !hasPrimary) {
        // If there are more than 1 indexes are set as primary, just use the first one
        columnStat += `,\nCONSTRAINT ${tableName}_pk PRIMARY KEY (${colStr})`;
        return;
      } else if (v.unique) {
        stat = 'UNIQUE INDEX';
      }
      indexStat.push(`CREATE ${stat} ${tableName}_${k} ON ${tableName} (${colStr})`);
    });
  }

  const autoIncrement = opts.autoIncrement && autoIncrCol ?
    `ALTER SEQUENCE ${tableName}_${autoIncrCol}_seq RESTART WITH ${opts.autoIncrement}` : '';

  return `${createStat}(
${columnStat}
);
${indexStat.join(';\n')};
${commentStat};
${autoIncrement}`;
}

module.exports = {
  json2mysql,
  json2pgsql,
};
