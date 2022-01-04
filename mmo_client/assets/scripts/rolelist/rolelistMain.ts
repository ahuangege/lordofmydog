// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../common/cmdClient";
import { Game, I_roleInfo } from "../common/game";
import { network } from "../common/network";
import { UIMgr } from "../common/uiMgr";
import { I_roleOne, RoleOne } from "./roleOne";

const { ccclass, property } = cc._decorator;

@ccclass
export class RolelistMain extends cc.Component {

    static instance: RolelistMain = null;

    rolelist: RoleOne[] = [];

    onLoad() {
        RolelistMain.instance = this;
    }

    start() {
        network.onClose(this.svr_onClose, this);
        network.onOpen(this.svr_onOpen, this);
        network.connect(Game.loginInfo.host, Game.loginInfo.port, Game.isHttps);

        let roleParent = cc.find("rolelist/list", this.node);
        for (let one of roleParent.children) {
            this.rolelist.push(one.getComponent(RoleOne));
        }
    }

    private svr_onClose() {
        UIMgr.showSomeInfo("网络异常，请重新登录！", false, () => {
            cc.director.loadScene("login");
        });
    }



    private svr_onOpen() {
        network.addHandler(cmd.connector_role_getRoleList, this.svr_getRoleListBack, this);
        network.addHandler(cmd.connector_role_deleteRole, this.svr_delRole, this);
        network.addHandler(cmd.onKicked, this.svr_onKicked, this);
        network.sendMsg(cmd.connector_role_getRoleList, { "accId": Game.loginInfo.accId, "accToken": Game.loginInfo.accToken });
    }

    private svr_getRoleListBack(msg: { "code": number, "list": I_roleOne[], "lastUid": number }) {
        if (msg.code !== 0) {
            network.disconnect();
            UIMgr.showErrcode(msg.code, false, () => {
                cc.director.loadScene("login");
            });
            return;
        }
        if (msg.list.length === 0) {
            return;
        }
        let selectIndex = 0;
        for (let i = 0; i < msg.list.length; i++) {
            this.rolelist[i].init(msg.list[i]);
            if (msg.list[i].uid === msg.lastUid) {
                selectIndex = i;
            }
        }
        this.rolelist[selectIndex].selected = true;
    }

    onCreateRoleOk(role: I_roleOne) {
        let newRole: RoleOne;
        for (let one of this.rolelist) {
            if (!one.info && !newRole) {
                newRole = one;
                break
            }
            if (one.selected) {
                one.selected = false;
            }
        }
        newRole.init(role);
        newRole.selected = true;
    }


    private svr_delRole(msg: { "code": number, "uid": number }) {
        if (msg.code !== 0) {
            UIMgr.showErrcode(msg.code);
            return;
        }
        let delOne: RoleOne;
        for (let one of this.rolelist) {
            if (one.info && one.info.uid === msg.uid) {
                delOne = one;
                break;
            }
        }
        if (!delOne) {
            return;
        }
        delOne.be_delete();
    }

    update() {
        network.readMsg();
    }


    btn_close() {
        network.disconnect();
        cc.director.loadScene("login");
    }

    btn_enterGame() {
        let selectRole: RoleOne;
        for (let one of this.rolelist) {
            if (one.selected) {
                selectRole = one;
                break;
            }
        }
        if (!selectRole) {
            UIMgr.showSomeInfo("当前未选择角色");
            return;
        }
        network.addHandler(cmd.connector_main_enter, this.svr_enterBack, this);
        network.sendMsg(cmd.connector_main_enter, { "uid": selectRole.info.uid });
    }

    private svr_onKicked(msg: { code: number }) {
        network.disconnect();
        UIMgr.showErrcode(msg.code, false, () => {
            cc.director.loadScene("login");
        });
    }

    private svr_enterBack(msg: { "code": number, "role": I_roleInfo }) {
        if (msg.code !== 0) {
            UIMgr.showErrcode(msg.code);
            return;
        }
        Game.uid = msg.role.uid;
        Game.roleInfo = msg.role;
        Game.mapId = msg.role.mapId;
        cc.director.loadScene("map");
    }

    onDestroy() {
        network.removeThisHandlers(this);
        RolelistMain.instance = null;
    }

}
