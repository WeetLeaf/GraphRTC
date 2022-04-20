module.exports = {
  client: {
    excludes: ["./**/__generated__/*.ts"],
    service: {
      name: "GraphRTC",
      localSchemaFile: "./schema.gql",
    },
  },
};
