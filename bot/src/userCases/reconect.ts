import { iWhatsappHandler } from "src/interfaces/whatsappHandler.interface";
import { Events, PubSubPublishFC } from "../interfaces/pubSub.interface";

interface WhatsappReconectArgs {
    whatsappHandler: iWhatsappHandler;
    publish: PubSubPublishFC;
    payload: unknown;
}

export const whatsappReconnectEventUserCase = async (args: WhatsappReconectArgs): Promise<void> => {
    console.log("***-> UserCase :RestartWhatsapp: ", args.payload);
    const data = await args.whatsappHandler.reconect();
    args.publish({
        event: Events.RECONNECT,
        to: "venttys_graphql_api",
        data
    });
};