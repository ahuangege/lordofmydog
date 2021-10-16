// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../common/cmdClient";
import { network } from "../common/network";
import { UIMgr } from "../common/uiMgr";
import { RolelistMain } from "./rolelistMain";
import { I_roleOne } from "./roleOne";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.EditBox)
    nameInput: cc.EditBox = null;

    start() {
        network.addHandler(cmd.connector_role_createRole, this.svr_createRole, this);
    }

    btn_close() {
        this.node.destroy();
    }

    btn_create() {
        network.sendMsg(cmd.connector_role_createRole, { "heroId": 1, "nickname": this.nameInput.string });
    }

    private svr_createRole(msg: { "code": number, "role": I_roleOne }) {
        if (msg.code !== 0) {
            UIMgr.showErrcode(msg.code);
            return;
        }
        RolelistMain.instance.onCreateRoleOk(msg.role);
        this.node.destroy();
    }

    onDestroy() {
        network.removeThisHandlers(this);
    }
}
