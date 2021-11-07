/**
 * EMOGIPEDIA: https://emojipedia.org/
 */

import { BotIntent } from "../../bot/domain/bot-intent.entity";

export const intents: BotIntent[] = [
    {
        tag: "Saludo",
        pattern: [],
        variables: ["commerceName", "assistanceName"],
        response: [
            "Bienvenido al restaurante de comidas rápidas *##commerceName##*, nos alegramos mucho tenerte por aquí. Soy *##assistanceName##*, tu *Asistente Virtual* que atenderá tu orden."
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
        response: ["Este es nuestro menú. \n*¿Qué deseas Ordenar?*\n"],
        response_options_from_commerce: {
            response_code: "products",
            response_options_type: "list"
        },
        response_options: [
            "✅ Confirmar el pedido",
            "❌ Cancelar Pedido"
        ],
        response_options_type: "button",
        next_tags: ["waiting", "AgregarProductos"],
    },
    {
        tag: "Agregar",
        pattern: ["agregar"],
        variables: [],
        response: [],
        response_options: [],
        next_tags: ["waiting", "AgregarProductos"],
    },
    {
        tag: "VerMenu",
        pattern: ["👀 Ver nuestro menú"],
        variables: [],
        response: ["Este es nuestro menú. \n*¿Qué deseas Ver?*"],
        response_options_from_commerce: {
            response_code: "products",
            response_options_type: "list"
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
        variables: ["commerceSchedule", "commerceAddress"],
        response: [
            "Estimado cliente, nuestro horario es:",
            "##commerceSchedule##",
            "Encuéntranos en ##commerceAddress##",
        ],
        response_options_type: "button",
        response_options: [
            "😋 Hacer un pedido",
            "👀 Ver nuestro menú"
        ],
        next_tags: [],
    },
    {
        tag: "AgregarProductos",
        pattern: ["AgregarProductos"],
        variables: [],
        response: ["¿Deseas agregar más productos a tu pedido?"],
        response_options_type: "button",
        response_options: [
            "🍕 Agregar",
            "✅ Confirmar el pedido",
            "❌ Cancelar Pedido"
        ],
        next_tags: [],
    },
    {
        tag: "ConfirmarPedido",
        pattern: ["✅ Confirmar el pedido"],
        variables: ["temp_products_selected", "temp_partial_value"],
        response: [
            "Tu pedido es:",
            "##temp_products_selected##",
            "Valor Parcial: ##temp_partial_value##",
            "Por favor indicanos tu nombre y apellidos.",
        ],
        response_options: [],
        next_tags: ["waiting", "MedioEntrega"],
    },
    {
        tag: "MedioEntrega",
        pattern: [],
        variables: [],
        response: ["Por favor indicanos como quiere la entrega de tu pedido:"],
        response_options_type: "button",
        response_options: [
            "🛵 Quiero Entrega a Domicilio",
            "🚶‍♂️Prefiero Recoger mi Pedido en el Restaurante",
        ],
        next_tags: [],
    },
    {
        tag: "ZonasEntrega",
        pattern: ["🛵 Quiero Entrega a Domicilio"],
        variables: ["commerceDeliveryZones"],
        response: [
            "Recuerda que nuestra zona cobertura y tarifas de Domiclilio son las siguientes:",
            "##commerceDeliveryZones##",
        ],
        response_options: [],
        next_tags: ["MedioPago"],
    },
    {
        tag: "MedioPago",
        pattern: ["🚶‍♂️Prefiero Recoger mi Pedido en el Restaurante"],
        variables: [],
        response: ["¿Con que medio de pago desea cancelar su pedido?"],
        response_options_from_commerce: {
            response_code: "paymentMethods",
            response_options_type: "button"
        },
        response_options: [],
        next_tags: ["waiting", "ConfirmarPedido"],
    },
    {
        tag: "PedidoExitoso",
        pattern: [],
        variables: ["temp_clientName", "temp_products_selected", "temp_partial_value", "accountNumbers"],
        response: [
            "Gracias ##clientName## por su compra. Tu pedido es:",
            "##temp_products_selected##",
            "Valor Total: ##temp_partial_value## + Costo de envío.",
            "Su pedido está en proceso de confirmación. En un minutos te escribiremos nuevamente para indicarte la confirmación del pedido y el tiempo estimado de entrega",
            "Nuestros núermos de cuenta para la transferencia son: \n\n##accountNumbers##"
        ],
        response_options: [],
        next_tags: [],
    },
    {
        tag: "CancelarPedido",
        pattern: ["❌ Cancelar Pedido"],
        variables: [],
        response: ["Su pedido *NO* se pudo finalizar, gracias por usar nuestros servicios."],
        response_options: [],
        next_tags: [],
    },
];
