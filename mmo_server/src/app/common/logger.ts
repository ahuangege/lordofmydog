import * as log4js from "log4js"
import { Application } from "mydog";

let logLevel: { [key: string]: string } = {
    "production": "info",
}

let config: log4js.Configuration = {
    appenders: {
        gameLog: {
            type: 'file',
            filename: './log/gameLog_serverId.log',
            maxLogSize: 10 * 1024 * 1024,
            backups: 5
        },
        out: {
            type: 'stdout'
        }
    },
    categories: {
        default: { appenders: ['out'], level: 'all' },
        gameLog: { appenders: ['out', "gameLog"], level: 'all' }
    }
};

// 替换文件名的服务器id
function replaceServerId(app: Application) {

    for (let x in config.appenders) {
        let one: any = config.appenders[x];
        if (one.filename) {
            one.filename = (one.filename as string).replace("serverId", app.serverId);
        }
    }
    let level = logLevel[app.env] || "all";
    for (let x in config.categories) {
        config.categories[x].level = level;
    }
    log4js.configure(config);
}

export function log4js_init(app: Application) {
    replaceServerId(app);
};


/**
 * 游戏日志
 */
export let gameLog = log4js.getLogger("gameLog");