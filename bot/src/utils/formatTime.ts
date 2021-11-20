import { Time } from "../interfaces/commerce.interface";
export function formatTime({ hour, minute }: Time): string {
    let hs = (hour > 12 ? hour - 12 : (hour == 0 ? 12 : hour)).toString();
    let ms = minute.toString();
    hs = hs.length === 1 ? "0" + hs : hs;
    ms = ms.length === 1 ? "0" + ms : ms;
    ms += hour > 12 ? " p.m." : " a.m.";
    return hs + ":" + ms;
}