import { getImg } from "../../util/gameUtil";
import { Dic, MapMain } from "../mapMain";
import { Role } from "../role";

/** buff实现集合 */
let buffConDic: Dic<typeof BuffBase> = {};

/**
 * buff注册
 */
function registerBuff(buffCon: typeof BuffBase, buffId: number) {
    // console.log("buff注册（装饰器）", buffCon.name.substring(5));
    buffConDic[buffId] = buffCon;
}


/** buff管理 */
export class BuffMgr {
    public role: Role;  // 对应角色
    private buffDic: Dic<BuffBase> = {};
    public buffData: I_buffData = {};
    constructor(role: Role) {
        this.role = role;
    }

    /** 添加buff */
    addBuff(buffId: number) {
        if (this.buffDic[buffId]) {
            return;
        }
        let buffCon = buffConDic[buffId];
        if (buffCon) {
            this.buffDic[buffId] = new buffCon(this, 0);
        } else {
            console.warn("没有buff实现", buffId)
        }
    }

    /** 删除buff */
    delBuff(buffId: number) {
        let buff = this.buffDic[buffId];
        if (buff) {
            delete this.buffDic[buffId];
            buff.buffOver();
        }
    }


    addSub_yunxuan(isAdd: boolean) {
        if (isAdd) {
            let num = this.buffData[E_buffKey.yunxuan] || 0;
            this.buffData[E_buffKey.yunxuan] = num + 1;
            if (num === 0) {
                this.role.path.length = 0;
            }
        } else {
            this.buffData[E_buffKey.yunxuan]--;
        }

    }

    /** 当前能否使用技能 */
    canUseSkill() {
        return !this.buffData[E_buffKey.yunxuan];
    }

    canMove() {
        return !this.buffData[E_buffKey.yunxuan];
    }

}

interface I_buffData {
    [E_buffKey: string]: number,
}

/** 部分buff效果（只针对bool值） */
export const enum E_buffKey {
    yunxuan = 1,
}

/** buff基类 */
export class BuffBase {
    buffId: number;
    buffMgr: BuffMgr;
    isOver = false;
    buffNode: cc.Node = null;
    constructor(buffMgr: BuffMgr, buffId: number) {
        this.buffId = buffId;
        this.buffMgr = buffMgr;
    }


    /** buff结束 */
    buffOver() {
        this.isOver = true;
        if (cc.isValid(this.buffNode)) {
            this.buffNode.destroy();
        }
    }

    protected addBuffImg() {
        getImg("buffImg/" + this.buffId, (img) => {
            if (this.isOver) {
                return;
            }
            this.buffNode = cc.instantiate(MapMain.instance.buffPrefab);
            this.buffNode.getComponent(cc.Sprite).spriteFrame = img;
            this.buffNode.parent = this.buffMgr.role.buffParent;
        });
    }
}


class buff_1 extends BuffBase {
    constructor(buffMgr: BuffMgr) {
        super(buffMgr, 1);
        this.buffMgr.addSub_yunxuan(true);

        super.addBuffImg();
    }


    buffOver(): void {
        super.buffOver();

        this.buffMgr.addSub_yunxuan(false);
    }

}
registerBuff(buff_1, 1);