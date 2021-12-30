// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cfg_all } from "../../common/configUtil";
import { getPrefab } from "../../util/gameUtil";
import { Monster } from "../monster";
import { MonsterInfoItemPrefab } from "./monsterInfoItemPrefab";
import { MonsterInfoSkillPrefab } from "./monsterInfoSkillPrefab";

const { ccclass, property } = cc._decorator;

@ccclass
export class MonsterInfoPanel extends cc.Component {

    static instance: MonsterInfoPanel = null;

    @property(cc.Node)
    private skillNode: cc.Node = null;
    @property(cc.Node)
    private itemNode: cc.Node = null;
    @property(cc.Node)
    private skillParent: cc.Node = null;
    @property(cc.Node)
    private itemParent: cc.Node = null;
    private monsterId = 0;
    onLoad() {
        MonsterInfoPanel.instance = this;
    }


    init(monster: Monster) {
        if (monster.monsterId === this.monsterId) {
            return;
        }
        this.monsterId = monster.monsterId;

        getPrefab("monsters/monster" + this.monsterId, (prefab) => {
            if (!prefab || !cc.isValid(this)) {
                return;
            }
            let node = cc.instantiate(prefab);
            node.parent = this.node.getChildByName("monster");
        });


        let cfg = cfg_all().monster[monster.monsterId];
        this.node.getChildByName("name").getComponent(cc.Label).string = cfg.name;
        this.node.getChildByName("num").getComponent(cc.Label).string = cfg.attack + "\n" + cfg.armor_p + "\n" + cfg.armor_m +
            "\n" + cfg.hp + "\n" + cfg.mp;

        this.skillParent.destroyAllChildren();
        this.itemParent.destroyAllChildren();
        for (let id of cfg.skill) {
            let node = cc.instantiate(this.skillNode);
            node.parent = this.skillParent;
            node.active = true;
            node.y = 0;
            node.getComponent(MonsterInfoSkillPrefab).init(id);
        }
        for (let one of cfg.items) {
            let node = cc.instantiate(this.itemNode);
            node.parent = this.itemParent;
            node.active = true;
            node.y = 0;
            node.getComponent(MonsterInfoItemPrefab).init(one[1]);
        }
    }





    btn_close() {
        this.node.destroy();
    }


    onDestroy() {
        MonsterInfoPanel.instance = null;
    }
}
