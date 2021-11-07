import { BotEntity } from "../../bot/domain/bot.entity";

export const entities: BotEntity[] = [
    {
        code: "commerceName",
        isSessionVar: false,
        path: "name",
        collectionName: "commerces"
    },
    {
        code: "assistanceName",
        isSessionVar: false,
        path: "",
        collectionName: "commerces",
        default: "Venttys"
    },
    {
        code: "products",
        isSessionVar: false,
        path: "products",
        collectionName: "commerces"
    },
    {
        code: "commerceSchedule",
        isSessionVar: false,
        path: "schedules",
        collectionName: "commerces"
    },
    {
        code: "commerceAddress",
        isSessionVar: false,
        path: "address",
        collectionName: "commerces"
    },
    {
        code: "temp_products_selected",
        isSessionVar: true,
        path: "name|quantity",
        collectionName: "session/products",
    },
    {
        code: "temp_partial_value",
        isSessionVar: true,
        path: "price",
        collectionName: "session"
    },
    {
        code: "commerceDeliveryZones",
        isSessionVar: false,
        path: "name|price",
        collectionName: "commerces/zones"
    },
    {
        code: "paymentMethods",
        isSessionVar: false,
        path: "payment_methods",
        collectionName: "commerces"
    },
    {
        code: "temp_clientName",
        isSessionVar: true,
        path: "clientName",
        collectionName: "session"
    },
    {
        code: "accountNumbers",
        isSessionVar: false,
        path: "name|number",
        collectionName: "commerces/bank_accounts"
    }
];
