const {def2jsonschema, def2formily} = require('../lib/converter/json.schema');

const obj = {
  tableName: 'users',
  columns: [
    {
      'name': 'id',
      'type': 'int',
      'length': 11,
      'primary': true,
      'autoIncrement': true,
    },
    {
      'name': 'username',
      'type': 'varchar',
      'length': 256,
      'default': '',
      'comment': '用户名',
    },
    {
      'name': 'email',
      'type': 'varchar',
      'length': 512,
      'comment': '邮箱',
    },
    {
      'name': 'password',
      'type': 'varchar',
      'length': 512,
      'comment': '密码',
    },
    {
      'name': 'update_time',
      'type': 'timestamp',
      'default': 'CURRENT_TIMESTAMP',
      'onUpdate': 'CURRENT_TIMESTAMP',
      'comment': '更新时间',
      'alias': 'updateTime',
    },
  ],
  indexes: {
    idx_user: {
      columns: ['username', 'email'],
      unique: true,
    },
    idx_email: {
      column: 'email',
    },
  },
};

const Parser = require('../lib/parser');
const parser = new Parser();
parser.parseContent(obj);

test('def2jsonschema', () => {
  expect(def2jsonschema(parser.tables[0])).toStrictEqual({
    'type': 'object',
    'properties': {
      'id': {
        'type': 'number',
        'title': 'id',
      },
      'username': {
        'type': 'string',
        'title': '用户名',
      },
      'email': {
        'type': 'string',
        'title': '邮箱',
      },
      'password': {
        'type': 'string',
        'title': '密码',
      },
      'updateTime': {
        'type': 'string',
        'title': '更新时间',
      },
    },
  });
});

test('def2formily', () => {
  expect(def2formily(parser.tables[0])).toStrictEqual({
    'type': 'object',
    'properties': {
      'id': {
        'type': 'number',
        'title': 'id',
        'x-decorator': 'FormItem',
        'x-component': 'InputNumber',
      },
      'username': {
        'type': 'string',
        'title': '用户名',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
      'email': {
        'type': 'string',
        'title': '邮箱',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
      'password': {
        'type': 'string',
        'title': '密码',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
      'updateTime': {
        'type': 'string',
        'title': '更新时间',
        'x-decorator': 'FormItem',
        'x-component': 'DatePicker',
        'x-component-props': {'showTime': true},
      },
    },
  });
});
