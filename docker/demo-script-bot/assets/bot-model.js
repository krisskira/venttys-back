module.exports = [
  {
    tag: "Saludo",
    pattern: [],
    variables: ["commerceName", "assistanceName"],
    response: [
      "Bienvenido al restaurante de comidas rápidas *##commerceName##*, nos alegramos mucho tenerte por aquí. Soy *##assistanceName##*, tu *Asistente Virtual* que atenderá tu orden.",
      "Por favor para continuar selecciona una de las siguientes opciones 👇👇👇 y sigue las instrucciones… Gracias.",
    ],
    response_options_from_commerce: {
      enable: false,
      response_code: "",
    },
    response_options: [
      "*1)* 😋 Hacer un pedido",
      "*2)* 👀 Ver nuestro menú",
      "*3)* 🕧 Conocer ubicación y horarios",
    ],
    next_tags: ["HacerPedido", "VerMenu", "UbicacionHorarios"],
  },
  {
    tag: "HacerPedido",
    pattern: ["1", "HP", "hacer pedido"],
    variables: [],
    response: ["Este es nuestro menú. ¿Qué deseas Ordenar?"],
    response_options_from_commerce: {
      enable: true,
      response_code: "products",
    },
    response_options: [],
    next_tags: ["AgregarProductos", "CancelarPedido"],
  },
  {
    tag: "VerMenu",
    pattern: ["2", "VM", "Ver menu"],
    variables: [],
    response: ["Este es nuestro menú. ¿Qué deseas Ver?"],
    response_options_from_commerce: {
      enable: true,
      response_code: "products",
    },
    response_options: [],
    next_tags: ["AgregarProductos", "CancelarPedido"],
  },
  {
    tag: "UbicacionHorarios",
    pattern: ["3", "Ubicacion", "Horarios"],
    variables: ["commerceSchedule", "commerceAddress"],
    response: [
      "Estimado cliente, nuestro horario es:",
      "##commerceSchedule##",
      "Encuéntranos en ##commerceAddress## Por favor para continuar selecciona una de las siguientes opciones 👇👇👇",
    ],
    response_options_from_commerce: {
      enable: false,
      response_code: "",
    },
    response_options: ["*1)* 😋 Hacer un pedido", "*2)* 👀 Ver nuestro menú"],
    next_tags: ["HacerPedido", "VerMenu"],
  },
  {
    tag: "AgregarProductos",
    pattern: [],
    variables: [],
    response: ["¿Deseas agregar más productos a tu pedido?"],
    response_options_from_commerce: {
      enable: false,
      response_code: "",
    },
    response_options: ["*1)* Si", "*2)* No", "*3)* Cancelar Pedido"],
    next_tags: ["AgregarProductos", "ConfirmarPedido", "CancelarPedido"],
  },
  {
    tag: "ConfirmarPedido",
    pattern: ["2", "No", "Confirmar pedido"],
    variables: ["temp_products_selected", "temp_parcial_value"],
    response: [
      "Tu pedido es:",
      "##temp_products_selected##",
      "Valor Parcial: ##temp_parcial_value##",
      "Por favor indicanos tu nombre y apellidos.",
    ],
    response_options_from_commerce: {
      enable: false,
      response_code: "",
    },
    response_options: [],
    next_tags: ["MedioEntrega"],
  },
  {
    tag: "MedioEntrega",
    pattern: [],
    variables: [],
    response: ["Por favor indicanos como quiere la entrega de tu pedido:"],
    response_options_from_commerce: {
      enable: false,
      response_code: "",
    },
    response_options: [
      "*1)* Quiero Entrega a Domicilio",
      "*2)* Prefiero Recoger mi Pedido en el Restaurante",
    ],
    next_tags: ["ZonasEntrega"],
  },
  {
    tag: "ZonasEntrega",
    pattern: [],
    variables: ["commerceDeliveryZones"],
    response: [
      "Recuerda que nuestra zona cobertura y tarifas de Domiclilio son las siguientes:",
      "##commerceDeliveryZones##",
    ],
    response_options_from_commerce: {
      enable: false,
      response_code: "",
    },
    response_options: [],
    next_tags: [],
  },
  {
    tag: "MedioPago",
    pattern: [],
    variables: [],
    response: ["¿Con que medio de pago desea cancelar su pedido?"],
    response_options_from_commerce: {
      enable: true,
      response_code: "paymentMethods",
    },
    response_options: [],
    next_tags: [],
  },
  {
    tag: "ConfirmarPedido",
    pattern: [],
    variables: ["temp_clientName", "temp_products_selected", "temp_parcial_value", "temp_accountNumbers"],
    response: [
      "Gracias ##clientName## por su compra. Tu pedido es:",
      "##temp_products_selected##",
      "Valor Total: ##temp_parcial_value## + Costo de envío.",
      "Su pedido está en proceso de confirmación. En un minutos te escribiremos nuevamente para indicarte la confirmación del pedido y el tiempo estimado de entrega",
      "Nuestros núermos de cuenta para la transferencia son: \n\n##temp_accountNumbers##"
    ],
    response_options_from_commerce: {
      enable: false,
      response_code: "",
    },
    response_options: [],
    next_tags: [],
  },
  {
    tag: "",
    pattern: [],
    variables: [],
    response: [],
    response_options_from_commerce: {
      enable: false,
      response_code: "",
    },
    response_options: [],
    next_tags: [],
  },
];
