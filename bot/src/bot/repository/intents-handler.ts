import BotModel from "../../database/models/bot.model";
import EntityModel from "../../database/models/entity.model";
import UserSessionModel from "../../database/models/bot-session.model";
import { iLogger } from "../../interfaces/logger.interface";
import { BotIntent, BOT_TAGS_TO_END, BOT_TAG_COMPLETED, BOT_TAG_DEFAULT, BOT_TAG_WAITING, NOTIFICATION_TAG } from "../domain/bot-intent.entity";
import { ProductOwnerRepository, CommerceSourceEntity } from "../../interfaces/commerce.repository.interface";
import { BotEntity } from "../domain/bot.entity";
import { BotSessionVar } from "../domain/bot.session.entity";
import { isJSON, safeStructureDecode } from "../../utils/isJSON";

export class IntentsHandler<TData> implements IntentsHandlerRepository {

    private readonly TAG = "IntentsHandler";
    private readonly commerce: ProductOwnerRepository<CommerceSourceEntity, TData>;
    private commerceInfo!: CommerceSourceEntity;
    private readonly logger: iLogger;
    private intents: BotIntent[] = [];
    private entities: BotEntity[] = [];

    constructor(commerce: ProductOwnerRepository<CommerceSourceEntity, TData>, logger: iLogger) {
        this.logger = logger;
        this.commerce = commerce;
        this.setupComerce();
    }

    private async setupComerce(): Promise<void> {
        this.commerceInfo = await this.commerce.getInfo();
        this.entities = await EntityModel.find();
        const { botCode = BOT_TAG_DEFAULT } = this.commerceInfo;
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
        await this.setupComerce();
        let intentPattern = args.pattern.toLowerCase();

        /** GET CUSTOMER SESSION */
        const isNotification = args.pattern === NOTIFICATION_TAG;
        const maxSessionTime = 30;
        const sessionActive = isNotification ? {} : { is_active: true };
        let [userSession] = await UserSessionModel
            // TODO: Pending filter by period lower at today.
            .find({ phone: args.customerPhoneNumber, ...sessionActive })
            .sort({ updatedAt: -1 })
            .limit(1)
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
            const sessionHasEnded = BOT_TAGS_TO_END.includes((userSession.currentIntent as BotIntent).tag);

            // Update the session time live.
            if ((elapseSessionTime < maxSessionTime && !sessionHasEnded) || isNotification) {
                userSession.updatedAt = new Date();
                this.logger.log({
                    tag: this.TAG,
                    type: "DEBUG",
                    msg: `Updating session, is a notification: ${isNotification}.`
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
            /**
             * SESSION VARS - START PROCESS TO SAVE.
             */
            const tags = (userSession.currentIntent as BotIntent).next_tags;

            if (tags[0] === BOT_TAG_WAITING) {
                const sessionVarName = (userSession.currentIntent as BotIntent).session_var_to_save || "";
                // Save the multiple sessions vars
                const varIndex = userSession.vars.findIndex(({ key = "" }) => `${key}` === `${sessionVarName}`);
                const entity = this.entities.find(({ code }) => code === sessionVarName);
                // The entity the value type can look {path[0]:value, path[1]:value,...}
                // Or also can look "value" (string),
                // All that depend if has path.
                let contentVar: string | Record<string, string> = "";
                if (entity) {
                    const { path = [] } = entity;
                    const varsContent = args.pattern.split("\n");
                    if (path.length) {
                        // If entity has path the build the object to save the content
                        contentVar = path.reduce((obj, key, index) => ({
                            ...obj,
                            [key]: varsContent[index]
                        }), {} as Record<string, string>);
                    } else {
                        // If entity hasn't path then save raw content
                        contentVar = args.pattern;
                    }
                }

                // If session var right now exist then update its value
                if (varIndex >= 0) {
                    // IMPORTANT:
                    // The content to session-vars entry from user must only be a 
                    // entity?.type == array then content is Record<string,string>[] | string[]
                    // entity?.type == single then content is Record<string,string> | string.
                    let currentContent = userSession?.vars[varIndex].content;

                    this.logger.log({
                        tag: this.TAG,
                        type: "DEBUG",
                        msg: `Update session var '${sessionVarName}' ` +
                            `type: ${contentVar}\n` +
                            `with value: ${contentVar}\n` +
                            `Current content: ${currentContent}`
                    });

                    switch (entity?.type) {
                        case "array":
                            // Recover original form variable.
                            currentContent = currentContent
                                ? JSON.parse(currentContent)
                                : [];
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            userSession!.vars[varIndex].content = JSON.stringify([
                                ...currentContent,
                                contentVar
                            ]);
                            break;
                        case "single":
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            userSession!.vars[varIndex].content = contentVar;
                            break;
                    }
                }
                // Save the new session var and its value.
                else {
                    this.logger.log({
                        tag: this.TAG,
                        type: "DEBUG",
                        msg: `Save new session var '${sessionVarName}' ` +
                            `with value: ${contentVar}\n`
                    });
                    switch (entity?.type) {
                        case "array":
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            userSession.vars.push({
                                key: sessionVarName,
                                type: entity?.type,
                                content: JSON.stringify([contentVar])
                            });
                            break;
                        case "single":
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            userSession.vars.push({
                                key: sessionVarName,
                                type: entity?.type,
                                content: contentVar
                            });
                    }
                }

                // Navigate to next_tag[1] in case the intent is bad setting 
                // then navigate to default intent.
                [dialogResponse] = this.intents
                    .filter((intent) => intent.tag === (tags[1] || BOT_TAG_DEFAULT));
            }
            // Si el patron de la intencion actual no esta en modo de espera
            // entonces retorna el mensaje predeterminado
            else {
                [dialogResponse] = this.intents
                    .filter((intent) => intent.tag === BOT_TAG_DEFAULT);
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
            commerceInfo: this.commerceInfo,
            customerPhoneNumber: args.customerPhoneNumber,
            sessionVars: userSession?.vars || [],
            extraVars: dialogResponse.response_options_from_commerce
                ? [dialogResponse.response_options_from_commerce.response_code]
                : []
        });

        await userSession.save();
        if (dialogResponse.tag === BOT_TAG_COMPLETED) {
            this.commerce.runAction(args.customerPhoneNumber, userSession.toObject())
                .catch(error => this.logger.log({
                    tag: this.TAG,
                    type: "ERROR",
                    msg: JSON.stringify(error)
                }));
        }
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
                // IMPORTANT:
                // The content to session-vars entry from user must only be a 
                // entity?.type == array then content is Record<string,string>[] | string[]
                // entity?.type == single then content is Record<string,string> | string.

                // The entity the value type can look {path[0]:value, path[1]:value,...}
                // Or also can look "value" (string),
                // All that depend if has path.

                // Models: single | array
                // Variables => string | string[]
                const { content = "", type = "single" } = args.sessionVars
                    .find(({ key }) => key === entity.code) || {};

                if (entity.collectionName !== "computed") {
                    let rawContent: string | string[] | Record<string, unknown> | Record<string, unknown>[];
                    if (type === "single") {
                        if (entity.path.length > 0) {
                            // Object string
                            // console.log("Computed var: ", content, "\nentity:", entity);
                            rawContent = JSON.parse(content || entity.defaultValue || "{}");
                        } else {
                            // Single string
                            rawContent = content || entity.defaultValue || "*Undefined*";
                        }
                    } else {
                        if (entity.path.length > 0) {
                            // Array String
                            rawContent = JSON.parse(content || entity.defaultValue || "[]");
                        } else {
                            // Array Object
                            rawContent = JSON.parse(content || entity.defaultValue || "[]");
                        }
                    }
                    varContent[variable] = rawContent;
                }
                /** COMPUTED VARS */
                else {
                    // console.log("Initial Vars: ", entity.fromMathOperations);
                    // console.log("Map Session Vars: ", args.sessionVars);
                    const initialResults = entity.fromMathOperations?.map(OpMath => {
                        const vars = OpMath.vars.map(keys => {
                            const content = keys.split("|").reduce((acc, key, index, array) => {
                                if (index === 0) {
                                    let rawVal = args.sessionVars.find(({ key: sVarkey }) => sVarkey === key)?.content || "*C.Var-Undefined*";
                                    if (isJSON(rawVal)) {
                                        rawVal = JSON.parse(rawVal);
                                    }
                                    // console.log("***->Initial Value : ", rawVal);
                                    return rawVal;
                                }
                                if (index === (array.length - 1)) {
                                    if (acc[key]) {
                                        // console.log(`***->${key} The value is defined then return value: `, acc[key]);
                                        return acc[key];
                                    }
                                    if (acc instanceof Array) {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        return (acc as Array<any>).map(val => {
                                            // console.log("***-> Extracted value: ", val[key] || val);
                                            return val[key] || val;
                                        });
                                    }
                                    // console.log("***->Previus Item ", acc);
                                    return acc;
                                }
                                return acc[key];
                            }, "" as any);
                            return content;
                        });

                        // console.log("**->Variables: ", vars);
                        const lines: string[] = [];
                        if (vars.length > 0) {
                            if (vars[0] instanceof Array) {
                                (vars[0] as Array<any>).forEach((_var, innerIndex) => {
                                    const newContent = vars.reduce((acc, val, index) => {
                                        const [type1, var1] = safeStructureDecode(acc);
                                        const [type2, var2] = safeStructureDecode(vars[index][innerIndex]);
                                        // console.log("Before math var 1: ", type1, var1);
                                        // console.log("Before math var 2: ", type2, var2);
                                        if (type1 === "number" && type2 === "number") {
                                            if (OpMath.operation === "+") return <number>var1 + <number>var2;
                                            if (OpMath.operation === "-") return <number>var1 + <number>var2;
                                            if (OpMath.operation === "*") return <number>var1 * <number>var2;
                                            if (OpMath.operation === "/") return <number>var1 / <number>var2;
                                        }
                                        return `${acc} ${vars[index][innerIndex]}`;
                                    }, "");
                                    lines.push(newContent);
                                    // console.log("***-> Computed new Content: ", newContent);
                                });
                            } else {
                                lines.push("**Undefined**");
                            }
                        }
                        // console.log("***-> Computed Line: ", lines);
                        return lines;
                    });

                    if (entity.type === "single") {
                        varContent[variable] = initialResults?.map((line) => {
                            const r = line.reduce((acc, val, index) => {
                                const [t, v] = safeStructureDecode(`${val}`);

                                if (t === "string") {
                                    const resp = acc + v;
                                    return index === 0 ? resp : ", " + resp;
                                }
                                if (t === "number") {
                                    if (index === 0) return v;
                                    const s = acc + v;
                                    return s;
                                }
                                acc[index] = val;
                                return acc;
                            }, "" as any);
                            return [[r]];
                        });
                    } else {
                        varContent[variable] = initialResults?.join("\n");
                    }
                    // console.log("***-> Computed vars: ", varContent[variable]);
                }
            } else {
                console.log("Entity: ", entity);
                // Models: single | object | array | array-object
                // Variables => string[] | Record<string, string|number>[]
                // Buttons or List => string[][] | Record<string,string|number>[][]
                varContent[variable] =
                    await this.commerce.getResolveEntity(entity, args.customerPhoneNumber) ||
                    entity.defaultValue
                    || "*Undefined*";
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
                    _response = _response.replace(regex, value.join("\n"));
                } else {
                    _response = _response.replace(regex, value);
                }
                // Is used only for Notification_TAG
                const simpleRegex = new RegExp(`${variable}`, "g");
                _response = _response.replace(simpleRegex, value as string);
            }
            responses.push(_response);
        }

        // Content to option-buttons | option-list from commerce.
        if (response_options_from_commerce) {
            // Models: array | array-object
            // Buttons or List => string[][] | Record<string,string|number>[][]
            const _varContent: string[] | Record<string, unknown>[] =
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                varContent[response_options_from_commerce.response_code] as any;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            args.intent.response_options_from_commerce!.response = _varContent ? _varContent : [];
        }
        return responses;
    }
}

interface ReplaceVarsArgs {
    intent: BotIntent,
    commerceInfo: CommerceSourceEntity,
    customerPhoneNumber: string,
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

