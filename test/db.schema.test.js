const {def2mysql, def2pgsql} = require('../lib/converter/db.schema');

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

const mysql = `CREATE TABLE IF NOT EXISTS \`users\`(
\`id\` INT(11) AUTO_INCREMENT NOT NULL,
\`username\` VARCHAR(256) NOT NULL DEFAULT '' COMMENT '用户名',
\`email\` VARCHAR(512) NOT NULL COMMENT '邮箱',
\`password\` VARCHAR(512) NOT NULL COMMENT '密码',
\`update_time\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
UNIQUE KEY idx_user(\`username\`,\`email\`),
KEY idx_email(\`email\`),
PRIMARY KEY id(\`id\`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;`;

const Parser = require('../lib/parser');
const parser = new Parser();
parser.parseContent(obj);

test('def2mysql', () => {
  expect(def2mysql(parser.tables[0])).toBe(mysql);
});

const pgsql = `CREATE TABLE IF NOT EXISTS users(
id INT(11) SERIAL NOT NULL,
username VARCHAR(256) NOT NULL DEFAULT '',
email VARCHAR(512) NOT NULL,
password VARCHAR(512) NOT NULL,
update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT users_pk PRIMARY KEY (id)
);
CREATE UNIQUE INDEX users_idx_user ON users (username,email);
CREATE INDEX users_idx_email ON users (email);
COMMENT ON COLUMN users.username IS '用户名';
COMMENT ON COLUMN users.email IS '邮箱';
COMMENT ON COLUMN users.password IS '密码';
COMMENT ON COLUMN users.update_time IS '更新时间';
`;

test('def2pgsql', () => {
  expect(def2pgsql(parser.tables[0])).toBe(pgsql);
});


test('def2mysql wrong index', () => {
  const wrongIdx = {
    columns: ['wrong_col'],
  };
  const wrongObj = Object.assign({}, obj);
  wrongObj.indexes.wrong_idx = wrongIdx;
  const parser = new Parser();
  parser.parseContent(wrongObj);
  expect(() => def2mysql(parser.tables[0]))
    .toThrowError('table indexes include column wrong_col that does not configuire in columns');
});
