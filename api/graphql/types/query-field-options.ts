import { ShemaBuilderOptions } from './schema-builder-options';

export type QueryFieldBuilderOptions = PothosSchemaTypes.QueryFieldBuilder<
  PothosSchemaTypes.ExtendDefaultTypes<ShemaBuilderOptions>,
  {}
>;

export type MutationFieldBuilderOptions =
  PothosSchemaTypes.MutationFieldBuilder<
    PothosSchemaTypes.ExtendDefaultTypes<ShemaBuilderOptions>,
    {}
  >;

export type FieldBuilder =
  | MutationFieldBuilderOptions
  | QueryFieldBuilderOptions;
