import { Day, PaymentMethod, Time } from ".";

export interface CommerceBasicInfo {
    name: string;
    phoneNumber: string;
}

export type CommerceStatus = "Open" | "Close";
export type CommerceMessagesType = "open" | "close" | "await";
export type CommerceMessages = { [key: CommerceMessagesType]: CommerceMessage };

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
    is_enable: boolean;
}

export interface Commerce {
    commerceId: string;
    name: string;
    phone: string;
    address: string;
    state: string;
    is_enable: boolean;
    delivery_price: number;
    delivery_time: string;
    commerce_status: CommerceStatus;
    messages: {
        open: CommerceMessage;
        await: CommerceMessage;
        close: CommerceMessage;
    };
    paymentMehods: PaymentMethod[];
    schedules: CommerceScheduleDate[];
}
