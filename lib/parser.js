const fs = require('fs');
const path = require('path');
const {promisfy} = require('util');

class Parser {
  constructor(filePath) {
    this.tables = [];

    if (filePath) {
      this.parse(filePath);
    }
  }

  getFileName(filePath) {
    const ext = path.extname(filePath);
    const fileName = path.basename(filePath, ext);
    return fileName;
  }

  async parse(filePath) {
    try {
      filePath = filePath.join(__dirname, filePath);
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
    } catch (err) {
      console.log('Parse file failed: ', err);
    }
  }

  async parseFile(filePath) {
    const fileName = this.getFileName(filePath);
    try {
      const readFile = promisfy(fs.readFile);
      const content = await readFile(filePath);
      content = JSON.parse(content);
      if (Array.isArray(content)) {
        this.tables.push(content);
        return;
      }
    } catch (err) {
      console.log(`Parse file ${filePath} content error: `, err);
    }
  }
}

module.exports = Parser;
