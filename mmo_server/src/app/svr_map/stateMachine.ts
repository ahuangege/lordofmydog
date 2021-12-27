
export interface I_stateData<T> {
    state: T,
    onEnter?: (lastState: T) => void,
    onExit?: (nextState: T) => void
    update: (dt: number) => void,
}

export class StateMachine<T> {
    private nowState: T = null as any;
    private nowData: I_stateData<T> = null as any;
    private dataArr: I_stateData<T>[] = null as any;
    init(stateDataArr: I_stateData<T>[], initState: T) {
        this.nowState = initState;
        this.dataArr = stateDataArr;
        this.nowData = this.findData(initState);
    }

    private findData(state: T): I_stateData<T> {
        for (let one of this.dataArr) {
            if (one.state === state) {
                return one;
            }
        }
        return null as any;
    }

    toState(state: T) {
        if (this.nowState === state) {
            return;
        }
        if (this.nowData.onExit) {
            this.nowData.onExit(state);
        }

        let lastState = this.nowState;
        this.nowState = state;
        this.nowData = this.findData(state);;
        if (this.nowData.onEnter) {
            this.nowData.onEnter(lastState);
        }
    }

    getNowState() {
        return this.nowState;
    }

    update(dt: number) {
        this.nowData.update(dt);
    }
}
