

/** 一些key */
export const enum constKey {
    mysql = "mysql",
    loginSvr = "login",
    duplicateKey = 1062,    // mysql 主键已存在
    match = "match",

    mapSvr = "mapSvr",  // 所在地图服务器id
    mapIndex = "mapIndex",  // 所在地图编号
    accId = "accId",    // 账号id
    uids = "uids",  // 已建角色id

    notTellInfoSvr = "notTellInfoSvr",
}

/** 服务器类型 */
export const enum serverType {
    login = "login",
    connector = "connector",
    info = "info",
    map = "map",
}

