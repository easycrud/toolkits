const {def2mysql, def2pgsql} = require('../lib/converter/db.schema');
const {getUserDef} = require('./helper');

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

test('def2mysql', async () => {
  expect(def2mysql(await getUserDef())).toBe(mysql);
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

test('def2pgsql', async () => {
  expect(def2pgsql(await getUserDef())).toBe(pgsql);
});


test('def2mysql wrong index', async () => {
  const wrongIdx = {
    columns: ['wrong_col'],
  };
  const wrongDef = Object.assign({}, await getUserDef());
  wrongDef.indexes.wrong_idx = wrongIdx;
  expect(() => def2mysql(wrongDef))
    .toThrowError('table indexes include column wrong_col that does not configuire in columns');
});
