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
export type CommerceSchedule = Record<Day,CommerceScheduleDate >;
export type CommerceMessages = Record<CommerceMessagesType, CommerceMessage >;

export interface CommerceMessage {
  enable: boolean;
  value: string;
}

export interface CommerceScheduleDate {
  name: string;
  number_day: number;
  code: Day;
  close: Time;
  open: Time;
  enable: boolean;
}

export interface iCommerce {
  commerceId: string;
  name: string;
  phone: string;
  address: string;
  state: string;
  enable: boolean;
  paymentMehods: PaymentMethod[];
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
  botCode?:string;
}
