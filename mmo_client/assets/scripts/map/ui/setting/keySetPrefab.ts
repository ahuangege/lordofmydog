// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { E_keyType, keySetValue } from "../inputKeyListen";
import { SettingPanel } from "../settingPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export class KeySetPrefab extends cc.Component {

    private lastValue = "";
    @property({ type: cc.Enum(E_keyType) })
    private keyType: E_keyType = E_keyType.none;
    private editBox: cc.EditBox = null;

    start() {
        SettingPanel.instance.keySetDic[this.keyType] = this;
        this.editBox = this.getComponent(cc.EditBox);
    }

    setKeyValue(val: string) {
        this.lastValue = val;
        this.editBox.string = val;
        this.editBox.blur();
        this.editBox.focus();
    }

    onValueChanged() {
        let nowValue = this.editBox.string;
        let addLen = nowValue.length - this.lastValue.length;
        if (addLen < 0) {    // 输入了删除键
            this.setKeyValue("");
            SettingPanel.instance.onKeySetChanged(this.keyType, "");
            return;
        }
        if (addLen > 1) {
            this.setKeyValue(this.lastValue);
            return;
        }
        let char = nowValue.substr(nowValue.length - 1).toUpperCase();
        if (char === " ") {   // 空格
            this.setKeyValue(keySetValue[cc.macro.KEY.space]);
            SettingPanel.instance.onKeySetChanged(this.keyType, keySetValue[cc.macro.KEY.space]);
            return;
        }
        if (!keySetValue[char]) { // 只能输入 英文字母，数字和空格
            this.setKeyValue(this.lastValue);
            return;
        }
        SettingPanel.instance.onKeySetChanged(this.keyType, char);
        this.setKeyValue(char);
    }
}
