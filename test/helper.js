const Parser = require('../src/parser');

async function getUserDef() {
  const parser = new Parser();
  await parser.parseFile('test/schemas/user.json');
  return parser.tables[0];
};

module.exports = {
  getUserDef,
};
