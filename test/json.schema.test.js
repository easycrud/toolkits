const {def2jsonschema, def2formily} = require('../lib/converter/json.schema');
const {getUserDef} = require('./helper');

test('def2jsonschema', async () => {
  expect(def2jsonschema(await getUserDef())).toStrictEqual({
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

test('def2formily', async () => {
  expect(def2formily(await getUserDef())).toStrictEqual({
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
