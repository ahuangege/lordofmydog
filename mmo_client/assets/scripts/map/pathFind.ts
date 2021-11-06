
export class Pathfind {
    /**
     * 所有的格子节点
     */
    private tiles: tile[][] = []
    private max_x: number = 0;
    private max_y: number = 0;

    /**
     * 搜索序号
     */
    private findIndex: number = 0;

    /**
     * 关闭列表中最大的格子数
     */
    private maxSearch: number = Infinity;

    /**
     * 是否可走对角线
     */
    private allowDiagonal: boolean = true;

    /**
     * 启发函数
     */
    private heuristicFunc: (x0: number, y0: number, x1: number, y1: number) => number = function (x0, y0, x1, y1) {
        return Math.abs(x0 - x1) + Math.abs(y0 - y1);
    }

    /**
     * 初始化
     * @param tiles 格子数组（值越大，代价越大。0 表示不可行走区域）
     * @param options 寻路参数配置
     */
    init(tiles: number[][], options?: pathFindOptions) {
        options = options ? options : {};
        this.maxSearch = options.maxSearch || Infinity;
        this.allowDiagonal = options.allowDiagonal === false ? false : true;
        if (options.heuristicFunc) {
            this.heuristicFunc = options.heuristicFunc;
        }

        this.max_y = tiles.length - 1;
        this.max_x = tiles[0].length - 1;

        for (let j = 0; j <= this.max_y; j++) {
            this.tiles[j] = [];
            for (let i = 0; i <= this.max_x; i++) {
                this.tiles[j][i] = {
                    x: i,
                    y: j,
                    val: tiles[j][i],
                    state: tileState.clean,
                    f_s: 0,
                    g_s: 0,
                    h_s: 0,
                    pre: null as any,
                    index: 0
                };
            }
        }
    }

    /**
     * 改变格子代价值
     * @param x 
     * @param y 
     * @param val 值越大，代价越大。 0表示不可行走
     */
    changeTileValue(x: number, y: number, val: number) {
        if (x < 0 || x > this.max_x || y < 0 || y > this.max_y) {
            console.warn("changeTileWeight out of range pos(" + x + "," + y + ")");
            return;
        }
        this.tiles[y][x].val = val;
    }

    /**
     * 寻路
     * @param sx 起点 x
     * @param sy 起点 y
     * @param ex 终点 x
     * @param ey 终点 y
     */
    findPath(sx: number, sy: number, ex: number, ey: number) {
        if (sx < 0 || sx > this.max_x || sy < 0 || sy > this.max_y) {
            console.warn("findPath out of range start pos(" + sx + "," + sy + ")");
            return null;
        }
        if (ex < 0 || ex > this.max_x || ey < 0 || ey > this.max_y) {
            console.warn("findPath out of range end pos (" + ex + "," + ey + ")");
            return null;
        }

        let tiles = this.tiles;
        let startTile = tiles[sy][sx];
        let endTile = tiles[ey][ex];

        // 搜索序号超过整数精度时，需要重置
        if (this.findIndex > 9999999) {
            this.resetFindIndex();
        }
        let findIndex = ++this.findIndex;

        startTile.g_s = 0;
        startTile.h_s = this.heuristicFunc(startTile.x, startTile.y, ex, ey);
        startTile.f_s = startTile.g_s + startTile.h_s;
        startTile.index = findIndex;
        startTile.state = tileState.clean;

        let openList = new queue();
        openList.enqueue(startTile);

        let findNum = 0;
        let closestTile = startTile;    // 离目标格子最近的格子
        while (openList.getLen() > 0) {
            let oneTile = openList.dequeue();

            oneTile.state = tileState.closed;
            if (oneTile.h_s < closestTile.h_s) {
                closestTile = oneTile;
            }
            if (oneTile === endTile) {
                break;
            }

            findNum++;
            if (findNum > this.maxSearch) {
                break;
            }

            let neighbors = this.getNeighbors(oneTile);
            for (let i = 0; i < neighbors.length; i++) {
                let neighbor = neighbors[i];

                // 搜索序号不是本次的，重置
                if (neighbor.index !== findIndex) {
                    neighbor.index = findIndex;
                    neighbor.state = tileState.clean;
                }

                if (neighbor.state === tileState.closed) {
                    continue;
                }

                let distance = (oneTile.x === neighbor.x || oneTile.y === neighbor.y) ? neighbor.val : 1.414 * neighbor.val;

                if (neighbor.state === tileState.clean) {
                    neighbor.g_s = oneTile.g_s + distance;
                    neighbor.h_s = this.heuristicFunc(neighbor.x, neighbor.y, ex, ey);
                    neighbor.f_s = neighbor.g_s + neighbor.h_s;

                    neighbor.state = tileState.open;
                    neighbor.pre = oneTile;
                    openList.enqueue(neighbor);
                } else if (oneTile.g_s + distance < neighbor.g_s) {
                    neighbor.g_s = oneTile.g_s + distance;
                    neighbor.f_s = neighbor.g_s + neighbor.h_s;

                    neighbor.pre = oneTile;
                    openList.rescore(neighbor);
                }
            }
        }

        let path: tile[] = [];
        let tmpTile = closestTile;
        while (tmpTile !== startTile) {
            path.push(tmpTile);
            tmpTile = tmpTile.pre;
        }
        path.reverse();
        return path;
    }


    /**
     * 寻找邻居节点
     * @param tile 
     */
    private getNeighbors(tile: tile): tile[] {
        let neighbors: tile[] = [],
            x = tile.x,
            y = tile.y,
            tiles = this.tiles,

            l = false,
            r = false,
            u = false,
            d = false,

            max_x = this.max_x,
            max_y = this.max_y;

        // 右
        if (x + 1 <= max_x && tiles[y][x + 1].val !== 0) {
            neighbors.push(tiles[y][x + 1]);
            r = true;
        }

        // 左
        if (x - 1 >= 0 && tiles[y][x - 1].val !== 0) {
            neighbors.push(tiles[y][x - 1]);
            l = true;
        }

        // 上
        if (y + 1 <= max_y && tiles[y + 1][x].val !== 0) {
            neighbors.push(tiles[y + 1][x]);
            u = true
        }

        // 下
        if (y - 1 >= 0 && tiles[y - 1][x].val !== 0) {
            neighbors.push(tiles[y - 1][x]);
            d = true;
        }

        if (!this.allowDiagonal) {
            return neighbors;
        }

        // 左下
        if ((l || d) && x - 1 >= 0 && y - 1 >= 0 && tiles[y - 1][x - 1].val !== 0) {
            neighbors.push(tiles[y - 1][x - 1]);
        }

        // 右下
        if ((r || d) && y - 1 >= 0 && x + 1 <= max_x && tiles[y - 1][x + 1].val !== 0) {
            neighbors.push(tiles[y - 1][x + 1]);
        }

        // 左上
        if ((l || u) && y + 1 <= max_y && x - 1 >= 0 && tiles[y + 1][x - 1].val !== 0) {
            neighbors.push(tiles[y + 1][x - 1]);
        }

        // 右上
        if ((r || u) && y + 1 <= max_y && x + 1 <= max_x && tiles[y + 1][x + 1].val !== 0) {
            neighbors.push(tiles[y + 1][x + 1]);
        }

        return neighbors;
    }

    /**
     * 重置所有格子的搜索序号
     */
    private resetFindIndex() {
        for (let i = this.tiles.length - 1; i >= 0; i--) {
            let row = this.tiles[i];
            for (let j = row.length - 1; j >= 0; j--) {
                row[j].index = 0;
            }
        }
        this.findIndex = 0;
    }

}

class queue {

    private arr: tile[] = []

    /**
     * 入栈
     */
    enqueue(tile: tile) {
        this.arr.push(tile);
        this.move_up(this.arr.length - 1);
    }

    /**
     * 出栈
     */
    dequeue(): tile {
        if (this.arr.length === 0) {
            return undefined as any;
        }
        let min = this.arr[0];
        this.arr[0] = this.arr[this.arr.length - 1];
        this.arr.pop();
        this.move_down(0);
        return min;
    }

    /**
     * 移除
     */
    remove(tile: tile) {
        let index = this.arr.indexOf(tile);
        if (index === -1) {
            return;
        }
        this.arr[index] = this.arr[this.arr.length - 1];
        this.arr.pop();
        this.move_down(index);
    }

    /**
     * 赋值更小值时，重新计算
     */
    rescore(tile: tile) {
        let index = this.arr.indexOf(tile);
        if (index === -1) {
            return;
        }
        this.move_up(index);
    }

    private move_up(idx: number) {
        let parentIdx = Math.floor((idx - 1) / 2);
        while (0 <= parentIdx) {
            if (this.arr[idx].f_s > this.arr[parentIdx].f_s) {
                break;
            }
            let tmp = this.arr[idx]
            this.arr[idx] = this.arr[parentIdx];
            this.arr[parentIdx] = tmp;
            idx = parentIdx;
            parentIdx = Math.floor((idx - 1) / 2);
        }
    }

    private move_down(idx: number) {
        while (true) {
            let leftChildIdx = idx * 2 + 1;
            let rightChildIdx = idx * 2 + 2;
            let targetPos = idx;
            if (leftChildIdx < this.arr.length && this.arr[targetPos].f_s > this.arr[leftChildIdx].f_s) {
                targetPos = leftChildIdx;
            }

            if (rightChildIdx < this.arr.length && this.arr[targetPos].f_s > this.arr[rightChildIdx].f_s) {
                targetPos = rightChildIdx;
            }

            if (targetPos === idx) {
                break;
            }

            let tmp = this.arr[idx];
            this.arr[idx] = this.arr[targetPos];
            this.arr[targetPos] = tmp;
            idx = targetPos;
        }
    }

    /**
     * 长度
     */
    getLen() {
        return this.arr.length;
    }
}

interface tile {
    x: number,
    y: number,
    val: number,        // 节点代价，0为不可行走
    state: tileState,   // 节点状态
    f_s: number,        // f值
    g_s: number,        // g值  开始点到该节点的移动量
    h_s: number,        // h值  该节点到目标点的估算值
    pre: tile,          // 前置节点
    index: number,      // 搜索序号
}

const enum tileState {
    clean,      // 未经搜索的
    open,       // 开启列表中
    closed      // 关闭列表中
}

/**
 * 寻路参数配置
 */
interface pathFindOptions {

    /**
     * 关闭列表中最多搜索格子数 （默认无限制）
     */
    maxSearch?: number,

    /**
     * 是否可以走对角线  （默认可以）
     */
    allowDiagonal?: boolean,

    /**
     * 启发函数  (默认曼哈顿)
     */
    heuristicFunc?: (x0: number, y0: number, x1: number, y1: number) => number,
}