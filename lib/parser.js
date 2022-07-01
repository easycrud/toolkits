const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

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
    try {
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
      console.error('Parse file failed: ', err);
    }
  }

  async parseFile(filePath) {
    const fileName = this.getFileName(filePath);
    try {
      const readFile = promisify(fs.readFile);
      let content = await readFile(filePath, 'utf-8');
      content = JSON.parse(content);
      this.parseContent(content, fileName);
    } catch (err) {
      console.log(err);
      console.error(`Parse file ${filePath} error: `, err);
    }
  }

  parseContent(content, fileName) {
    try {
      if (Array.isArray(content)) {
        content = {
          tableName: fileName,
          columns: content,
        };
      }

      // Preprocess
      const columns = content.columns;
      if (!Array.isArray(columns) || columns.length === 0) {
        throw new Error('table columns configure error');
      }

      content.indexes = content.indexes ? content.indexes : {};
      const primary = columns.filter((col) => col.primary);
      if (primary.length > 0) {
        // If a column is set as primary, add it into the indexes.
        const pri = primary[0];
        content.indexes[pri.name] = {primary: true};
      }
      const indexes = content.indexes;
      Object.entries(indexes).forEach(([index, conf]) => {
        if (!conf.column && !conf.columns) {
          // If column and columns are not configured, try to use a column named index key.
          content.indexes[index].columns = [index];
          return;
        }
        if (conf.column) {
          // Set columns using column property so that the column property can be ignored in later processing.
          content.indexes[index].columns = [conf.column];
        }
      });
      this.tables.push({
        tableName: fileName,
        ...content,
      });
    } catch (err) {
      console.error(`Parse file ${fileName} content err:`, err.message);
    }
  }
}

module.exports = Parser;
