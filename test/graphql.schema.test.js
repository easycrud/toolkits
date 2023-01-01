const {makeExecutableSchema} = require('@graphql-tools/schema');
const {def2graphql} = require('../src/converter/graphql.schema');
const {getUserDef} = require('./helper');

const schema = makeExecutableSchema({
  typeDefs: `
    type Users {
      id: ID!
      username: String
      email: String
      password: String
      updateTime: String
    }
  `,
});

test('def2graphql', async () => {
  expect(def2graphql(await getUserDef())).toEqual(schema);
});
