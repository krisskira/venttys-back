import {
    Commerce,
    CommerceScheduleDate,
} from "../../domain/commerce.interface";
import { firebaseDB } from "../../infrastructure/firebase";
import { DayName, DaysCode, ErrorCodes, OperationStatus } from "./../../domain";
import { iRepository } from "./repository.interface";

export class CommerceRepository implements iRepository<Commerce> {
    async get(): Promise<Commerce[]> {
        return new Promise<Commerce[]>(async (resolve, reject) => {
            try {
                const commercesQueryResult = await firebaseDB
                    .collection("commerces")
                    .get();
                const commerces = commercesQueryResult.docs.map<Commerce>(
                    (c) => <Commerce>c.data()
                );
                resolve(commerces);
            } catch (error) {
                reject(error);
            }
        });
    }

    async getById(id: string): Promise<Commerce> {
        return new Promise<Commerce>(async (resolve, reject) => {
            try {
                const commercesDoc = await firebaseDB
                    .collection("commerces")
                    .doc(id)
                    .get();
                if (!commercesDoc.exists) {
                    reject(ErrorCodes.commerceNotFound);
                    return;
                }
                resolve(<Commerce>commercesDoc.data());
            } catch (error) {
                reject(error);
            }
        });
    }

    async getByCommercePhone(
        commercePhoneNumber: string | number
    ): Promise<Commerce[]> {
        return new Promise<Commerce[]>(async (resolve, reject) => {
            try {
                const commercesQueryResult = await firebaseDB.collection("commerces");
                const commerces = await commercesQueryResult
                    .where("phone", "==", commercePhoneNumber)
                    .get();
                if (!commerces.size) {
                    reject(ErrorCodes.commerceNotFound);
                    return;
                }
                const commercesData = commerces.docs.map<Commerce>(
                    (commerce) => <Commerce>commerce.data()
                );

                resolve(commercesData);
            } catch (error) {
                reject(error);
            }
        });
    }

    async create(commerceInfo: Commerce): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            const commerceData: Commerce = {
                ...commerceInfo,
                is_enable: true,
                commerce_status: "Close",
                delivery_price: 0,
                delivery_time: "0 min",
                paymentMehods: [],
                messages: this.genCommerceMessages(),
                schedules: this.genWeekDays(),
            };

            try {
                const commercesQueryResult = await firebaseDB
                    .collection("commerces")
                    .doc(commerceInfo.phone)
                    .create(commerceData);
                // await Promise.all([
                //     commercesQueryResult.collection('bank_accounts').get(),
                //     commercesQueryResult.collection('orders').get(),
                //     commercesQueryResult.collection('zones').get(),
                //     commercesQueryResult.collection('products').get(),
                //     commercesQueryResult.collection('product_categories').get()
                // ])
                resolve(commerceInfo.phone);
            } catch (error) {
                reject(error);
            }
        });
    }

    async update(data: Partial<Commerce>): Promise<OperationStatus> {
        return new Promise<OperationStatus>(async (resolve, reject) => {
            try {
                const { commerceId = "", ...commerce } = data
                await firebaseDB
                    .collection("commerces")
                    .doc(commerceId)
                    .update(commerce);
                resolve("Completed");
            } catch (error) {
                reject(error);
            }
        });
    }

    async deactivate(
        commercePhoneNumber: string | number
    ): Promise<OperationStatus> {
        return new Promise<OperationStatus>(async (resolve, reject) => {
            try {
                const commercesQueryResult = await firebaseDB
                    .collection("commerces")
                    .where("phone", "==", commercePhoneNumber)
                    .get();
                if (!!commercesQueryResult.docs.length) {
                    await commercesQueryResult.docs[
                        commercesQueryResult.docs.length
                    ].ref.set({ is_enable: false }); // .delete();
                    resolve("Completed");
                }
                resolve("NoCompleted");
            } catch (error) {
                reject(error);
            }
        });
    }

    private genWeekDays(): CommerceScheduleDate[] {
        return DaysCode.map<CommerceScheduleDate>((d, i) => ({
            code: d,
            name: DayName[i],
            number_day: i + 1,
            is_enable: false,
            open: {
                hour: 0,
                minute: 0,
            },
            close: {
                hour: 0,
                minute: 0,
            },
        }));
    }

    private genCommerceMessages(): Commerce["messages"] {
        return {
            open: {
                is_enable: false,
                value: "",
            },
            await: {
                is_enable: false,
                value: "",
            },
            close: {
                is_enable: false,
                value: "",
            },
        };
    }
}
