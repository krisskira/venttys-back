export const isJSON = (str: string): boolean => {
    try {
        JSON.parse(str);
    } catch (_) {
        return false;
    }
    return true;
};


export function safeStructureDecode(str: string): [
    "string" | "number" | "Object" | "Array" | undefined,
    string | number | Record<string, unknown> | Array<unknown>
] {
    if (typeof str !== "string") return [undefined, str];
    if (str.trim() === "") return ["string", str];

    try {
        let result = parseFloat(str);
        if(isFinite(result)){
            return ["number", result];
        }
        result = JSON.parse(str);
        const type = Object.prototype.toString.call(result);
        if (type === "[object Object]") {
            return ["Object", result];
        }
        if (type === "[object Array]") {
            return ["Array", result];
        }
        if (type === "[object Number]") {
            return ["number", result];
        }
    } catch (err) {
        return ["string", str];
    }
    return [undefined, str];
}

export default {
    isJSON,
    hasJsonStructure: safeStructureDecode
};