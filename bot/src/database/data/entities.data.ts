import { BotEntity } from "../../bot/domain/bot.entity";

export const entities: BotEntity[] = [
    {
        code: "commerce_name",
        isSessionVar: false,
        path: ["name"],
        collectionName: "commerces",
        type: "single"
    },
    {
        code: "commerce_assistance_name",
        isSessionVar: false,
        path: ["assistance_name"],
        collectionName: "commerces",
        defaultValue: "Venttys",
        type: "single"
    },
    {
        code: "commerce_products",
        isSessionVar: false,
        path: ["category|name", "name", "normal_price", "description"],
        collectionName: "products",
        type: "array-object"
    },
    {
        code: "commerce_schedule",
        isSessionVar: false,
        path: ["name", "openString", "closeString"],
        collectionName: "schedules",
        type: "single"
    },
    {
        code: "commerce_address",
        isSessionVar: false,
        path: ["address"],
        collectionName: "commerces",
        type: "single",
    },
    {
        code: "commerce_bank_account",
        isSessionVar: false,
        path: ["name", "number"],
        collectionName: "bank_accounts",
        type: "single"
    },
    {
        code: "commerce_delivery_zones",
        isSessionVar: false,
        path: ["name", "price"],
        collectionName: "zones",
        type: "single"
    },
    {
        code: "commerce_payment_methods",
        isSessionVar: false,
        path: ["name"],
        collectionName: "payment_methods",
        type: "array"
    },
    {
        code: "session_var_products_selected",
        isSessionVar: true,
        path: ["name", "normal_price"],
        collectionName: "products",
        type: "array"
    },
    {
        code: "session_var_quantity_product_selected",
        isSessionVar: true,
        path: [],
        collectionName: "session",
        type: "array"
    },
    {
        code: "session_var_note_product_selected",
        isSessionVar: true,
        path: [],
        collectionName: "session",
        type: "array"
    },
    {
        code: "session_var_price_products_selected",
        isSessionVar: true,
        path: ["normal_price"],
        collectionName: "products",
        type: "array"
    },
    {
        code: "session_var_client_name",
        isSessionVar: true,
        path: [],
        collectionName: "session",
        type: "single"
    },
    {
        code: "session_var_payment_method_selected",
        isSessionVar: true,
        path: [],
        collectionName: "session",
        type: "single"
    },
    {
        code: "session_var_client_delivery_zones",
        isSessionVar: true,
        path: [],
        collectionName: "session",
        type: "single"
    },
    {
        code: "order_var_client_name",
        isSessionVar: false,
        path: ["client"],
        collectionName: "orders",
        type: "single"
    },
    {
        code: "order_var_status",
        isSessionVar: false,
        path: ["status"],
        collectionName: "orders",
        type: "single"
    },
    {
        code: "order_var_cancel_reason",
        isSessionVar: false,
        path: ["cancel_reason"],
        collectionName: "orders",
        type: "single",
        defaultValue: " "
    },
    {
        code: "computed_var_summary_products_selected",
        isSessionVar: true,
        path: [],
        collectionName: "computed",
        type: "array",
        fromMathOperations: [{
            operation: "+",
            vars: [
                "session_var_quantity_product_selected",
                "session_var_products_selected|name"
            ]
        }]
    },
    {
        code: "computed_var_partial_value",
        isSessionVar: true,
        path: ["price",],
        collectionName: "computed",
        type: "single",
        fromMathOperations: [
            {
                operation: "*",
                vars: [
                    "session_var_quantity_product_selected",
                    "session_var_products_selected|normal_price"
                ]
            }
        ]
    },
    {
        code: "waiting",
        isSessionVar: false,
        path: ["waiting"],
        collectionName: "fixed-message",
        type: "single",
        defaultValue: "*En espera*"
    },
    {
        code: "cooking",
        isSessionVar: false,
        path: ["cooking"],
        collectionName: "fixed-message",
        type: "single",
        defaultValue: "*En preparación*"
    },
    {
        code: "finish",
        isSessionVar: false,
        path: ["finish"],
        collectionName: "fixed-message",
        type: "single",
        defaultValue: "*Enviado*"
    },
    {
        code: "canceled",
        isSessionVar: false,
        path: ["canceled"],
        collectionName: "fixed-message",
        type: "single",
        defaultValue: "*Cancelado*"
    },
];
