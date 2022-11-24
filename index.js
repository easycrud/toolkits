module.exports = {
  Parser: require('./lib/parser'),
  def2mysql: require('./lib/converter/db.schema').def2mysql,
  def2pgsql: require('./lib/converter/db.schema').def2pgsql,
  def2jsonschema: require('./lib/converter/json.schema').def2jsonschema,
};
