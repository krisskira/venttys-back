/* eslint-disable no-case-declarations */
import { EventEmitter } from "events";
import { iLogger } from "../../interfaces/logger.interface";
import { ProductOwnerRepository as ProductOwnerRepository } from "../../interfaces/commerce.repository.interface";
import { firebaseDB } from "../../firebase";
import { BankAccount, CommerceScheduleDate, Commerce, Order, OrderDetail, Product, Zones, PaymentMethod } from "../../interfaces/commerce.interface";
import { BotEntity } from "../domain/bot.entity";
import { formatTime } from "../../utils/formatTime";
import { BotSessionVar } from "../domain/bot.session.entity";
import { genRamdonString } from "../../utils/genRandomString";

export class VenttysRepository implements ProductOwnerRepository<Commerce, Order> {
    public readonly TAG = "VenttysRepository";
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
        const data = order as any;

        // {
        //     key: 'session_var_products_selected',
        //     content: '[{"name":"Hot DOG","normal_price":"12500."}]',
        // }

        // {
        //     key: 'session_var_quantity_product_selected',
        //     content: '["1"]',
        // }

        // {
        //     key: 'session_var_client_name',
        //     content: 'Crhistin',
        // }

        // {
        //     key: 'session_var_payment_method_selected',
        //     content: 'Transferencia Bancaria',
        // }

        // const sessionVars = data.vars as BotSessionVar[];
        // const orderData = sessionVars.reduce<Record<string, string>>((obj, _sessionVar) =>
        //     ({ ...obj, [_sessionVar.key]: _sessionVar.content }), {} as any);
        // const products = JSON.parse(orderData["session_var_quantity_product_selected"]) as { name: string, normal_price: string }[];
        // const productNumber = JSON.parse(orderData["session_var_products_selected"]) as string[];
        // const products_detail: OrderDetail[] = products.map((product, index) => {
        //     return {
        //         prodcut_id: genRamdonString(5),
        //         product_name: product.name,
        //         note: "Notes",
        //         product_price: parseFloat(product.normal_price) * parseInt(productNumber[index]),
        //         quantity: parseInt(productNumber[index])
        //     };
        // });

        // const _order = {
        //     address: orderData[""] || "",
        //     cancel_reason: null,
        //     client: orderData["session_var_client_name"],
        //     close_at: 0,
        //     commerce: customerPhoneNumber,
        //     created_at: Date.now(),
        //     phone: order.phone,
        //     products_detail,
        //     status: "waiting",
        //     total: 1000,
        //     zone: orderData["session_var_client_delivery_zones"],
        //     payment_method: orderData["session_var_payment_method_selected"]
        // };

        const _order = {
            address: "Calle 1",
            cancel_reason: null,
            client: "Crhistian",
            close_at: 0,
            commerce: customerPhoneNumber,
            created_at: Date.now(),
            phone: "573183919187@c.us",
            products_detail:[{
                prodcut_id: genRamdonString(5),
                product_name: "Hamburgesa",
                note: "Notes",
                product_price: 1000,
                quantity: 1
            }],
            status: "waiting",
            total: 1000,
            zone: "Centro",
            payment_method: "Efectivo"
        };

        await this.firebaseCommerceReference
            .collection("orders")
            .doc(await this.getOrdenId(/*customerPhoneNumber*/))
            .create(_order);
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

    async getInfo(): Promise<Commerce> {
        const commerceRef = await this.firebaseCommerceReference.get();
        return <Commerce>commerceRef.data();
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

    async getPaymentMethods(): Promise<PaymentMethod[]> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any   
        const paymentMethods = (await this.getInfo()).payment_methods;
        const methods = paymentMethods.map(({ name }) => name);
        return paymentMethods;
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
            case "fixed-message":
                collectionData = [
                    {
                        "waiting": "Espera",
                        "cooking": "Preparación",
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