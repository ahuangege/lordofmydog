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

    start() {
        if (!this.tilemap) {
            return;
        }
        if (!this.tilemap.tmxAsset) {
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
            let arr = arrAll[i % mapSize.width];
            if (!arr) {
                arr = [];
                arrAll[i % mapSize.width] = arr;
            }
            arr.push(tiles[i] === 0 ? 1 : 0);
        }

        // 坐标系转换
        arrAll.reverse();


        let url = `db://assets/resources/mapJson/${mapName}.json`
        Editor.assetdb.saveExists(url, JSON.stringify(arrAll), (err: Error) => {
            if (err) {
                if (err.message.includes("not exists")) {
                    Editor.assetdb.create(url, JSON.stringify(arrAll), (err: Error) => {
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
