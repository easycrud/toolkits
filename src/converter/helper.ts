import {standardize} from '../table-schema';
import {UnstrictTableSchema} from '../table-schema/types';

export default function preprocess(schema: UnstrictTableSchema) {
  const std = standardize(schema);
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
    engine: 'InnoDB',
    autoIncrement: 0,
    ...std.options?.sql,
  };
  return {std, opts};
};
