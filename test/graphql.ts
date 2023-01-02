import {makeExecutableSchema} from '@graphql-tools/schema';
import {expect, test} from '@jest/globals';
import {tableToGraphQL} from '../src/converter';
import {getUserDef} from './helper';

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

test('tableToGraphQL', async () => {
  expect(tableToGraphQL(await getUserDef())).toEqual(schema);
});
