import { app } from "mydog";
import { serverType } from "../common/someConfig";
import { MapIdMgr } from "../svr_map/mapIdMgr";

let infoArr = app.serversConfig[serverType.info];
/**
 * 获取玩家信息server id
 * @param uid 
 */
export function getInfoId(uid: number) {
    return infoArr[uid % infoArr.length].id;
}



export function getCharLen(charCode: number) {
    if (charCode >= 48 && charCode <= 57) { // 0-9
        return 1;
    }
    if (charCode >= 65 && charCode <= 90) { // A-Z
        return 1;
    }
    if (charCode >= 97 && charCode <= 122) { // a-z
        return 1;
    }
    return 2;
}
