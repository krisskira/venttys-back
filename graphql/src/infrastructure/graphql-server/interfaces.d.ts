import { GraphQLResolveInfo } from "graphql";

import { iApplicationContext } from "../interfaces/application.interface";

export type iResolver<TArgsInput> = (
  parent: unknown,
  args: TArgsInput,
  context?: iApplicationContext,
  info?: GraphQLResolveInfo
) => unknown;
