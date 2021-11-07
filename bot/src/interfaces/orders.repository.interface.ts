export type OrderStatus = "cooking" | "waiting" | "finish"

export interface iOrder {
    address: string;
    cancel_reason: string;
    client: string;
    commerce: string;
    finish_time: number;
    id: string;
    phone: string;
    status: OrderStatus;
    timestamp: number;
    total: number;
    zone: string;
    products_detail: iProductDetail[]
}

export interface iProductDetail {
    note: string;
    prodcut_id: string;
    product_name: string;
    product_price: number;
    quantity: number;
}

export interface iOrderRepository {
    listen: (cb: (order: iOrder) => void) => Promise<void>;
    generate(order: iOrder): Promise<void>;
}