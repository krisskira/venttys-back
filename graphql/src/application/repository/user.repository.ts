import { ErrorCodes } from "../../domain";
import { CommerceUser } from "../../domain/commerceUser.interface";
import { firebaseAuth, firebaseDB } from "../../infrastructure/firebase";
import { OperationStatus } from "./../../domain";
import { iUserRepository } from "./repository.interface";

export class UserRepository implements iUserRepository {
  /**
   *
   * @returns All users in database.
   */
  async get(): Promise<CommerceUser[]> {
    return new Promise<CommerceUser[]>(async (resolve, reject) => {
      try {
        const usersQueryResult = await firebaseDB.collection("users").get();
        const users = usersQueryResult.docs.map<CommerceUser>((u) => {
          const user = <CommerceUser>u.data();
          user.auth_id = u.id;
          return user;
        });
        resolve(users);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get Commerce User filter by Firebase Auth ID
   * @param auth_id
   * @returns User
   */
  async getById(authId: string): Promise<CommerceUser> {
    return new Promise<CommerceUser>(async (resolve, reject) => {
      try {
        const user = await firebaseDB.collection("users").doc(authId).get();
        const usersData = <CommerceUser>user.data();
        usersData.auth_id = user.id;
        resolve(usersData);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * @ignore
   * IMPORTANT!! replace by ´getUsersByDBCommerceID´
   * Get All Commerce Users firter by firebase ID of Commerce collection.
   * @param commerceId
   * @returns CommerceUser
   */
  async getByCommercePhone(): Promise<CommerceUser[]> {
    throw "Replace by getUsersByDBCommerceID.";
  }

  async getUsersByDBCommerceID(DBCommerceID: string): Promise<CommerceUser[]> {
    return new Promise<CommerceUser[]>(async (resolve, reject) => {
      try {
        const usersQueryResult = await firebaseDB.collection("users");
        const users = await usersQueryResult
          .where("commerce", "==", DBCommerceID)
          .get();
        if (!users.size) {
          reject(ErrorCodes.userNotFound);
          return;
        }
        const usersData = users.docs.map<CommerceUser>((u) => {
          const user = <CommerceUser>u.data();
          user.auth_id = u.id;
          return user;
        });
        resolve(usersData);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getUsersByEmail(email: string): Promise<CommerceUser> {
    return new Promise<CommerceUser>(async (resolve, reject) => {
      try {
        const usersQueryResult = await firebaseDB.collection("users");
        const users = await usersQueryResult.where("email", "==", email).get();
        if (!users.size) {
          reject(ErrorCodes.userNotFound);
          return;
        }
        const usersData = users.docs.map<CommerceUser>((u) => {
          const user = <CommerceUser>u.data();
          user.auth_id = u.id;
          return user;
        });
        resolve(usersData[users.size - 1]);
      } catch (error) {
        reject(error);
      }
    });
  }

  async create(data: CommerceUser): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      try {
        if (!data.commerce || !data.email || !data.password) {
          reject(ErrorCodes.requiredFieldsAreMissing);
          return;
        }
        const userAuth = await firebaseAuth.createUser({
          email: data.email,
          password: data.password,
          displayName: data.name,
          phoneNumber: data.phone,
        });
        delete data.password;
        const { password = undefined, ...user } = data;
        await firebaseDB.collection("users").doc(userAuth.uid).set(user);
        resolve(userAuth.uid);
      } catch (error) {
        reject(error);
      }
    });
  }

  async update(data: Partial<CommerceUser>): Promise<OperationStatus> {
    return new Promise<OperationStatus>(async (resolve, reject) => {
      try {
        const { auth_id, ...dataToUpdate } = { ...data };
        if (!auth_id) {
          throw ErrorCodes.requiredFieldsAreMissing;
        }
        await firebaseAuth.updateUser(auth_id, {
          ...dataToUpdate,
        });
        resolve("Completed");
      } catch (error) {
        reject(error);
      }
    });
  }

  deactivate(authId: string): Promise<OperationStatus> {
    return new Promise<OperationStatus>(async (resolve, reject) => {
      try {
        firebaseAuth.revokeRefreshTokens(authId);
        await firebaseAuth.updateUser(authId, {
          disabled: true,
        });
        const usersResult = await firebaseDB
          .collection("users")
          .doc(authId)
          .get();
        await usersResult.ref.set({
          enable: false,
        }); // .delete();
        resolve("Completed");
      } catch (error) {
        reject(error);
      }
    });
  }

  async delete(authId: string): Promise<OperationStatus> {
    await firebaseDB.collection("users").doc(authId).delete();
    await firebaseAuth.deleteUser(authId);
    return "Completed";
  }
}
