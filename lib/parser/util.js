function parseContent(content, fileName) {
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
  return {
    tableName: fileName,
    ...content,
    get pk() {
      const pk = Object.values(this.indexes || {}).filter((index) => {
        return index.primary;
      });
      if (pk.length > 0) {
        return pk[0].columns;
      }
      return [];
    },
  };
}

module.exports = parseContent;
