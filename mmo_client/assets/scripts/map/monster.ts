// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cfg_all } from "../common/configUtil";
import { getPrefab } from "../util/gameUtil";
import { Entity_type } from "./entity";
import { MapMain } from "./mapMain";
import { I_xy } from "./player";
import { Role } from "./role";
import { SkillPre } from "./skill/skillPre";

const { ccclass, property } = cc._decorator;

const moveSpeed = 350;

@ccclass
export class Monster extends Role {

    monsterId = 0;
    onLoad() {
        super.onLoad();
    }
    start() {
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event: cc.Event.EventMouse) => {
            if (event.getButton() === cc.Event.EventMouse.BUTTON_LEFT) {
                SkillPre.instance.callback({ "id": this.id, "pos": MapMain.instance.screen2worldPoint(event.getLocation()) });
            }

        });
    }

    init(json: I_monsterJson) {
        this.id = json.id;
        this.t = json.t;
        this.moveSpeed = moveSpeed;
        this.monsterId = json.monsterId;

        let cfg = cfg_all().monster[json.monsterId];
        this.node.getChildByName("name").getComponent(cc.Label).string = cfg.name;
        this.move(json.path);
        this.hp = json.hp;
        this.hpMax = cfg.hp;
        this.refreshHpUi();

        getPrefab("monsters/monster" + this.monsterId, (prefab) => {
            if (!prefab || !cc.isValid(this)) {
                return;
            }
            let node = cc.instantiate(prefab);
            node.parent = this.roleNode;
            node.x = 0;
            node.y = 0;
        });
    }

    update(dt: number) {
        super.update(dt);
    }

}


export interface I_monsterJson {
    id: number;
    t: Entity_type;
    x: number;
    y: number;
    monsterId: number;
    path: I_xy[];
    hp: number;
}