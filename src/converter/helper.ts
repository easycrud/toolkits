import {standardize} from '../table-schema';
import {UnstrictTableSchema} from '../table-schema/types';

export default function preprocess(table: UnstrictTableSchema) {
  const std = standardize(table);
  const columnNames = std.columns.map((c) => c.name);
  if (std.indexes) {
    Object.values(std.indexes).forEach((idx) => {
      idx.columns.forEach((col) => {
        if (!columnNames.includes(col)) {
          throw new Error(`table indexes include column ${col} that does not configuire in columns`);
        }
      });
    });
  }
  const opts = {
    overwrite: false,
    engine: 'InnoDB',
    autoIncrement: 0,
    ...std.options,
  };
  return {std, opts};
};
