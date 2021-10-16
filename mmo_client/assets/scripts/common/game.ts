import { I_loginBack } from "../login/loginPanel";

export class Game {

    static uid: number = 0;
    static loginInfo: I_loginBack = null as any;
    static roleInfo: I_roleInfo = null as any;
}


export interface I_roleInfo {
    "uid": number,              // uid
    "accId": number,            // 账号id
    "nickname": string,         // 昵称
    "gold": number,             // 金币
    "heroId": number,           // 英雄id
    "level": number,            // 等级
    "exp": number,              // 经验值
    "mapId": number,            // 当前地图
    "mapSvr": string,
    "mapIndex": number,
}