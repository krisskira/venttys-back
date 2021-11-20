export type Day =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"
  | "holiday";

export interface PaymentMethod {
  id: string;
  description: string;
  name: string;
}

export interface iCommerceBasicInfo {
  name: string;
  phoneNumber: string;
}

export type Time = {
  hour: number;
  minute: number;
  second?: number;
};

export type CommerceStatus = "Open" | "Close";
export type CommerceMessagesType = "open" | "close" | "await";
export type CommerceSchedule = Record<Day, CommerceScheduleDate>;
export type CommerceMessages = Record<CommerceMessagesType, CommerceMessage>;

export interface CommerceMessage {
  is_enable: boolean;
  value: string;
}

export interface CommerceScheduleDate {
  name: string;
  number_day: number;
  code: Day;
  close: Time;
  open: Time;
  openString?: string;
  closeString?: string;
  is_enable: boolean;
}

export interface Product {
  description: string;
  discount_price: number;
  image_url: string;
  name: string;
  normal_price: number;
  category: {
    name: string;
    description: string;
  }
  categoryStrig?: string;
}

export interface Order {
  address: string;
  cancel_reason?: string | null;
  client: string;
  close_at: Date;
  commerce: string;
  created_at: Date;
  phone: string;
  products_detail: OrderDetail[];
  status: "cooking" | "waiting" | "finish" | "canceled";
  total: number;
  zone: string;
}

export interface OrderDetail {
  note: string;
  prodcut_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
}

export interface Zones {
  name: string;
  price: number;
}

export interface BankAccount {
  name: string;
  number: string;
}

export interface iCommerce {
  commerceId: string;
  name: string;
  phone: string;
  address: string;
  is_enable: string;
  enable: boolean;
  payment_methods: PaymentMethod[];
  delivery_price: number;
  delivery_time: string;
  commerce_status: CommerceStatus;
  messages: {
    open: CommerceMessage;
    await: CommerceMessage;
    close: CommerceMessage;
  };
  schedules: {
    monday: CommerceScheduleDate;
    tuesday: CommerceScheduleDate;
    wednesday: CommerceScheduleDate;
    thursday: CommerceScheduleDate;
    friday: CommerceScheduleDate;
    saturday: CommerceScheduleDate;
    sunday: CommerceScheduleDate;
    holiday: CommerceScheduleDate;
  };
  botCode?: string;
  assistance_name?: string;
}
