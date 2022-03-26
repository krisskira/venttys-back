import { Controller, ErrorCodes, OperationStatus } from "../../domain";
import { CommerceUser } from "../../domain/commerceUser.interface";
import { UserRepository } from "../repository/user.repository";
import { updateUserUserCase } from "../user-cases/user/updateUser.userCase";

export const updateUserController: Controller<
  Partial<CommerceUser>,
  Promise<OperationStatus>
> = async (userInfo): Promise<OperationStatus> => {
  if (!userInfo?.auth_id) {
    throw ErrorCodes.requiredFieldsAreMissing;
  }
  const userRepository = new UserRepository();
  return await updateUserUserCase(userInfo, userRepository);
};
