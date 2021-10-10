import { GraphQLScalarType } from "graphql";
import { GraphQLUpload } from "graphql-upload";

const Json = new GraphQLScalarType({
  name: "JSON",
  description: "Mapping to JSON Type or Any",
  serialize(value) {
    return JSON.stringify(value);
  },
  parseValue(value) {
    return JSON.parse(value);
  },
});

module.exports = {
  Upload: GraphQLUpload,
  JSON: Json,
};
