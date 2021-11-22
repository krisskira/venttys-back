/* eslint-disable no-case-declarations */
import { EventEmitter } from "events";
import { iLogger } from "../../interfaces/logger.interface";
import { CommerceRepository as iCommerceRepository } from "../../interfaces/commerce.repository.interface";
import { firebaseDB } from "../../firebase";
import { BankAccount, CommerceScheduleDate, iCommerce, Order, Product, Zones } from "../../interfaces/commerce.interface";
import { BotEntity } from "../domain/bot.entity";
import { formatTime } from "../../utils/formatTime";

export class CommerceRepository implements iCommerceRepository<iCommerce, Order> {
    public readonly TAG = "CommerceRepository";
    public readonly phoneNumber: string;
    private readonly firebaseCommerceReference: FirebaseFirestore.DocumentReference;
    private readonly logger: iLogger;
    private readonly emitterCollectionEvent = new EventEmitter();

    constructor(phoneNumber: string, logger: iLogger) {
        this.phoneNumber = phoneNumber;
        this.logger = logger;
        this.firebaseCommerceReference = firebaseDB
            .collection("commerces")
            .doc(phoneNumber);
        this.firebaseCommerceReference
            .collection("orders")
            .onSnapshot((snapshot) => {
                snapshot.docChanges().map((ordersRef) => {
                    const value = ordersRef.doc.data() as Order;
                    if (ordersRef.type === "modified") {
                        this.emitterCollectionEvent.emit("OrderStatusChange", value.phone, value);
                        this.logger.log({
                            type: "DEBUG",
                            tag: this.TAG,
                            msg: "Order Updated.\n" +
                                `Client: ${value.phone}, Estatus: ${value.status}`
                        });
                    }
                    if (ordersRef.type === "added") {
                        this.logger.log({
                            type: "DEBUG",
                            tag: this.TAG,
                            msg: "New order taked.\n" +
                                `Client: ${value.phone}, Estatus: ${value.status}`
                        });
                    }
                });
            }, (error) => {
                this.logger.log({
                    type: "ERROR",
                    tag: this.TAG,
                    msg: "Observer Order Collection.\n" +
                        error.message
                });
            });
    }

    async runAction(customerPhoneNumber: string, order: Order): Promise<void> {
        await this.firebaseCommerceReference
            .collection("orders")
            .doc(await this.getOrdenId(/*customerPhoneNumber*/))
            .create(order);
    }

    private async getOrdenId(/*customerId: string*/): Promise<string> {
        // return `${customerId}:${Date.now()}`;
        const commerceRef = await this.firebaseCommerceReference
            .collection("orders").get();
        const index = commerceRef.size;
        const date = new Date();
        const year = date.getFullYear().toString().substring(-2);
        return `${date.getDate()}${date.getDate()}${year}-${index}`;
    }

    onEventListen(listener: (customerPhoneNumber: string, order: Order) => void): void {
        this.emitterCollectionEvent.on("OrderStatusChange", (customerPhoneNumber, order) => {
            this.logger.log({
                tag: this.TAG,
                type: "DEBUG",
                msg: "***-> Run OrderStatusChange"
            });
            listener(customerPhoneNumber, order);
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
        const commerceRef = await this.firebaseCommerceReference
            .collection("bank_accounts").get();
        return commerceRef.docs.map(p => <BankAccount>p.data());
    }

    async getOrders(customerPhoneNumber: string): Promise<Order[]> {
        const commerceRef = await this.firebaseCommerceReference
            .collection("orders")
            .where("phone", "==", customerPhoneNumber)
            .get();
        return commerceRef.docs.map(p => <Order>p.data()).sort((a, b) => {
            if (new Date(a.created_at) > new Date(b.created_at)) {
                return 1;
            } else if (new Date(a.created_at) < new Date(b.created_at)) {
                return -1;
            }
            return 0;
        });
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
        return [...methods];
    }


    async getResolveEntity<T>(entity: BotEntity, customerPhoneNumber: string): Promise<T | T[]> {
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
            case "orders":
                collectionData = await this.getOrders(customerPhoneNumber);
                break;
            case "commerces":
                collectionData = [await this.getInfo()];
                break;
            case "fix":
                collectionData = [
                    {
                        "waiting": "Espera",
                        "cooking": "preparación",
                        "finish": "Enviado",
                        "canceled": "Cancelado"
                    }
                ];
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
            tag: this.TAG,
            msg: "Commerce data to variable" +
                `\nEntity: ${entity.code}` +
                `\nType: ${entity.type}` +
                `\nContent:\n${JSON.stringify(_data)}`
        });

        return _data;
    }
}