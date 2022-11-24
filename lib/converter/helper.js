module.exports = function checkAndParse(obj) {
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
};
