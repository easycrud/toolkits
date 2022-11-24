#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const pkg = require('../package.json');
const Parser = require('../lib/parser');
const {def2mysql, def2pgsql} = require('../lib/converter/db.schema');
const converter = {
  mysql: def2mysql,
  pgsql: def2pgsql,
};

program
  .version(pkg.version)
  .option('-p, --path [path]', 'set file path')
  .option('-o, --out [out]', 'set output file path, default stdout')
  .option('-t, --type [type]', 'set db type, just support mysql and pgsql currently')
  .parse(process.argv);

const config = {
  path: '',
  out: 'stdout',
  type: 'mysql',
};

const options = program.opts();
Object.keys(config).forEach((key) => {
  if (options[key] && typeof options[key] === 'string') {
    config[key] = options[key];
  }
});

if (!config.type) {
  config.type = 'mysql';
}

if (config.path) {
  console.log(`use file path: ${config.path}\n`);
} else {
  console.log(`file path is required\n`);
  process.exit(1);
}

const result = [];
const parser = new Parser();
parser.parse(config.path).then(() => {
  parser.tables.forEach((t) => {
    result.push(converter[config.type](t));
  });

  if (config.out === 'stdout') {
    console.log(result.join('\n\n'));
    process.exit(1);
  }

  fs.writeFile(config.out, result.join('\n\n'), (err) => {
    if (err) {
      console.log('output file error:', err);
      process.exit(1);
    }
    console.log('output file success:', config.out);
    process.exit(0);
  });
}).catch((err) => {
  console.log('parse error:', err);
  process.exit(1);
});


