import { ErrorCodes, OperationStatus } from "../../../domain";
import { Commerce } from "../../../domain/commerce.interface";
import { iRepository } from "../../repository";

export const updateCommerceUserCase = async (
  data: Partial<Commerce>,
  commerceRepository: iRepository<Commerce>
): Promise<OperationStatus> => {
  data;
  commerceRepository;
  if (!data.commerceId) {
    throw ErrorCodes.requiredFieldsAreMissing;
  }
  return commerceRepository.update(data);
};
