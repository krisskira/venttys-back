import { CommerceRepository } from "../../application/repository/commerce.reposirory";
import {
  createCommerceUserCase,
  deactivateCommerceUserCase,
  enrollUsersAtCommerceUserCase,
  getCommerceByPhoneNumberUserCase,
  getCommercesListUserCase,
  getUsersByCommerceUserCase,
  removeUserOfCommerceUserCase,
  updateCommerceUserCase,
} from "../../application/user-cases/commerce";
import { Controller, OperationStatus } from "../../domain";
import { Commerce } from "../../domain/commerce.interface";
import { CommerceUser } from "../../domain/commerceUser.interface";
import { UserRepository } from "../repository/user.repository";

export const getCommercesController: Controller<
  void,
  Promise<Commerce[]>
> = async (): Promise<Commerce[]> => {
  const repository = new CommerceRepository();
  return await getCommercesListUserCase(repository);
};

export const getCommerceByPhoneNumberController: Controller<
  string,
  Promise<Commerce[]>
> = async (commercePhoneNumber): Promise<Commerce[]> => {
  const repository = new CommerceRepository();
  return await getCommerceByPhoneNumberUserCase(
    repository,
    commercePhoneNumber!
  );
};

export const createCommerceController: Controller<
  Commerce,
  Promise<string>
> = async (commerceInfo): Promise<string> => {
  const repository = new CommerceRepository();
  return await createCommerceUserCase(repository, commerceInfo!);
};

export const deactivateCommerceController: Controller<
  string,
  Promise<OperationStatus>
> = async (commerceId): Promise<OperationStatus> => {
  const commerceRepository = new CommerceRepository();
  const userRepository = new UserRepository();
  return await deactivateCommerceUserCase(
    commerceId!,
    commerceRepository,
    userRepository
  );
};

export const getUsersByCommerceController: Controller<
  string,
  Promise<CommerceUser[]>
> = async (commerceId): Promise<CommerceUser[]> => {
  const userRepository = new UserRepository();
  return await getUsersByCommerceUserCase(userRepository, commerceId!);
};

export const enrollUsersAtCommerceController: Controller<
  CommerceUser,
  Promise<string>
> = async (userinfo): Promise<string> => {
  const userRepository = new UserRepository();
  return await enrollUsersAtCommerceUserCase(userRepository, userinfo!);
};

export const removeUserOfCommerceController: Controller<
  string,
  Promise<OperationStatus>
> = async (userId): Promise<OperationStatus> => {
  const userRepository = new UserRepository();
  return await removeUserOfCommerceUserCase(userId!, userRepository);
};

export const updateCommerceController: Controller<
  Partial<Commerce>,
  Promise<OperationStatus>
> = async (commerceInfo): Promise<OperationStatus> => {
  const commerceRepository = new CommerceRepository();
  return await updateCommerceUserCase(commerceInfo!, commerceRepository);
};
