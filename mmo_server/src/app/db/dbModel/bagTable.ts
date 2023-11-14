
/** 背包 */
export class Db_bag {
    /** 角色id */
    uid = 0;

    /** 背包道具 */
    items: I_bagItem[] = [];

    constructor() { }
}


export interface I_bagItem {
    i: number,
    id: number,
    num: number,
}
