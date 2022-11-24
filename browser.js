module.exports = {
  parseContent: require('./lib/parser/util'),
  def2jsonschema: require('./lib/converter/json.schema').def2jsonschema,
  def2formily: require('./lib/converter/json.schema').def2formily,
};
