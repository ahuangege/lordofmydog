import * as path from "path";
import * as fs from "fs";
import * as http from "http";
import * as url from "url";
import { ip_str2int } from "../util/util";
import { gameLog } from "./logger";

export function createHttpModuleSvr(port: number, moduleDir: string, svrName: string) {
    return new HttpModuleSvr(port, moduleDir, svrName);
}

const errList = {
    cmdErr: JSON.stringify({ "code": 802, "errMsg": "no cmd" }),
    needPost: JSON.stringify({ "code": 803, "errMsg": "need post" }),
    needJson: JSON.stringify({ "code": 804, "errMsg": "need json" }),
    fastErr: JSON.stringify({ "code": 808, "errMsg": "request too fast" }),
}

class HttpModuleSvr {
    private svrName: string = "";
    private port: number = 0;
    private moduleDir: string = "";
    private modules: { [moduleName: string]: { [file: string]: any } } = {};
    private moduleBefore: { [moduleName: string]: (msg: any, cb: (errMsg?: any) => void) => void } = {};
    private moduleFilter: { [moduleName: string]: (ip: number, url: string) => boolean } = {};


    constructor(port: number, moduleDir: string, svrName: string) {
        this.port = port;
        this.moduleDir = moduleDir;
        this.svrName = svrName;
    }

    private loadModule(moduleDir: string) {
        let exists = fs.existsSync(moduleDir);
        if (exists) {
            fs.readdirSync(moduleDir).forEach((moduleName) => {
                let oCurrent = path.join(moduleDir, moduleName);
                if (!fs.statSync(oCurrent).isDirectory()) {
                    return;
                }
                this.modules[moduleName] = {};
                fs.readdirSync(oCurrent).forEach((filename) => {
                    if (!filename.endsWith(".js")) {
                        return;
                    }
                    let name = path.basename(filename, '.js');
                    let handler = require(path.join(oCurrent, filename));
                    if (handler.default && typeof handler.default === "function") {
                        this.modules[moduleName][name] = new handler.default();
                    }
                });
            });
        }
    }
    public start() {
        this.loadModule(this.moduleDir);
        let server = http.createServer((request: http.IncomingMessage, response: http.ServerResponse) => {
            response.setHeader("Access-Control-Allow-Origin", "*");
            if (request.url === "/favicon.ico") {
                return response.end();
            }
            if (request.method !== "POST") {
                return response.end(errList.needPost);
            }
            let pathname: string = url.parse(request.url as any).pathname as any;
            let cmd = pathname.split("/");
            if (cmd.length !== 4) {
                return response.end(errList.cmdErr);
            }
            let module = this.modules[cmd[1]];
            if (!module) {
                return response.end(errList.cmdErr);
            }
            let file = module[cmd[2]];
            if (!file) {
                return response.end(errList.cmdErr);
            }
            if (!file[cmd[3]]) {
                return response.end(errList.cmdErr);
            }
            let ipInt = ip_str2int(request.connection.remoteAddress || "");
            if (ipInt && this.moduleFilter[cmd[1]] && this.moduleFilter[cmd[1]](ipInt, pathname)) {
                return response.end(errList.fastErr);
            }

            let msg = "";
            request.on("data", (chuck) => {
                msg += chuck;
            });
            request.on("end", () => {
                gameLog.debug(this.svrName, "↑ ", request.url, msg);

                let body: any;
                try {
                    body = JSON.parse(msg);
                } catch (e) {
                    return response.end(errList.needJson);
                }

                body.__ip = ipInt;
                let before = this.moduleBefore[cmd[1]];
                let next = this.callback(request, response);
                if (!before) {
                    file[cmd[3]](body, next);
                } else {
                    before(body, (errMsg) => {
                        if (errMsg) {
                            next(errMsg);
                        } else {
                            file[cmd[3]](body, next);
                        }
                    });
                }
            });


        });
        server.setTimeout(10 * 1000);
        server.listen(this.port, () => {
            gameLog.info("--->  [", this.svrName, "]  http listening at", this.port);
        });
        server.on("error", (err) => {
            gameLog.error("--->  [", this.svrName, "]  http error", err);
        });

    }

    private callback(request: http.IncomingMessage, response: http.ServerResponse): (data: any) => void {
        let self = this;
        return function (data: any) {
            if (data === undefined) {
                data = null;
            }
            if (data instanceof Buffer) {
                gameLog.debug(self.svrName, " ↓", request.url, "[ buffer ]");
                return response.end(data);
            }
            if (typeof data !== "string") {
                data = JSON.stringify(data);
            }
            gameLog.debug(self.svrName, " ↓", request.url, data);
            response.end(data);
        }
    }

    /**
     * 每个模块的前置处理
     * @param moduleName 模块名
     * @param before 前置函数。（注意：回调errMsg如果不为空，则会将errMsg直接返回给客户端，不再进入消息接收处）
     */
    setModuleBefore(moduleName: string, before: (msg: any, cb: (errMsg?: any) => void) => void) {
        this.moduleBefore[moduleName] = before;
    }

    setFilter(moduleName: string, filterFunc: (ip: number, url: string) => boolean) {
        this.moduleFilter[moduleName] = filterFunc;
    }
}

