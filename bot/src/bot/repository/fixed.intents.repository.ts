import { iBotIntent, intents as botModel } from "./fixed.intents.model";
import { firebaseDB } from "../../firebase";
import { iCommerce } from "../../interfaces/commerce.interface";
import { iLogger } from "../../interfaces/logger.interface";

export class FixedIntentsHandler {

    private readonly TAG = "***-> FixedIntentsHandler: ";
    private readonly commercePhoneNumber: string;
    private readonly logger: iLogger;
    private commerceInfo!: iCommerce;
    // private firebaseCommerceRef: FirebaseFirestore.DocumentReference;
    private intents: iBotIntent[]

    constructor({ context, intents, logger }: iFixedIntentsHandlerArgs) {
        this.logger = logger;
        this.commercePhoneNumber = context;

        /** 
         * TODO: the intents can be pass to props or get from commerce collection
        */
        this.intents = intents ? intents : botModel;
        this.getCommerceInfo(this.commercePhoneNumber)
            .then(commerceData => {
                this.commerceInfo = commerceData.info;
                // this.firebaseCommerceRef = commerceData.ref
            })
            .catch(error => {
                this.logger.log({
                    tag: this.TAG,
                    type: "ERROR",
                    msg: error
                });
            });
    }

    async botQueryByTag(args: BotQueryArgs) {

        // TODO: Debe crearce una session en el momento en eque el usuario llegue
        // TODO: a la parte de Ordenar pedido. y antes de continuara debera ser 
        // TODO: Consultada para saber si el usaurio esta registrando ,productos
        // TODO: o si envio una respuesta invalida o si apenas inicia session.

        let [dialogResponse] = this.intents
            .filter((intent) => intent.pattern
                .map(i => i.toLocaleLowerCase())
                .includes(args.pattern.toLowerCase()));

        if (!dialogResponse) {
            dialogResponse = this.intents[0];
            // throw "Intent not found";
        }

        // Replace all variables in respose messages.
        for (const index in dialogResponse.variables) {
            const variable = dialogResponse.variables[index];
            for (const indexResp in dialogResponse.response) {
                const message = dialogResponse.response[indexResp];
                dialogResponse.response[indexResp] = await this.replaceVariables({
                    commerceInfo: this.commerceInfo,
                    variable,
                    paragraph: message,
                });
            }
        }

        // // Build menu options from commerce response. e.g. products Menu.
        // // TODO: ****->
        // if (dialogResponse.response_options_from_commerce.enable) {
        //     const options = await getOptionsForResponse({
        //         collectionReference: commerceCollectionRef,
        //         responseCode: dialogResponse.response_options_from_commerce.response_code,
        //     });
        //     dialogResponse.response_options = options;
        // }
        // // *******

        // const commercePaymentMethods = await getArrayCollectionRef(
        //     commerceInfo.payment_methods
        // );

        return {
            dialogResponse,
            // commerceInfo: {
            //     ...this.commerceInfo,
            //     payment_methods: commercePaymentMethods,
            // },
        };
    }

    private async getCommerceInfo(commercePhoneNumber: string) {
        const commercesQueryResult = await firebaseDB
            .collection("commerces")
            .where("phone", "==", commercePhoneNumber);

        const commerces = await commercesQueryResult.get();

        if (commerces.size === 0) {
            throw "Commerce not found.";
        }
        const commerceRef = commerces.docs[commerces.size - 1];
        return {
            info: <iCommerce>commerceRef.data(),
            ref: <FirebaseFirestore.DocumentReference>commerceRef.ref,
        };
    }

    private async replaceVariables(args: ReplaceVarsArgs) {
        const regex = new RegExp(`##${args.variable}##`, "g");
        let value = "_value_";

        switch (args.variable) {
        case "assistanceName":
            value = "Venttys Bot";
            break;
        case "commerceName":
            //value = args.commerceInfo.name;
            value = "Antonias";
            break;
        case "commerceAddress":
            // value = args.commerceInfo.address;
            value = "Calle 1";
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
        case "temp_accountNumbers":
            break;
        }
        return args.paragraph.replace(regex, value);
    }
}
interface BotQueryArgs {
    pattern: string,
    userPhoneNumber: string
}
interface ReplaceVarsArgs {
    variable: string,
    paragraph: string,
    commerceInfo: iCommerce
}
interface iFixedIntentsHandlerArgs {
    context: string,
    intents?: iBotIntent[],
    logger: iLogger
}


// async function getOptionsForResponse({ responseCode, collectionReference }) {
//     const options = [];
//     switch (responseCode) {
//         case "products":
//             const products = await getProductsNameAndPrice(collectionReference);
//             for (const product of products) options.push(product);
//             break;
//         case "paymentMethods":
//             break;
//     }

//     return options;
// }


// async function getInnerCollection({ name, ref }) {
//     const data = [];
//     const docs = (await ref.collection(name).get()).docs;
//     return docs.map((doc) => doc.data());
// }

// async function getArrayCollectionRef(collection) {
//     const collectionPromises = [];

//     for (index in collection) {
//         collectionPromises.push(collection[index].get());
//     }

//     const collections = await Promise.all(collectionPromises);

//     return collections.map((c) => c.data());
// }

/**
 * HARD GET OPTIONS
 */

// async function getProductsNameAndPrice(collectionRef) {
//     const products = await getInnerCollection({
//         name: "products",
//         ref: collectionRef,
//     });

//     return products.map(
//         (product, index) => `*${index}* ${product.name} _$${product.normal_price}_`
//     );
// }

// module.exports = botQueryByTag;
