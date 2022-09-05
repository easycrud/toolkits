
function getFormByType(type) {
  switch (type) {
  case 'char':
  case 'varchar':
  case 'tinytext':
  case 'character':
  case 'character varying':
    return {'x-component': 'Input'};
  case 'text':
  case 'mediumtext':
  case 'longtext':
    return {'x-component': 'Textarea'};
  case 'boolean':
    return {'x-component': 'Radio'};
  case 'int':
  case 'tinyint':
  case 'smallint':
  case 'mediumint':
  case 'bigint':
  case 'integer':
  case 'float':
  case 'double':
  case 'real':
  case 'double precision':
    return {'x-component': 'InputNumber'};
  case 'date':
    return {'x-component': 'DatePicker'};
  case 'datetime':
  case 'timestamp':
  case 'timestamp with timezone':
  case 'timestamp without timezone':
    return {'x-component': 'DatePicker', 'x-component-props': {'showTime': true}};
  case 'time':
  case 'time with timezone':
  case 'time without timezone':
    return {'x-component': 'TimePicker'};
  case 'year':
    return {'x-component': 'DatePicker', 'x-component-props': {'picker': 'year'}};
  }
}

function json2formily(obj) {
  if (typeof obj === 'string') {
    try {
      obj = JSON.parse(obj);
    } catch {
      throw new Error('json config is invalid');
    }
  }
  const columns = obj.columns;
  if (!columns || columns.length === 0) {
    throw new Error('table columns is not configuired');
  }
};

module.export = {
  json2formily,
};
