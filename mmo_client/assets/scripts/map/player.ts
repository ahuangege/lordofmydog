import { UIMgr, uiPanel } from "../common/uiMgr";
import { Entity, Entity_type } from "./entity";
import { MapMain } from "./mapMain";
import { Role } from "./role";
import { SkillPre } from "./skill/skillPre";
import { HeroInfoPanel } from "./ui/heroInfoPanel";

const { ccclass, property } = cc._decorator;

const moveSpeed = 280;

@ccclass
export class Player extends Role {
    uid: number;
    heroId: number;
    nickname: string;
    onLoad() {
        super.onLoad();
    }
    start() {
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event: cc.Event.EventMouse) => {
            if (event.getButton() === cc.Event.EventMouse.BUTTON_MIDDLE) {
                if (!cc.isValid(HeroInfoPanel.instance)) {
                    UIMgr.showPanel(uiPanel.heroInfoPanel, (err, node) => {
                        if (err || !cc.isValid(this)) {
                            return;
                        }
                        HeroInfoPanel.instance.init(this);
                    });
                } else {
                    HeroInfoPanel.instance.init(this);
                }
            } else if (event.getButton() === cc.Event.EventMouse.BUTTON_LEFT) {
                SkillPre.instance.callback({ "id": this.id, "pos": MapMain.instance.screen2worldPoint(event.getLocation()) });
            }

        });
    }

    init(json: I_playerJson) {
        this.id = json.id;
        this.t = json.t;
        this.moveSpeed = moveSpeed;

        this.uid = json.id;
        this.heroId = json.heroId;
        this.nickname = json.nickname;
        this.node.getChildByName("name").getComponent(cc.Label).string = this.nickname;
        this.move(json.path);
        this.hp = json.hp;
        this.hpMax = json.hpMax;
        this.refreshHpUi();


    }

    initSkill(skillPos: number[], skillCd: number[]) {
        for (let i = 0; i < skillPos.length; i++) {
            if (skillPos[i]) {
                let skill = this.skillMgr.addSkill(skillPos[i]);
                if (skill) {
                    skill.cd = skillCd[i];
                }
            }
        }
    }

    update(dt: number) {
        super.update(dt);
    }

}

export interface I_xy {
    x: number,
    y: number,
}

export interface I_playerJson {
    id: number;
    t: Entity_type;
    x: number;
    y: number;
    uid: number;
    heroId: number;
    nickname: string;
    path: I_xy[];
    hp: number;
    hpMax: number;
    noFight: boolean;
}