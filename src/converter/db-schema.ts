import {UnstrictTableSchema} from '../table-schema/types';
import preprocess from './helper';

export function schemaToMySQL(schema: UnstrictTableSchema) {
  const {std, opts} = preprocess(schema);
  const tableName = std.tableName;
  const columns = std.columns;
  let createStat = `CREATE TABLE IF NOT EXISTS \`${tableName}\``;
  if (opts.dropIfExists) {
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
  if (std.indexes) {
    indexesStat = Object.entries(std.indexes).map(([k, v]) => {
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

export function schemaToPostgreSQL(schema: UnstrictTableSchema) {
  const {std, opts} = preprocess(schema);
  const tableName = std.tableName;
  const columns = std.columns;
  let createStat = `CREATE TABLE IF NOT EXISTS ${tableName}`;
  if (opts.dropIfExists) {
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

  const indexStat: string[] = [];
  const hasPrimary = false;
  if (std.indexes) {
    Object.entries(std.indexes).forEach(([k, v]) => {
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
