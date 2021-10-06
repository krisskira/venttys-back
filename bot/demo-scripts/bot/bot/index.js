const botModel = require("../../assets/bot-model");
const { firebaseDB } = require("../firebase/firebase");

botQueryByTag = async ({ tag, commercePhoneNumber, userPhoneNumber }) => {
  let [dialogResponse] = botModel.filter((intent) => intent.tag === tag);

  if (!!!dialogResponse) {
    throw "Intent not found";
  }

  const { info: commerceInfo, ref: commerceCollectionRef } =
    await getCommerceInfo(commercePhoneNumber);

  // Replace all variables in respose messages.
  for (index in dialogResponse.variables) {
    const variable = dialogResponse.variables[index];
    for (indexResp in dialogResponse.response) {
      const message = dialogResponse.response[indexResp];
      dialogResponse.response[indexResp] = await replaceVariables({
        commerceInfo,
        variable,
        paragraph: message,
      });
    }
  }

  // Build menu options from commerce response. e.g. products Menu.
  // TODO: ****->
  if (dialogResponse.response_options_from_commerce.enable) {
    const options = await getOptionsForResponse({
      collectionReference: commerceCollectionRef,
      responseCode: dialogResponse.response_options_from_commerce.response_code,
    });
    dialogResponse.response_options = options;
  }
  // *******

  const commercePaymentMethods = await getArrayCollectionRef(
    commerceInfo.payment_methods
  );

  return {
    dialogResponse,
    commerceInfo: {
      ...commerceInfo,
      payment_methods: commercePaymentMethods,
    },
  };
};

async function replaceVariables({ variable, paragraph, commerceInfo }) {
  const regex = new RegExp(`##${variable}##`, "g");
  let value = "_value_";

  switch (variable) {
    case "assistanceName":
      value = "Venttys Bot";
      break;
    case "commerceName":
      value = commerceInfo.name;
      break;
    case "commerceAddress":
      value = commerceInfo.address;
      break;
    case "commerceSchedule":
      break;
    case "commerceDeliveryZones":
      break;
    // Hot build variables over session
    case "temp_products_selected":
      break;
    case "temp_parcial_value":
      break;
    case "temp_clientName":
      break;
    case "temp_products_selected":
      break;
    case "temp_parcial_value":
      break;
    case "temp_accountNumbers":
      break;
  }

  return paragraph.replace(regex, value);
}

async function getOptionsForResponse({ responseCode, collectionReference }) {
  const options = [];
  switch (responseCode) {
    case "products":
      const products = await getProductsNameAndPrice(collectionReference);
      for (product of products) options.push(product);
      break;
    case "paymentMethods":
      break;
  }

  return options;
}

async function getCommerceInfo(commercePhoneNumber) {
  const commercesQueryResult = await firebaseDB
    .collection("commerces")
    .where("phone", "==", commercePhoneNumber);

  const commerces = await commercesQueryResult.get();

  if (commerces.docs.length === 0) {
    throw "Commerce not found.";
  }
  commerceRef = commerces.docs[commerces.docs.length - 1];

  return {
    info: commerceRef.data(),
    ref: commerceRef.ref,
  };
}

async function getInnerCollection({ name, ref }) {
  const data = [];
  const docs = (await ref.collection(name).get()).docs;
  return docs.map((doc) => doc.data());
}

async function getArrayCollectionRef(collection) {
  const collectionPromises = [];

  for (index in collection) {
    collectionPromises.push(collection[index].get());
  }

  const collections = await Promise.all(collectionPromises);

  return collections.map((c) => c.data());
}

/**
 * HARD GET OPTIONS
 */

async function getProductsNameAndPrice(collectionRef) {
  const products = await getInnerCollection({
    name: "products",
    ref: collectionRef,
  });

  return products.map(
    (product, index) => `*${index}* ${product.name} _$${product.normal_price}_`
  );
}

module.exports = botQueryByTag;
