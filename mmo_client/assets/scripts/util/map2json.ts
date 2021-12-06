// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class NewClass extends cc.Component {

    @property(cc.TiledMap)
    private tilemap: cc.TiledMap = null;
    private _save = false;
    @property({ "type": cc.Boolean, "displayName": "点击保存地图" })
    private get saveMap() {
        return this._save;
    }
    private set saveMap(value: boolean) {
        this._save = value;
        if (value) {
            this.saveMap = false;
            this.saveLogic();
        }
    }

    private saveLogic() {
        if (!this.tilemap) {
            cc.warn("no tilemap");
            return;
        }
        if (!this.tilemap.tmxAsset) {
            cc.warn("no tilemap.tmxAsset");
            return;
        }
        let mapName = this.tilemap.tmxAsset.name;
        let mapSize = this.tilemap.getMapSize();
        let layer = this.tilemap.getLayer("collision");
        if (!layer) {
            Editor.log("fatal wrong, tilemap has no layer named collision:", mapName);
            return;
        }
        let arrAll: number[][] = [];
        let tiles = layer.getTiles();
        for (let i = 0; i < tiles.length; i++) {
            let arr = arrAll[Math.floor(i / mapSize.width)];
            if (!arr) {
                arr = [];
                arrAll.push(arr);
            }
            arr.push(tiles[i] === 0 ? 1 : 0);
        }

        // 坐标系转换
        arrAll.reverse();

        // 为了行走平滑，单个格子拆为4个
        let endArr: number[][] = [];
        for (let i = 0; i < arrAll.length; i++) {
            let arr = [];
            let one = arrAll[i];
            for (let j = 0; j < one.length; j++) {
                arr.push(one[j], one[j]);
            }
            endArr.push(arr, arr);
        }

        let tileStr = JSON.stringify(endArr);

        let url = `db://assets/resources/mapJson/${mapName}.json`
        Editor.assetdb.saveExists(url, tileStr, (err: Error) => {
            if (err) {
                if (err.message.includes("not exists")) {
                    Editor.assetdb.create(url, tileStr, (err: Error) => {
                        if (!err) {
                            Editor.log("map data save ok:", mapName);
                            Editor.assetdb.refresh(url);
                        }

                    });
                }
                return;
            }
            Editor.log("map data save ok:", mapName);
            Editor.assetdb.refresh(url);
        });
    }

    // update (dt) {}
}
