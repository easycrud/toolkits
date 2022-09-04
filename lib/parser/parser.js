const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const parseContent = require('./util');

class Parser {
  constructor() {
    this.tables = [];
  }

  getFileName(filePath) {
    const ext = path.extname(filePath);
    const fileName = path.basename(filePath, ext);
    return fileName;
  }

  async parse(filePath) {
    console.log('Parse file path: ', filePath);
    const stat = fs.lstatSync(filePath);
    if (stat.isFile()) {
      await this.parseFile(filePath);
      return;
    }
    if (stat.isDirectory()) {
      const files = fs.readdirSync(filePath);
      const dirPath = filePath[filePath.length - 1] === '/' ? filePath : filePath + '/';
      const tasks = files.map((file) => this.parseFile(dirPath + file));
      await Promise.all(tasks);
      return;
    }
    throw new Error('The file path is invalid');
  }

  async parseFile(filePath) {
    const fileName = this.getFileName(filePath);
    const readFile = promisify(fs.readFile);
    let content = await readFile(filePath, 'utf-8');
    content = JSON.parse(content);
    this.parseContent(content, fileName);
  }

  parseContent(content, fileName) {
    const table = parseContent(content, fileName);
    this.tables.push(table);
  }
}

module.exports = Parser;
