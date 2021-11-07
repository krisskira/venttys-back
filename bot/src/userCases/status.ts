import { iWhatsappHandler } from "../interfaces/whatsappHandler.interface";
import { Events, PubSubPublishFC } from "../interfaces/pubSub.interface";

interface GetWhatsappStatusArgs {
    whatsappHandler: iWhatsappHandler;
    publish: PubSubPublishFC;
    payload: unknown;
}

export const getStatusEventUserCase = async (args: GetWhatsappStatusArgs): Promise<void> => {
    console.log("***-> UserCase :Status: ", args.payload);
    const status = await args.whatsappHandler.getStatus();
    args.publish({
        to: "venttys_graphql_api",
        event: Events.STATUS,
        data: { status }
    });
};