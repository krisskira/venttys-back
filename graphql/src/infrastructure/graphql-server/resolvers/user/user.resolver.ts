import { updateUserController } from "../../../../application/controllers";
import { CommerceUser } from "../../../../domain/commerceUser.interface";
import { iResolver } from "../../interfaces";

const updateUserResolver: iResolver<{ userInfo: CommerceUser }> = async (
  ...[, { userInfo }, context]
) => {
  return await updateUserController(userInfo, context);
};

module.exports = {
  Mutation: {
    updateUser: updateUserResolver,
  },
};
