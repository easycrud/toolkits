const Parser = require('../lib/parser');

test('parseContent empty array content', () => {
  const parser = new Parser();
  expect(() => parser.parseContent([], 'example'))
    .toThrowError('table columns configure error');
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
    'pk': ['username'],
  });
});

test('parseContent empty object content', () => {
  console.error = jest.fn();
  const parser = new Parser();
  expect(() => parser.parseContent({columns: []}, 'example'))
    .toThrowError('table columns configure error');
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
    'pk': ['username'],
  });
});

test('parseFile invalid file path', async () => {
  expect.assertions(1);
  try {
    const parser = new Parser();
    await parser.parseFile('test/schemas/invalid.json');
  } catch (e) {
    expect(e.message).toMatch(`no such file or directory, open 'test/schemas/invalid.json'`);
  }
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
    'pk': ['username'],
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
    'pk': ['username'],
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
    'pk': ['username'],
  });
});
