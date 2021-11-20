/* eslint-disable no-case-declarations */
import { iLogger } from "../../interfaces/logger.interface";
import { firebaseDB } from "../../firebase";
import { BankAccount, CommerceScheduleDate, iCommerce, Product, Zones } from "../../interfaces/commerce.interface";
import { BotEntity } from "../domain/bot.entity";
import { formatTime } from "../../utils/formatTime";

export class CommerceRepository {
    public readonly phoneNumber: string;
    private readonly firebaseCommerceReference: FirebaseFirestore.DocumentReference;
    private readonly logger: iLogger;

    constructor(phoneNumber: string, logger: iLogger) {
        this.firebaseCommerceReference = firebaseDB
            .collection("commerces")
            .doc(phoneNumber);
        this.phoneNumber = phoneNumber;
        this.logger = logger;
        this.firebaseCommerceReference.collection("commerces")
            .doc(phoneNumber)
            .collection("orders").onSnapshot((snapshot) => {
                console.log("Documento Cambio: ", snapshot.docs.map(d => d.data()));
            }, (error) => {
                console.log("***-> Ups! Error: ", error);
            });
    }

    async getInfo(): Promise<iCommerce> {
        const commerceRef = await this.firebaseCommerceReference.get();
        return <iCommerce>commerceRef.data();
    }

    async getProducts(): Promise<Product[]> {
        const commerceRef = await this.firebaseCommerceReference
            .collection("products")
            .get();
        const products = commerceRef.docs
            .map(p => <Product>p.data());
        return products;
    }

    async getZones(): Promise<Zones[]> {
        const commerceRef = await this.firebaseCommerceReference
            .collection("zones")
            .where("is_enable", "==", true)
            .get();
        return commerceRef.docs.map(p => <Zones>p.data());
    }

    async getBankAccounts(): Promise<BankAccount[]> {
        const commerceRef = await this.firebaseCommerceReference.collection("bank_accounts").get();
        return commerceRef.docs.map(p => <BankAccount>p.data());
    }

    async getSchedules(): Promise<CommerceScheduleDate[]> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any   
        const schedules = (await this.getInfo()).schedules as any;
        const array: CommerceScheduleDate[] = [];
        for (const dayName in schedules) {
            const day = schedules[dayName] as CommerceScheduleDate;
            if (day.is_enable) {
                array.push({
                    ...day,
                    openString: formatTime(day.open),
                    closeString: formatTime(day.close)
                });
            }
        }
        return array;
    }

    async getPaymentMethods(): Promise<string[]> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any   
        const paymentMethods = (await this.getInfo()).payment_methods;
        const methods = paymentMethods.map(({ name }) => name);
        console.log("***-> X->Payment methods: ", methods);
        return [...methods];
    }

    async getResolveEntity<T>(entity: BotEntity): Promise<T | T[]> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let collectionData: any[] = [];

        switch (entity.collectionName) {
            case "zones":
                collectionData = await this.getZones();
                break;
            case "bank_accounts":
                collectionData = await this.getBankAccounts();
                break;
            case "products":
                collectionData = await this.getProducts();
                break;
            case "schedules":
                collectionData = await this.getSchedules();
                break;
            case "payment_methods":
                collectionData = await this.getPaymentMethods();
                break;
            case "commerces":
                collectionData = [await this.getInfo()];
                break;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const _data = collectionData.map((item) => entity
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .path.reduce<any>((anyResp, keys, index) => {
                const defVal = entity.defaultValue || "Undefined";
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let tempValue: any = defVal;
                keys.split("|").forEach((key, _index) => {
                    if (_index > 0) {
                        if (tempValue instanceof Array) {
                            tempValue = tempValue.map((v) => v[key] || defVal);
                        } else {
                            tempValue = tempValue[key] || defVal;
                        }
                    } else {
                        tempValue = item[key] || defVal;
                    }
                });

                if (entity.type === "array") {
                    return index === 0 ? [tempValue] : [...anyResp, tempValue];
                }

                if (entity.type === "object") {
                    return index === 0 ? { [keys]: tempValue } : { ...anyResp, [keys]: tempValue };
                }

                if (entity.type === "array-object") {
                    return index === 0 ? [{ [keys]: tempValue }] : [...anyResp, { [keys]: tempValue }];
                }

                return index === 0 ? tempValue : [anyResp, tempValue].join(" ");

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }, "" as any) || item || entity.defaultValue);

        this.logger.log({
            type: "DEBUG",
            tag: "CommerceRepository",
            msg: "Commerce data to variable" +
                `\nEntity: ${entity.code}` +
                `\nType: ${entity.type}` +
                `\nContent:\n${JSON.stringify(_data)}`
        });

        return _data;
    }
}