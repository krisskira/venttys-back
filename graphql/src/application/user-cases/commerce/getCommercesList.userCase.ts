import { iRepository } from "../../../application/repository";
import { Commerce } from "../../../domain/commerce.interface";

export const getCommercesListUserCase = async (
  commerceRepository: iRepository<Commerce>
): Promise<Commerce[]> => {
  return await commerceRepository.get();
};
