import { join } from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import { lexicographicSortSchema, printSchema } from 'graphql';
import { builder } from './builder';
import './resolvers/index';

export const schema = builder.toSchema({});

if (process.env.NODE_ENV === 'development') {
  const schemaAsString = printSchema(lexicographicSortSchema(schema));
  console.info('🖊 Write schema');
  const folderPath = join(process.cwd());
  mkdirSync(folderPath, { recursive: true });
  writeFileSync(join(folderPath, 'schema.gql'), schemaAsString);
}
