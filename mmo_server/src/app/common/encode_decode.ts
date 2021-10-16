import { app } from "mydog";
import { gameLog } from "./logger";

export function msgDecode(cmd: number, msg: Buffer): any {
    let msgStr = msg.toString();
    gameLog.debug("↑ ", app.routeConfig[cmd], msgStr);
    return JSON.parse(msgStr);
}

export function msgEncode(cmd: number, msg: any): Buffer {
    let msgStr = JSON.stringify(msg);
    gameLog.debug(" ↓", app.routeConfig[cmd], msgStr);
    return Buffer.from(msgStr);
}

