
/** 账号 */
export class Db_account {
    /** 账号id */
    id = 0;

    /** 账号名 */
    username = "";

    /** 密码 */
    password = "";

    /** 注册时间 */
    regTime = Date.now();

    /** 上次登录的角色id */
    lastUid = 0;

    constructor() { }
}
