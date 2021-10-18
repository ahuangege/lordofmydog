import { UIMgr, uiPanel } from "../common/uiMgr";
import { Entity, Entity_type } from "./entity";
import { HeroInfoPanel } from "./ui/heroInfoPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export class Player extends Entity {
    uid: number;
    heroId: number;
    nickname: string;

    start() {
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event: cc.Event.EventMouse) => {
            if (event.getButton() !== cc.Event.EventMouse.BUTTON_MIDDLE) {
                return;
            }
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
        });
    }

    init(json: I_playerJson) {
        this.id = json.id;
        this.t = json.t;
        this.uid = json.id;
        this.heroId = json.heroId;
        this.nickname = json.nickname;
        this.node.getChildByName("name").getComponent(cc.Label).string = this.nickname;
    }
}

export interface I_playerJson {
    id: number;
    t: Entity_type;
    x: number;
    y: number;
    uid: number;
    heroId: number;
    nickname: string;
}