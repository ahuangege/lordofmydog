
import { connector, createApp, Session } from "mydog";
let app = createApp();
app.appName = "lord of mydog";

import { gameLog, log4js_init } from "./app/common/logger";
log4js_init(app);

import { msgDecode, msgEncode } from "./app/common/encode_decode";
import { initServer, on_mydoglist_func, routeFunc } from "./app/common/serverInit";
import { serverType } from "./app/common/someConfig";
import { onUserIn, onUserLeave } from "./servers/connector/handler/main";


initServer();
app.configure(serverType.connector, routeFunc);
app.setConfig("mydogList", on_mydoglist_func);
app.setConfig("connector", { "connector": connector.Ws, "clientOnCb": onUserIn, "clientOffCb": onUserLeave, "interval": 50, "noDelay": false });
app.setConfig("rpc", { "interval": 30, "noDelay": false });
app.setConfig("encodeDecode", { "msgDecode": msgDecode, "msgEncode": msgEncode });
app.setConfig("logger", (type, level, info) => {
    if (type === "msg") {
        gameLog[level](info);
    }
})
app.start();

process.on("uncaughtException", function (err: any) {
    gameLog.error(err)
});


