/**
 * Describe a table column using JSON
 */
interface ColumnDefinition {
  /**
   * Column name
   */
  name: string;
  /**
   * Column type: varchar, int, timestamp, etc.
   */
  type: string;
  /**
   * The length of a column
   */
  length?: number;
  /**
   * If a column is primary key. Default false.
   */
  primary?: boolean;
  /**
   * If a column is set to auto increment.  Default false.
   */
  autoIncrement?: boolean;
  /**
   * If a column is nullable.  Default false.
   */
  nullable?: boolean;
  /**
   * The default content of a column
   */
  default?: any;
  /**
   * The comment of a column
   */
  comment?: string;
  /**
   * The content will be set when a column is on updated. Usually 'CURRENT_TIMESTAMP'
   */
  onUpdate?: string;
  /**
   * The alias of a column, usually used in sql statements and response messages.
   */
  alias?: string;
}

/**
 * Describe a table index using JSON
 */
interface IndexDefinition {
  /**
   * The columns to be indexed. It will be ignored if `column` is set.
   */
  columns: string[];
  /**
   * The columns to be indexed
   */
  column?: string;
  /**
   * If a index is unique. Default false.
   */
  unique?: boolean;
  /**
   * If a index is primary key. Default false.
   */
  primary?: boolean;
}

type columnFormatter = (col: string) => string;

declare namespace toolkits {
  /**
   * Extra options for table definition
   */
  interface TableOptions {
    /**
     * The database that this table belongs to.
     */
    database?: string;
    /**
     * The method use to format the column names. Default camel. 
     * Notice: the alias property will be use first if it is set.
     */
    columnFormatter?: 'snake' | 'camel' | 'kebab' | 'none' | columnFormatter;
    /* The following properties are the extra options for table creation */
    /**
     * If true, drop table if it exists before create. Default false.
     */
    overwrite?: boolean;
    /**
     * Set table engine. Default 'InnoDB'.
     */
    engine?: string;
    /**
     * Set where the auto increment key start from.
     */
    autoIncrement?: number;
  }
  /**
   * Describe a table using JSON
   */
  interface TableDefinition {
    /**
      * The name of a table.
      */
    tableName: string;
    /**
     * The alias of a table.
     */
    alias?: string;
    /**
     * The columns of a table.
     */
    columns: ColumnDefinition[];
    /**
     * The indexes of a table. The oject keys are the index names.
     */
    indexes?: { [key: string]: IndexDefinition[] };
    /**
     * Extra options for table creation
     */
    options?: TableOptions;
  }

  /**
   * Parser: parse and format the table definition using JSON
   */
  class Parser {
    tables: TableDefinition[];
    constructor();
    /**
     * Accept a file contains a table definition or a directory path where the files are table definitions.
     * Parse the files and format, store into this.tables.
     */
    parse(filePath: string): void;
    /**
     * Accept a file which contains a table definition.
     * Parse the file and format, store into this.tables.
     */
    parseFile(filePath: string): void;
    /**
     * Parse a table definition, store it into this.tables.
     */
    parseContent(content: ColumnDefinition[] | TableDefinition, fileName?: string): void;
  }

  /**
   * Convert a table definition JSON to mysql CREATE table sql statement.
   */
  function json2mysql(obj: TableDefinition | string) : string;
}

export = toolkits;