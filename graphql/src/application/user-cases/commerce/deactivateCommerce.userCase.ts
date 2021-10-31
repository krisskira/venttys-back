import { OperationStatus } from "../../../domain";
import { Commerce } from "../../../domain/commerce.interface";
import { iRepository, iUserRepository } from "../../repository";

export const deactivateCommerceUserCase = async (
  commerceId: string,
  commerceRepository: iRepository<Commerce>,
  userRepository: iUserRepository
): Promise<OperationStatus> => {
  return new Promise<OperationStatus>(async (resolver, rejects) => {
    const promiseCollection: Promise<OperationStatus>[] = [];
    try {
      const users = await userRepository.getUsersByDBCommerceID(commerceId);
      users.forEach((user) => {
        promiseCollection.push(userRepository.deactivate(user.auth_id));
      });
    } catch (error) {}

    promiseCollection.push(commerceRepository.deactivate(commerceId));
    const promisesResult = await Promise.all(promiseCollection);

    if (promisesResult.some((result) => result === "NoCompleted")) {
      rejects("NoCompleted");
    } else {
      resolver("Completed");
    }
  });
};
