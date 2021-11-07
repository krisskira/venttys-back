import { EventEmitter } from "events";
import { genRamdonString } from "../../utils/genRandomString";
import { iOrder, iOrderRepository } from "../../interfaces/orders.repository.interface";

export class OrdersRepository implements iOrderRepository {

    private orderStatus: EventEmitter = new EventEmitter();

    constructor() {
        this.orderStatus = new EventEmitter();
        // this.demoEmmiter();
    }

    async listen(cb: (order: iOrder) => void): Promise<void> {
        this.orderStatus.on("changeStatusOrder", (order: iOrder) => {
            cb(order);
        });
    }

    async generate(order: iOrder): Promise<void> {
        console.log("Write in firebase collection this order: ", order);
    }

    private demoEmmiter() {
        setInterval(() => {
            this.orderStatus.emit("changeStatusOrder", {
                address: "",
                cancel_reason: "",
                client: "",
                commerce: "",
                finish_time: Date.now(),
                id: genRamdonString(5),
                phone: "",
                products_detail: [],
                status: "cooking",
                timestamp: Date.now(),
                total: 0,
                zone: ""
            } as iOrder);
        }, 3500);
    }
}