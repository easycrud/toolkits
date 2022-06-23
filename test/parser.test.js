const Parser = require('../lib/parser');

test('parseContent empty array content', () => {
  console.error = jest.fn();
  const parser = new Parser();
  parser.parseContent([], 'example');
  expect(console.error.mock.calls[0][1]).toContain('table columns configure error');
});

test('parseContent array content', () => {
  const parser = new Parser();
  parser.parseContent([{
    'name': 'username',
    'type': 'varchar',
    'length': 256,
    'nullable': false,
    'primary': true,
    'default': '',
    'comment': '用户名',
  }], 'example');
  expect(parser.tables[0]).toEqual({
    'tableName': 'example',
    'columns': [{
      'name': 'username',
      'type': 'varchar',
      'length': 256,
      'nullable': false,
      'primary': true,
      'default': '',
      'comment': '用户名',
    }],
    'indexes': {
      username: {
        columns: ['username'],
        primary: true,
      },
    },
  });
});

test('parseContent empty object content', () => {
  console.error = jest.fn();
  const parser = new Parser();
  parser.parseContent({columns: []}, 'example');
  expect(console.error.mock.calls[0][1]).toContain('table columns configure error');
});

test('parseContent object content', () => {
  const parser = new Parser();
  parser.parseContent({
    tableName: 'exampleName',
    columns: [{
      'name': 'username',
      'type': 'varchar',
      'length': 256,
      'nullable': false,
      'primary': true,
      'default': '',
      'comment': '用户名',
    }],
    indexes: {
      test: {
        column: 'username',
      },
    },
  }, 'example');
  expect(parser.tables[0]).toEqual({
    'tableName': 'exampleName',
    'columns': [{
      'name': 'username',
      'type': 'varchar',
      'length': 256,
      'nullable': false,
      'primary': true,
      'default': '',
      'comment': '用户名',
    }],
    'indexes': {
      username: {
        columns: ['username'],
        primary: true,
      },
      test: {
        column: 'username',
        columns: ['username'],
      },
    },
  });
});

test('parseFile invalid file path', async () => {
  console.error = jest.fn();
  const parser = new Parser();
  await parser.parseFile('test/schemas/invalid.json');
  expect(console.error.mock.calls[0][0]).toContain(`Parse file test/schemas/invalid.json error`);
});

test('parseFile', async () => {
  const parser = new Parser();
  await parser.parseFile('test/schemas/example.json');
  expect(parser.tables[0]).toEqual({
    'tableName': 'example',
    'columns': [{
      'name': 'username',
      'type': 'varchar',
      'length': 256,
      'nullable': false,
      'primary': true,
      'default': '',
      'comment': '用户名',
    }],
    'indexes': {
      username: {
        columns: ['username'],
        primary: true,
      },
    },
  });
});

test('parse file', async () => {
  const parser = new Parser();
  await parser.parse('test/schemas/example.json');
  expect(parser.tables[0]).toEqual({
    'tableName': 'example',
    'columns': [{
      'name': 'username',
      'type': 'varchar',
      'length': 256,
      'nullable': false,
      'primary': true,
      'default': '',
      'comment': '用户名',
    }],
    'indexes': {
      username: {
        columns: ['username'],
        primary: true,
      },
    },
  });
});

test('parse dir', async () => {
  const parser = new Parser();
  await parser.parse('test/schemas');
  expect(parser.tables[0]).toEqual({
    'tableName': 'example',
    'columns': [{
      'name': 'username',
      'type': 'varchar',
      'length': 256,
      'nullable': false,
      'primary': true,
      'default': '',
      'comment': '用户名',
    }],
    'indexes': {
      username: {
        columns: ['username'],
        primary: true,
      },
    },
  });
});
