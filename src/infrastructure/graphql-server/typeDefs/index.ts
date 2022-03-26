import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs } from "@graphql-tools/merge";
import path from "path";

const typesArray = loadFilesSync(path.join(__dirname, "./**/*.type.*"), {
  extensions: ["graphqls"],
  ignoreIndex: true,
  recursive: true,
});

export const typeDefs = mergeTypeDefs(typesArray);
