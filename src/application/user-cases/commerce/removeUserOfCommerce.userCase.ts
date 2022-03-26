import { ErrorCodes, OperationStatus } from "../../../domain";
import { iUserRepository } from "../../repository";

export const removeUserOfCommerceUserCase = async (
  userId: string,
  userRepository: iUserRepository
): Promise<OperationStatus> => {
  if (!userRepository.delete) {
    throw ErrorCodes.badImplementation;
  }
  if (!userId) {
    throw ErrorCodes.requiredFieldsAreMissing;
  }
  return await userRepository.delete(userId);
};
