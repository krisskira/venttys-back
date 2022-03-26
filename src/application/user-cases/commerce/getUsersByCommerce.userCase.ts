import { iUserRepository } from "../../../application/repository";
import { CommerceUser } from "../../../domain/commerceUser.interface";

/**
 * Get list of `Users` by database Id the commerce.
 * @param commerceRepository
 * @param userRepository
 * @param commerceId Database Id the commerce.
 */
export const getUsersByCommerceUserCase = async (
  userRepository: iUserRepository,
  commerceId: string
): Promise<CommerceUser[]> => {
  return await userRepository.getUsersByDBCommerceID(commerceId);
};
