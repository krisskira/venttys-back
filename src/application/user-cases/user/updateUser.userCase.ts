import { ErrorCodes, OperationStatus } from "../../../domain";
import { CommerceUser } from "../../../domain/commerceUser.interface";
import { iUserRepository } from "../../repository";

export const updateUserUserCase = async (
  data: Partial<CommerceUser>,
  userRepository: iUserRepository
): Promise<OperationStatus> => {
  if (!data.auth_id) {
    throw ErrorCodes.requiredFieldsAreMissing;
  }
  return userRepository.update(data);
};
