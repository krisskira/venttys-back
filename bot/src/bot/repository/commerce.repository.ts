/* eslint-disable no-case-declarations */
import { EventEmitter } from "events";
import { iLogger } from "../../interfaces/logger.interface";
import { ProductOwnerRepository as ProductOwnerRepository } from "../../interfaces/commerce.repository.interface";
import { firebaseDB } from "../../firebase";
import { BankAccount, CommerceScheduleDate, Commerce, Order, Product, Zones, PaymentMethod } from "../../interfaces/commerce.interface";
import { BotEntity } from "../domain/bot.entity";
import { formatTime } from "../../utils/formatTime";
import { genRamdonString } from "../../utils/genRandomString";
import { BotSession } from "../domain/bot.session.entity";

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
        // {
        //   key: 'session_var_products_selected',
        //   content: '[{"name":"Michelada","normal_price":"8000."},{"name":"Hot dog","normal_price":"20000."}]',
        // }

        // {
        //   key: 'session_var_quantity_product_selected',
        //   content: '["2","3"]',
        // }

        // {
        //   key: 'session_var_client_name',
        //   content: 'Crhistian Vergara',
        // }

        // {
        //   key: 'session_var_client_delivery_zones',
        //   content: 'Calle 1 Carrera 1',
        // }

        // {
        //   key: 'session_var_payment_method_selected',
        //   content: 'Pago en Efectivo',
        // }


        // console.log("***-> customerPhoneNumber: ", customerPhoneNumber);
        // console.log("***-> Order: ", order);

        type productSelectedType = { "name": string, "normal_price": string };
        const { vars: data } = order as unknown as BotSession;

        const customerName = data.find(({ key }) => key === "session_var_client_name")?.content || "";
        const deliveryAddress = data.find(({ key }) => key === "session_var_client_delivery_zones")?.content || "";
        const paymentMethod = data.find(({ key }) => key === "session_var_payment_method_selected")?.content || "";
        const productsSelected = data.find(({ key }) => key === "session_var_products_selected")?.content || "[]";
        const numberProductsSelectedRaw = data.find(({ key }) => key === "session_var_quantity_product_selected")?.content || "[]";
        const noteProductsSelectedRaw = data.find(({ key }) => key === "session_var_note_product_selected")?.content || "[]";

        const numberProductsSelected = JSON.parse(numberProductsSelectedRaw);
        const noteProductsSelected = JSON.parse(noteProductsSelectedRaw);

        let totalPrice = 0;

        const products_detail =
            (JSON.parse(productsSelected) as productSelectedType[])
                .map(({ normal_price, name }, index) => {
                    const product_price = parseFloat(normal_price);
                    const quantity = parseInt(numberProductsSelected[index]);
                    const note = noteProductsSelected[index] || "";
                    totalPrice = totalPrice + (product_price * quantity);
                    return {
                        prodcut_id: "",
                        product_name: name,
                        note,
                        product_price,
                        quantity
                    };
                });

        const _order = {
            address: deliveryAddress,
            client: customerName,
            payment_method: paymentMethod,
            commerce: this.phoneNumber,
            products_detail,
            total: totalPrice,
            phone: order.phone.replace(/^57/g, "").replace("@c.us", ""),
            created_at: Date.now(),
            zone: "Dirección:",
            status: "waiting",
            close_at: 0,
            cancel_reason: null,
        };

        this.logger.log({
            type: "DEBUG",
            tag: this.TAG,
            msg: "Order generated.\n" + JSON.stringify(_order)
        });

        try {
            await this.firebaseCommerceReference
                .collection("orders")
                .doc(await this.getOrdenId())
                .create(_order);
        } catch (error) {
            this.logger.log({
                type: "ERROR",
                tag: this.TAG,
                msg: "Order no taken.\n" + JSON.stringify(error)
            });
        }
    }

    private async getOrdenId(): Promise<string> {
        const commerceRef = await this.firebaseCommerceReference
            .collection("orders").get();

        const date = new Date();
        let day = date.getDate().toString();
        let month = date.getMonth().toString();
        let year = date.getFullYear().toString();

        day = day.length === 2 ? day : "0" + day;
        month = month.length === 2 ? month : "0" + month;
        year = year.substring(2);

        const index = commerceRef.size;
        const orderNumber = `${day}${month}${year}-${index}`;
        return orderNumber;
    }

    onEventListen(listener: (customerPhoneNumber: string, order: Order) => void): void {
        this.emitterCollectionEvent.on("OrderStatusChange", (customerPhoneNumber, order) => {
            this.logger.log({
                tag: this.TAG,
                type: "DEBUG",
                msg: "***-> Run OrderStatusChange"
            });
            listener(`57${customerPhoneNumber}@c.us`, order);
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
        const phone = customerPhoneNumber.replace(/^57/g, "").replace("@c.us", "");
        const commerceRef = await this.firebaseCommerceReference
            .collection("orders")
            .where("phone", "==", phone)
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
                // console.log("***-> Returning collection data:");
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