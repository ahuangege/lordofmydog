"use strict";
exports.__esModule = true;
exports.mydog_send = exports.mydog_cmd = void 0;
var fs = require("fs");
var path = require("path");
/** 接收 mydog cmd 命令 */
function mydog_cmd(lans, cmdObjArr) {
    // console.log(lans, cmdObjArr);
    if (lans.includes("ts")) {
        var endStr = 'export const enum cmd {\n';
        for (var _i = 0, cmdObjArr_1 = cmdObjArr; _i < cmdObjArr_1.length; _i++) {
            var one = cmdObjArr_1[_i];
            if (one.note) {
                endStr += "\t/**\n\t * " + one.note + "\n\t */\n";
            }
            var oneStr = one.cmd;
            if (one.cmd.indexOf('.') !== -1) {
                var tmpArr = one.cmd.split('.');
                oneStr = tmpArr[0] + '_' + tmpArr[1] + '_' + tmpArr[2];
            }
            endStr += "\t" + oneStr + " = \"" + one.cmd + "\",\n";
        }
        endStr += '}';
        fs.writeFileSync(path.join(__dirname, "../../mmo_client/assets/scripts/common/cmdClient.ts"), endStr);
    }
}
exports.mydog_cmd = mydog_cmd;
/** 接收 mydog send 命令的消息回调 */
function mydog_send(reqArgv, timeoutIds, data) {
    console.log(data);
}
exports.mydog_send = mydog_send;
