import { BotEntity } from "src/bot/domain/bot.entity";

export interface CommerceSourceEntity {
    botCode: "default" | string;
    assistance_name: "Venttys" | string;
    phone: string;
}

export interface ProductOwnerRepository<TCommerce, TData> {
    phoneNumber: string;
    getResolveEntity<T>(entity: BotEntity, customerPhoneNumber: string): Promise<T | T[]>;
    getInfo():Promise<TCommerce>;
    onEventListen(listener: (customerPhoneNumber: string, data: TData) => void): void;
    runAction(customerPhoneNumber: string, data: TData): Promise<void>;
}