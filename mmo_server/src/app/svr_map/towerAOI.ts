import { EventEmitter } from "events";


export class TowerAOI<T>  {
    private width: number;
    private height: number;
    private towerWidth: number;
    private towerHeight: number;
    private towers: Dic<Dic<Tower<T>>> = {};
    private range: number;
    private eventProxy: eventProxy<T> = new eventProxy();

    constructor(config: { width: number, height: number, towerWidth: number, towerHeight: number, range: number }) {
        this.width = config.width;
        this.height = config.height;
        this.towerWidth = config.towerWidth;
        this.towerHeight = config.towerHeight;
        this.range = config.range;

        let maxX = Math.ceil(this.width / this.towerWidth) - 1 + this.range;
        let maxY = Math.ceil(this.height / this.towerHeight) - 1 + this.range;
        for (let y = -this.range; y <= maxY; y++) {
            this.towers[y] = {};
            for (let x = -this.range; x <= maxX; x++) {
                this.towers[y][x] = new Tower<T>();
            }
        }
    }


    /**
     * 实体位置更新，通知对应观察者
     * @param event 
     * @param listener 
     */
    on(event: "updateObj", listener: (obj: T, addWatchers: Dic<number[]> | null, delWatchers: Dic<number[]> | null) => void): void;
    /**
     * 角色观察者位置更新，通知观察者实体变更
     * @param event 
     * @param listener 
     */
    on(event: "updateWatcher", listener: (watcher: I_uidsid, addObjs: T[], delObjs: T[]) => void): void;

    on(event: "updateObj" | "updateWatcher", listener: (...args: any[]) => void): void {
        this.eventProxy.onEvent(event, listener);
    }

    private transPos(pos: vector2): vector2 {
        return {
            x: Math.floor(pos.x / this.towerWidth),
            y: Math.floor(pos.y / this.towerHeight)
        };
    }

    addObj(obj: T, pos: { x: number, y: number }) {
        let p = this.transPos(pos);
        let t = this.towers[p.y][p.x];
        t.addObj(obj);
    }

    delObj(obj: T, pos: { x: number, y: number }) {
        let p = this.transPos(pos);
        let t = this.towers[p.y][p.x];
        t.delObj(obj);
    }


    updateObj(obj: T, oldPos: { x: number, y: number }, newPos: { x: number, y: number }) {
        let p1 = this.transPos(oldPos);
        let p2 = this.transPos(newPos);
        if (p1.x === p2.x && p1.y === p2.y) {
            return;
        }

        let oldTower = this.towers[p1.y][p1.x];
        let newTower = this.towers[p2.y][p2.x];
        oldTower.delObj(obj);
        newTower.addObj(obj);
        let oldWatchers = oldTower.getWatchers();
        let newWatchers = newTower.getWatchers();
        let addWatchers: Dic<number[]> = {};
        let delWatchers: Dic<number[]> = {};
        let add = false;
        let del = false;
        for (let sid in newWatchers) {
            if (!oldWatchers[sid]) {
                if (!addWatchers[sid]) {
                    addWatchers[sid] = [];
                }
                addWatchers[sid].push(...newWatchers[sid]);
                add = true;
            } else {
                for (let uid of newWatchers[sid]) {
                    if (!oldWatchers[sid].includes(uid)) {
                        if (!addWatchers[sid]) {
                            addWatchers[sid] = [];
                        }
                        addWatchers[sid].push(uid);
                        add = true;
                    }
                }

            }
        }
        for (let sid in oldWatchers) {
            if (!newWatchers[sid]) {
                if (!delWatchers[sid]) {
                    delWatchers[sid] = [];
                }
                delWatchers[sid].push(...oldWatchers[sid]);
                del = true;
            } else {
                for (let uid of oldWatchers[sid]) {
                    if (!newWatchers[sid].includes(uid)) {
                        if (!delWatchers[sid]) {
                            delWatchers[sid] = [];
                        }
                        delWatchers[sid].push(uid);
                        del = true;
                    }
                }
            }
        }


        if (add || del) {
            this.eventProxy.emitEvent("updateObj", obj, add ? addWatchers : null, del ? delWatchers : null);
        }
    }


    addWatcher(watcher: I_uidsid, pos: { x: number, y: number }) {
        let p = this.transPos(pos);
        for (let y = p.y - this.range; y <= p.y + this.range; y++) {
            for (let x = p.x - this.range; x <= p.x + this.range; x++) {
                this.towers[y][x].addWatcher(watcher);
            }
        }
    }

    delWatcher(watcher: I_uidsid, pos: { x: number, y: number }) {
        let p = this.transPos(pos);
        for (let y = p.y - this.range; y <= p.y + this.range; y++) {
            for (let x = p.x - this.range; x <= p.x + this.range; x++) {
                this.towers[y][x].delWatcher(watcher);
            }
        }
    }

    updateWatcher(watcher: I_uidsid, oldPos: { x: number, y: number }, newPos: { x: number, y: number }) {
        let p1 = this.transPos(oldPos);
        let p2 = this.transPos(newPos);
        if (p1.x === p2.x && p1.y === p2.y) {
            return;
        }

        let changedTowers = this.getChangedTowers(p1, p2, this.range);
        let addObjs: T[] = [];
        let removeObjs: T[] = [];
        for (let one of changedTowers.addTowers) {
            one.addWatcher(watcher);
            addObjs.push(...one.getObjs());
        }
        for (let one of changedTowers.removeTowers) {
            one.delWatcher(watcher);
            removeObjs.push(...one.getObjs());
        }
        if (addObjs.length || removeObjs.length) {
            this.eventProxy.emitEvent("updateWatcher", watcher, addObjs, removeObjs);
        }
    }

    private getChangedTowers(p1: vector2, p2: vector2, range: number) {
        let limit1 = { "start": { "x": p1.x - range, "y": p1.y - range }, "end": { "x": p1.x + range, "y": p1.y + range } };
        let limit2 = { "start": { "x": p2.x - range, "y": p2.y - range }, "end": { "x": p2.x + range, "y": p2.y + range } };
        let removeTowers: Tower<T>[] = [];
        let addTowers: Tower<T>[] = [];

        for (let y = limit1.start.y; y <= limit1.end.y; y++) {
            for (let x = limit1.start.x; x <= limit1.end.x; x++) {
                if (!isInRect({ x: x, y: y }, limit2.start, limit2.end)) {
                    removeTowers.push(this.towers[y][x]);
                }
            }
        }

        for (let y = limit2.start.y; y <= limit2.end.y; y++) {
            for (let x = limit2.start.x; x <= limit2.end.x; x++) {
                if (!isInRect({ x: x, y: y }, limit1.start, limit1.end)) {
                    addTowers.push(this.towers[y][x]);
                }
            }
        }

        return { addTowers: addTowers, removeTowers: removeTowers };
    }


    /**
     * 获得所有对象
     * @param pos 坐标
     * @param range 视野范围
     */
    getObjs(pos: { x: number, y: number }, range: number = this.range): T[] {

        let result: T[] = [];
        let p = this.transPos(pos);
        for (let y = p.y - range; y <= p.y + range; y++) {
            for (let x = p.x - range; x <= p.x + range; x++) {
                result.push(...this.towers[y][x].getObjs());
            }
        }
        return result;
    }

    /**
     * 获取观察者
     * @param pos 坐标
     * @param types 类型
     */
    getWatchers(pos: { x: number, y: number }): Dic<number[]> {
        let p = this.transPos(pos);
        return this.towers[p.y][p.x].getWatchers();
    }
}


/**
 * 事件代理
 */
class eventProxy<T> extends EventEmitter {

    onEvent(event: "updateObj" | "updateWatcher", listener: (...args: any[]) => void) {
        this.on(event, listener);
    }

    emitEvent(event: "updateObj", obj: T, addWatchers: Dic<number[]> | null, delWatchers: Dic<number[]> | null): void;
    emitEvent(event: "updateWatcher", watcher: I_uidsid, addObjs: T[], delObjs: T[]): void;
    emitEvent(event: "updateObj" | "updateWatcher", ...args: any[]) {
        this.emit(event, ...args);
    }
}


/**
 * 判断是否在视野范围内
 * @param pos 
 * @param start 
 * @param end 
 */
function isInRect(pos: vector2, start: vector2, end: vector2) {
    return (pos.x >= start.x && pos.x <= end.x && pos.y >= start.y && pos.y <= end.y);
}


/**
 * 灯塔
 */
class Tower<T> {
    private objs: T[] = [];                 // 实体列表
    private watchers: Dic<number[]> = {};   // 观察者

    addObj(obj: T) {
        this.objs.push(obj);
    }

    delObj(obj: T) {
        let index = this.objs.indexOf(obj);
        if (index !== -1) {
            this.objs.splice(index, 1);
        }
    }

    addWatcher(watcher: I_uidsid) {
        let sidArr = this.watchers[watcher.sid];
        if (!sidArr) {
            sidArr = [];
            this.watchers[watcher.sid] = sidArr;
        }
        sidArr.push(watcher.uid);
    }

    delWatcher(watcher: I_uidsid) {
        let sidArr = this.watchers[watcher.sid];
        if (sidArr) {
            let index = sidArr.indexOf(watcher.uid);
            if (index !== -1) {
                sidArr.splice(index, 1);
                if (sidArr.length === 0) {
                    delete this.watchers[watcher.sid];
                }
            }
        }
    }


    getObjs() {
        return this.objs;
    }

    getWatchers() {
        return this.watchers;
    }

}

interface I_uidsid {
    uid: number,
    sid: string,
}


interface Dic<T> {
    [key: string]: T
}


interface vector2 {
    /**
     * x
     */
    x: number;
    /**
     * y
     */
    y: number;
}
