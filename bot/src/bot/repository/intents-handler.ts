import BotModel from "../../database/models/bot.model";
import EntityModel from "../../database/models/entity.model";
import UserSessionModel from "../../database/models/bot-session.model";
import { iCommerce } from "../../interfaces/commerce.interface";
import { iLogger } from "../../interfaces/logger.interface";
import { BotIntent } from "../domain/bot-intent.entity";
import { CommerceRepository } from "./commerce.repository";
import { BotEntity } from "../domain/bot.entity";
import { BotSessionVar } from "../domain/bot.session.entity";


interface ReplaceVarsArgs {
    intent: BotIntent,
    commerceInfo: iCommerce,
    sessionVars: BotSessionVar[],
    extraVars?: string[]
}

interface BotQueryArgs {
    pattern: string,
    customerPhoneNumber: string
}

export interface IntentsHandlerRepository {
    botQueryByTag(args: BotQueryArgs): Promise<BotIntent>;
}

export class IntentsHandler implements IntentsHandlerRepository {

    private readonly TAG = "IntentsHandler";
    private readonly commerce: CommerceRepository;
    private readonly logger: iLogger;
    private commerceInfo!: iCommerce;
    private intents: BotIntent[] = [];
    private entities: BotEntity[] = [];

    constructor(commerce: CommerceRepository, logger: iLogger) {
        this.logger = logger;
        this.commerce = commerce;
        this.commerce.getInfo()
            .then((commerceInfo) => {
                this.setupCommerceInfo(commerceInfo)
                    .catch(error => { throw error; });
            })
            .catch(error => { throw error; });
    }

    async setupCommerceInfo(commerceInfo: iCommerce): Promise<void> {
        this.commerceInfo = commerceInfo;
        const botCode = this.commerceInfo?.botCode || "default";
        this.entities = await EntityModel.find();
        const bot = await BotModel.findOne({ code: botCode }).populate<BotIntent>("intents");
        if (!bot) {
            const errorMessage = "BotCode not found";
            this.logger.log({
                tag: this.TAG,
                type: "ERROR",
                msg: errorMessage
            });
            throw errorMessage;
        }
        this.intents = <BotIntent[]>bot.toObject().intents;
    }

    async botQueryByTag(args: BotQueryArgs): Promise<BotIntent> {
        const maxSessionTime = 30;
        let intentPattern = args.pattern.toLowerCase();

        /** GET CUSTOMER SESSION */

        let userSession = await UserSessionModel
            .findOne({ phone: args.customerPhoneNumber, is_active: true })
            .populate("currentIntent");

        if (!userSession) {
            userSession = await new UserSessionModel({
                phone: args.customerPhoneNumber,
                currentIntent: this.intents[0],
                is_active: true,
                vars: [],
            });
            const [pattern] = this.intents[0].pattern;
            intentPattern = pattern || "start";
            this.logger.log({
                tag: this.TAG,
                type: "DEBUG",
                msg: "Create session..."
            });
        } else {
            const elapseSessionTime = (Date.now() - (userSession.updatedAt?.getTime() || Date.now())) / 60000;
            const sessionHasEnded = [
                "Completed",
                "Close",
                "End",
                "NeedHuman"
            ].includes((userSession.currentIntent as BotIntent).tag);

            // Update the session time live.
            if (elapseSessionTime < maxSessionTime && !sessionHasEnded) {
                userSession.updatedAt = new Date();
                this.logger.log({
                    tag: this.TAG,
                    type: "DEBUG",
                    msg: "Refesh session..."
                });
            }
            // As the session has expired then is created a new session.
            else {
                userSession.is_active = false;
                await userSession.save();
                userSession = await new UserSessionModel({
                    phone: args.customerPhoneNumber,
                    currentIntent: this.intents[0],
                    is_active: true,
                    vars: [],
                });
                const [pattern] = this.intents[0].pattern;
                intentPattern = pattern || "start";
                this.logger.log({
                    tag: this.TAG,
                    type: "DEBUG",
                    msg: "Create a new session..."
                });
            }
        }
        /** END CUSTOMER SESSION */

        /** GET INTENT */

        let [dialogResponse] = this.intents
            .filter((intent) => intent.pattern
                .map(i => i.toLocaleLowerCase())
                .includes(intentPattern));

        // Save the conversation status.
        if (dialogResponse) {
            userSession.currentIntent = dialogResponse;
        }
        // If the user response don't match with intent patterns then
        // verify if the next_tag key is "waiting", if that is true then
        // save the user response in session vars else responde with 
        // Default intent content.
        else {
            const tags = (userSession.currentIntent as BotIntent).next_tags;

            if (tags[0] === "waiting") {
                const sessionVarsName = (userSession.currentIntent as BotIntent).session_var_to_save || "";
                // Save the multiple sessions vars
                sessionVarsName.split("|").forEach(sessionVarName => {
                    const varIndex = userSession?.vars.findIndex(({ key }) => key === sessionVarName) || -1;
                    const entity = this.entities.find(({ code }) => code === sessionVarName);

                    // If session var right now exist then update its value
                    if (varIndex >= 0) {
                        let currentContent = userSession?.vars[varIndex].content;

                        this.logger.log({
                            tag: this.TAG,
                            type: "DEBUG",
                            msg: `Update session var '${sessionVarName}' ` +
                                `type: ${args.pattern}\n` +
                                `with value: ${args.pattern}\n` +
                                `Current content: ${currentContent}`
                        });

                        // IMPORTANT:
                        // The content to session-vars entry from user must
                        // only be a string[] | string.
                        switch (entity?.type) {
                            case "array":
                                // Recover original form of variable.
                                currentContent = currentContent
                                    ? JSON.parse(currentContent)
                                    : [];
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                userSession!.vars[varIndex].content = JSON.stringify([
                                    ...(currentContent as unknown as Array<string | number>),
                                    args.pattern
                                ]);
                                break;
                            case "single":
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                userSession!.vars[varIndex].content = args.pattern;
                                break;
                        }
                    }
                    // Save the new session var and its value.
                    else {
                        this.logger.log({
                            tag: this.TAG,
                            type: "DEBUG",
                            msg: `Save new session var '${sessionVarName}' ` +
                                `with value: ${args.pattern}\n`
                        });
                        switch (entity?.type) {
                            case "array":
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                userSession!.vars.push({
                                    key: sessionVarName,
                                    type: entity?.type,
                                    content: JSON.stringify([args.pattern])
                                });
                                break;
                            case "single":
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                userSession!.vars.push({
                                    key: sessionVarName,
                                    type: entity?.type,
                                    content: args.pattern
                                });
                        }
                    }
                });
                // Navigate to next_tag[1] in case the intent is bad setting 
                // then navigate to default intent.
                [dialogResponse] = this.intents
                    .filter((intent) => intent.tag === (tags[1] || "Default"));
            }
            // Si el patron de la intencion actual no esta en modo de espera
            // entonces retorna el mensaje predeterminado
            else {
                [dialogResponse] = this.intents
                    .filter((intent) => intent.tag === "Default");
            }
            // asigna a la session la nueva posicion actual de la conversacion.
            userSession.currentIntent = dialogResponse;
        }

        /** END GET INTETN */

        /** GET VARIABLES */

        // TODO: REPLACE VARS USING => 👇👇👇
        // `expression = new RegExp(/\#\#(.*?)\#\#/g)`
        // `dialogResponse.response.match(expression)`
        // Result is `["##var_1##","##var_2##"]`
        // Next you can result.map(varible => variable.replace(/\#/g,""))

        // Replace all simple variables in respose messages.
        dialogResponse.response = await this.replaceVariables({
            intent: dialogResponse,
            sessionVars: userSession.vars,
            commerceInfo: this.commerceInfo,
            extraVars: dialogResponse.response_options_from_commerce
                ? [dialogResponse.response_options_from_commerce.response_code]
                : []
        });

        await userSession.save();
        return dialogResponse;
    }

    private async replaceVariables(args: ReplaceVarsArgs): Promise<string[]> {
        const responses: string[] = [];
        const extraVars = args.extraVars || [];
        const { response: textToRespondToUser, variables, response_options_from_commerce, response_options_type } = args.intent;

        const varContent: Record<string, unknown> = {};

        // Create a object to save all result data to 
        // session vars, computed vars and commerce vars
        for (const variable of [...variables, ...extraVars]) {
            const entity = this.entities.find(({ code }) => code === variable);
            if (!entity) {
                const errorMessage = "" +
                    `The entities has bad configured to commerce: '${this.commerceInfo.phone}'\n` +
                    `Entity: ${variable} not found.`;
                this.logger.log({ tag: this.TAG, type: "ERROR", msg: errorMessage });
                throw errorMessage;
            }

            if (entity.isSessionVar) {
                // Models: single | array
                // Variables => string | string[]
                const { content } = args.sessionVars
                    .find(_var => _var.key === entity.code) || {};
                // TODO: Calculate math operation entity.fromMathOperations.
                varContent[variable] = content || entity.defaultValue || "undefined content";
                console.log("Variables de session: ",args.sessionVars);
                console.log("Entidad: ",entity);
            } else {
                // Models: single | object | array | array-object
                // Variables => string[] | Record<string, string|number>[]
                // Buttons or List => string[][] | Record<string,string|number>[][]
                varContent[variable] = await this.commerce.getResolveEntity(entity);
            }
        }

        // Replace the variables to user response.
        for (const respondToUser of textToRespondToUser) {
            // Models: single | array
            // Variables => string | string[]
            let _response = respondToUser;
            for (const variable in varContent) {
                const regex = new RegExp(`##${variable}##`, "g");
                const value = varContent[variable] as (string | string[]);
                if (value instanceof Array) {
                    _response = _response.replace(regex, value.join(", "));
                } else {
                    _response = _response.replace(regex, value);
                }
            }
            responses.push(_response);
        }

        // Content to option-buttons | option-list from commerce.
        if (response_options_from_commerce) {
            // Models: array | array-object
            // Buttons or List => string[][] | Record<string,string|number>[][]

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const _varContent: string[] | Record<string, unknown>[] = varContent[response_options_from_commerce.response_code] as any;
            console.log("***-> Contenido de la variable desde el comercio ", _varContent);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            args.intent.response_options_from_commerce!.response = _varContent ? _varContent : [];
        }
        return responses;
    }
}

