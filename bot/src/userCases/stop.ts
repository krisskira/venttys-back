import { Events, PubSubPublishFC } from "../interfaces/pubSub.interface";
import { iWhatsappHandler } from "../interfaces/whatsappHandler.interface";

interface WhatsappStopArgs {
    whatsappHandler: iWhatsappHandler;
    publish: PubSubPublishFC;
    payload: unknown;
}

export const whatsappStopEventUserCase =  async (args: WhatsappStopArgs): Promise<void> => {
    console.log("***-> UserCase :RestartWhatsapp: ", args.payload);
    const data = await args.whatsappHandler.stop();
    await args.publish({
        event: Events.CLOSE_SECTION,
        to: "venttys_graphql_api",
        data
    });
    process.exit(0);
};