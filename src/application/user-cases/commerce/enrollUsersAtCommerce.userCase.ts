import { ErrorCodes } from "../../../domain";
import { CommerceUser } from "../../../domain/commerceUser.interface";
import { iUserRepository } from "../../repository";

/**
 * @param UserRepository
 * @param User user to enrol.
 * @returns `ID` Id the user created.
 */
export const enrollUsersAtCommerceUserCase = async (
  userRepository: iUserRepository,
  user: CommerceUser
): Promise<string> => {
  if (
    !user.commerce ||
    !user.email ||
    !user.password ||
    !user.rol ||
    !user.name
  ) {
    throw ErrorCodes.requiredFieldsAreMissing;
  }
  return await userRepository.create(user);
};
