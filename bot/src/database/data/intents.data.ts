/**
 * EMOGIPEDIA: https://emojipedia.org/
 */

import { BotIntent } from "../../bot/domain/bot-intent.entity";
/**
 * TODO: REPLACE VARS USING expression = new RegExp(/\#\#(.*?)\#\#/g)
 * TO SEE `GET VARIABLES` SESSION IN INTENT-HANDLER.TS
 */
export const intents: BotIntent[] = [
    {
        tag: "Start",
        pattern: ["start"],
        variables: ["commerce_name", "commerce_assistance_name"],
        response: [
            "Bienvenido al restaurante de comidas rápidas *##commerce_name##*.\nNos alegramos mucho tenerte por aquí. Soy *##commerce_assistance_name##*, tu *Asistente Virtual* que atenderá tu orden.",
            "Para cancelar y salir envie 'SALIR' en cualquier momento."
        ],
        response_options: [
            "😋 Hacer un pedido",
            "👀 Ver nuestro menú",
            "🕧 Conocer ubicación y horarios",
        ],
        response_options_type: "button",
        next_tags: [],
    },
    {
        tag: "HacerPedido",
        pattern: ["😋 Hacer un pedido"],
        variables: [],
        response: ["Este es nuestro menú.","¿Qué deseas Ordenar?"],
        response_options_from_commerce: {
            response_code: "commerce_products",
            response_options_type: "list",
            groupBy: "category|name",
            response: []
        },
        response_options: [],
        session_var_to_save: "session_var_products_selected|session_var_price_products_selected",
        next_tags: ["waiting", "NumeroUnidadesPedidas"],
    },
    {
        tag: "Agregar",
        pattern: ["🍕 Si Agregar"],
        variables: [],
        response: [
            "Por favor seleccione otro producto del menu."
        ],
        response_options_from_commerce: {
            response_code: "commerce_products",
            response_options_type: "list",
            groupBy: "category|name",
            response: []
        },
        response_options: [
            "✅ Confirmar el pedido",
            "❌ Cancelar Pedido"
        ],
        response_options_type: "button",
        session_var_to_save: "session_var_products_selected|session_var_price_products_selected",
        next_tags: ["waiting", "NumeroUnidadesPedidas"],
    },
    {
        tag: "NumeroUnidadesPedidas",
        pattern: ["NumeroUnidadesPedidas"],
        variables: [],
        response: ["¿Cuanta cantidad desea?"],
        response_options: [],
        session_var_to_save: "session_var_quantity_product_selected",
        next_tags: ["waiting", "AgregarProductos"],
    },
    {
        tag: "AgregarProductos",
        pattern: ["AgregarProductos"],
        variables: [],
        response: ["¿Deseas agregar más productos a tu pedido?"],
        response_options_type: "button",
        response_options: [
            "🍕 Si Agregar",
            "✅ Confirmar el pedido",
            "❌ Cancelar Pedido"
        ],
        next_tags: [],
    },
    {
        tag: "ConfirmarPedido",
        pattern: ["✅ Confirmar el pedido"],
        variables: ["session_var_products_selected", "computed_var_partial_value"],
        response: [
            "Tu pedido es:",
            "##computed_var_summary_products_selected##",
            "Valor Parcial: ##computed_var_partial_value##",
            "\nPor favor indicanos tu nombre y apellidos.",
        ],
        session_var_to_save: "session_var_client_name",
        response_options: [],
        next_tags: ["waiting", "MedioEntrega"],
    },
    {
        tag: "VerMenu",
        pattern: ["👀 Ver nuestro menú"],
        variables: [],
        response: ["Este es nuestro menú.","*¿Qué deseas Ver?*"],
        response_options_from_commerce: {
            response_code: "commerce_products",
            response_options_type: "list",
            response: []
        },
        response_options_type: "button",
        response_options: [
            "😋 Hacer un pedido",
            "🕧 Conocer ubicación y horarios",
        ],
        next_tags: [],
    },
    {
        tag: "UbicacionHorarios",
        pattern: ["🕧 Conocer ubicación y horarios"],
        variables: ["commerce_schedule", "commerce_address"],
        response: [
            "Estimado cliente, nuestro horario es:",
            "##commerce_schedule##",
            "Encuéntranos en ##commerce_address##",
        ],
        response_options_type: "button",
        response_options: [
            "😋 Hacer un pedido",
            "👀 Ver nuestro menú"
        ],
        next_tags: [],
    },
    {
        tag: "MedioEntrega",
        pattern: [],
        variables: [],
        response: [
            "Por favor indicanos como quiere la entrega de tu pedido.",
            "Escoge uno:"
        ],
        response_options_type: "button",
        response_options: [
            "🛵 Quiero Entrega a Domicilio",
            "🚶‍♂️Prefiero Recoger mi Pedido en el Restaurante",
        ],
        session_var_to_save: "session_var_client_delivery_zones",
        next_tags: [],
    },
    {
        tag: "ZonasEntrega",
        pattern: ["🛵 Quiero Entrega a Domicilio"],
        variables: ["commerce_delivery_zones"],
        response: [
            "Recuerda que nuestra zona cobertura y tarifas de Domiclilio son las siguientes:",
            "##commerce_delivery_zones##",
            "\n¿Cuál es la dirección del domicilio?"
        ],
        response_options: [],
        session_var_to_save: "session_var_client_delivery_zones",
        next_tags: ["waiting", "MedioPago"],
    },
    {
        tag: "MedioPago",
        pattern: ["🚶‍♂️Prefiero Recoger mi Pedido en el Restaurante", "💸 Escoger medio de pago"],
        variables: [],
        response: [
            "¿Con que medio de pago desea cancelar su pedido?",
            "Escoge uno:"
        ],
        response_options_from_commerce: {
            response_code: "commerce_payment_methods",
            response_options_type: "button",
            response: []
        },
        response_options: [],
        session_var_to_save: "session_var_payment_method_selected",
        next_tags: ["waiting", "Completed"],
    },
    {
        tag: "Completed",
        pattern: [],
        variables: ["session_var_client_name", "session_var_products_selected", "computed_var_partial_value", "commerce_bank_account"],
        response: [
            "Gracias ##session_var_client_name## por su compra. Tu pedido es:",
            "##session_var_products_selected##",
            "Valor Total: ##computed_var_partial_value## + Costo de envío.",
            "Su pedido está en proceso de confirmación. En un minutos te escribiremos nuevamente para indicarte la confirmación del pedido y el tiempo estimado de entrega",
            "Nuestros núermos de cuenta para la transferencia son: \n\n##commerce_bank_account##"
        ],
        response_options: [],
        next_tags: [],
    },
    {
        tag: "Close",
        pattern: ["❌ Cancelar Pedido", "SALIR"],
        variables: [],
        response: ["Su pedido *NO* se pudo finalizar, gracias por usar nuestros servicios."],
        response_options: [],
        next_tags: [],
    },
    {
        tag: "Default",
        pattern: ["default"],
        variables: [],
        response: [
            "Ups, por favor selecciona una de las respuestas predefinidas."
        ],
        response_options: [],
        next_tags: [],
    },
    {
        tag: "NeedHuman",
        pattern: ["PERSONA", "persona"],
        variables: [],
        response: [
            "Uno de nuestros representantes se pondrá en contacto con usted en breve."
        ],
        response_options: [],
        next_tags: [],
    },
    {
        tag: "Test",
        pattern: ["test"],
        variables: [],
        response: ["*Titulo*","Parrafo","Otro parrafo"],
        response_options_from_commerce: {
            response_code: "commerce_delivery_zones",
            response_options_type: "list",
            groupBy: "name",
            response: []
        },
        response_options: [],
        session_var_to_save: "session_var_client_delivery_zones",
        next_tags: ["waiting", "NumeroUnidadesPedidas"],
    },
];
