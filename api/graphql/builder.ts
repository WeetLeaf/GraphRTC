import SchemaBuilder from "@pothos/core";
import SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
import ValidationPlugin from "@pothos/plugin-validation";
import { ShemaBuilderOptions } from "./types";

export const builder = new SchemaBuilder<ShemaBuilderOptions>({
  plugins: [SimpleObjectsPlugin, ValidationPlugin],
  defaultInputFieldRequiredness: true,
});

// This initializes the query and mutation types so that we can add fields to them dynamically:
builder.queryType({});
builder.mutationType({});
builder.subscriptionType({});

builder.scalarType("Date", {
  serialize: (date) => date.toISOString(),
  parseValue: (date) => new Date(date as string),
});
