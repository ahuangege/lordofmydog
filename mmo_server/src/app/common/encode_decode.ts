import { app } from "mydog";
import { cmd } from "../../config/cmd";
import { Dic } from "../util/util";
import { gameLog } from "./logger";

export function msgDecode(cmd: number, msg: Buffer): any {
    let msgStr = msg.toString();
    gameLog.debug("↑ ", app.routeConfig[cmd], msgStr);
    return JSON.parse(msgStr);
}

let encodeNot: Dic<boolean> = {
    [cmd.onMove]: true,
}
export function msgEncode(cmd: number, msg: any): Buffer {
    let msgStr = JSON.stringify(msg);
    if (!encodeNot[cmd]) {
        gameLog.debug(" ↓", app.routeConfig[cmd], msgStr);
    }
    return Buffer.from(msgStr);
}

