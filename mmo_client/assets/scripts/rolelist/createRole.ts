// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../common/cmdClient";
import { cfg_all } from "../common/configUtil";
import { network } from "../common/network";
import { UIMgr } from "../common/uiMgr";
import { getPrefab } from "../util/gameUtil";
import { RolelistMain } from "./rolelistMain";
import { I_roleOne } from "./roleOne";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.EditBox)
    nameInput: cc.EditBox = null;
    @property(cc.Node)
    heroParent: cc.Node = null;
    @property(cc.Node)
    heroPrefab: cc.Node = null;

    start() {
        network.addHandler(cmd.connector_role_createRole, this.svr_createRole, this);

        for (let x in cfg_all().hero) {
            let one = cfg_all().hero[x];
            let node = cc.instantiate(this.heroPrefab);
            node.active = true;
            node.parent = this.heroParent;
            node.x = 0;
            node.y = 0;
            node.name = one.id.toString();
            node.getChildByName("name").getComponent(cc.Label).string = one.name;
            getPrefab("heros/hero" + one.id, (prefab) => {
                if (!prefab || !cc.isValid(this)) {
                    return;
                }
                let node2 = cc.instantiate(prefab);
                node2.parent = node.getChildByName("heroImg");
            });
        }
    }

    btn_close() {
        this.node.destroy();
    }

    btn_create() {
        let children = this.heroParent.children;
        let heroId = 0;
        for (let one of children) {
            if (one.getComponent(cc.Toggle).isChecked) {
                heroId = parseInt(one.name);
            }
        }
        network.sendMsg(cmd.connector_role_createRole, { "heroId": heroId, "nickname": this.nameInput.string });
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
