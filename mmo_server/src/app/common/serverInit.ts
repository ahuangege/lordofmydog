import { Application, app, Session } from "mydog";
import * as path from "path";
import { loadSkill } from "../svr_map/skill/skillMgr";
import { ConMgr } from "../svr_connector/conMgr";
import { svr_con } from "../svr_connector/svr_con";
import { RoleInfoMgr } from "../svr_info/roleInfoMgr";
import { svr_info } from "../svr_info/svr_info";
import { LoginMgr } from "../svr_login/loginMgr";
import { svr_login } from "../svr_login/svr_login";
import { MapMgr } from "../svr_map/mapMgr";
import { PathFindMgr } from "../svr_map/pathFindMgr";
import { svr_map } from "../svr_map/svr_map";
import { getInfoId } from "../util/gameUtil";
import { MysqlClient } from "../util/mysql";
import { cfgReloadAll } from "./configUtil";
import { getCpuUsage } from "./cpuUsage";
import { mysqlConfig } from "./dbConfig";
import { createHttpModuleSvr } from "./httpModuleSvr";
import { constKey, serverType } from "./someConfig";



export function initServer() {
    cfgReloadAll();
    switch (app.serverType) {
        case serverType.login:
            loginInit(app);
            break;
        case serverType.connector:
            connectorInit(app);
            break;
        case serverType.info:
            infoInit(app);
            break;
        case serverType.map:
            mapInit(app);
            break;
        default:
            break;
    }

}

// 登录服
function loginInit(app: Application) {
    svr_login.mysql = new MysqlClient(getConfigByEnv(app, mysqlConfig));
    svr_login.loginMgr = new LoginMgr(app);
    let httpSvr = createHttpModuleSvr(app.env === "production", app.serverInfo.loginHttpPort, path.join((app as any).base, "app/svr_login/modules"), "loginHttp");
    httpSvr.start();
    // console.log(1111)
}

// 网关服
function connectorInit(app: Application) {
    svr_con.mysql = new MysqlClient(getConfigByEnv(app, mysqlConfig));
    svr_con.conMgr = new ConMgr();
}

// 信息服
function infoInit(app: Application) {
    svr_info.mysql = new MysqlClient(getConfigByEnv(app, mysqlConfig));
    svr_info.roleInfoMgr = new RoleInfoMgr(app);
}


// 地图服
function mapInit(app: Application) {
    svr_map.pathFindMgr = new PathFindMgr();
    svr_map.mapMgr = new MapMgr();
    loadSkill();
}






/** mydog list 监控 */
export function on_mydoglist_func() {
    let onlineNum = "--";
    if (app.serverType === serverType.connector) {
        onlineNum = app.clientNum.toString();
    }
    return [
        { "title": "cpu(%)", "value": getCpuUsage() },
        { "title": "onlineNum", "value": onlineNum },
    ];
}

/** 路由 */
export function routeFunc() {
    app.route(serverType.info, (session: Session) => {
        return getInfoId(session.uid);
    });
    app.route(serverType.map, (session: Session) => {
        return session.get(constKey.mapSvr);
    });
}


/** 根据环境获取配置 */
export function getConfigByEnv(app: Application, config: { [env: string]: any }) {
    if (config[app.env] === undefined) {
        return config["development"];
    } else {
        return config[app.env];
    }
}