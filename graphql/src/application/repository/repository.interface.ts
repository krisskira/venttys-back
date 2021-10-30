import { OperationStatus } from "@appDomain/";

import { OperationStatus } from "../../domain";
import { CommerceUser } from "../../domain/commerceUser.interface";

export type ObjectType = { [key: string]: unknown };

export interface iRepository<T> {
  get: () => Promise<T[]>;
  getById: (id: string) => Promise<T>;
  getByCommercePhone: (id: string | number) => Promise<T[]>;
  create: (data: T) => Promise<string>;
  update: (data: Partial<T>) => Promise<OperationStatus>;
  deactivate: (id: string) => Promise<OperationStatus>;
  delete?: (userId: string) => Promise<OperationStatus>;
}

export interface iUserRepository extends iRepository<CommerceUser> {
  getUsersByEmail: (email: string) => Promise<CommerceUser>;
  getUsersByDBCommerceID: (DBCommerceID: string) => Promise<CommerceUser[]>;
}
