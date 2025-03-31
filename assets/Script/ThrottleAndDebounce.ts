/**
 * 函数防抖类
 * 用来控制函数在一定时间内执行多少次，把触发非常频繁的事件（比如按键）合并成一次执行
 */
export class Debounce {
    timer: any;
    cache_fnc: Function | null;
    cache_args: any[] | null;
    delay: number;
    type: DebounceType;
    limiting: boolean;

    /**
     * 函数防抖类
     * @param delay 多少毫秒之间的调用算作一次调用
     * @param type immediate 立即调用一次，后续操作则忽略 after 前面频繁操作忽略，只调用最后一次 both 则前后都会调用一次，默认为 immediate
     */
    constructor(delay: number, type: DebounceType = DebounceType.Immediate) {
        this.timer = null;
        this.cache_fnc = null;
        this.cache_args = null;
        this.delay = delay;
        this.type = type;
        this.limiting = false;
    }

    execute(fnc: Function, ...args: any[]) {
        if (this.limiting) {
            this.cache_fnc = fnc;
            this.cache_args = args;
            this._limit(this.delay);
        } else {
            if (this.type === DebounceType.Immediate || this.type === DebounceType.Both) {
                fnc(...args);
            } else {
                this.cache_fnc = fnc;
                this.cache_args = args;
            }
            this._limit(this.delay);
        }
    }

    /**
     * 提供一个函数，返回一个绑定了防抖功能的函数
     */
    create(fnc: Function): Function {
        return this.execute.bind(this, fnc);
    }

    private _limit(delay: number) {
        this.limiting = true;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.limiting = false;
            if (this.type === DebounceType.After || this.type === DebounceType.Both) {
                if (this.cache_fnc) {
                    this.cache_fnc(...this.cache_args!);
                    this.cache_fnc = null;
                    this.cache_args = null;
                }
            }
        }, delay);
    }

    /**
     * 清除内部定时器和引用，防止定时器影响内存回收
     */
    clear() {
        clearTimeout(this.timer!);
        this.cache_fnc = null;
        this.cache_args = null;
    }

}

/**
 * 函数节流类
 * 保证每 X 毫秒恒定的执行次数
 */
export class Throttle {
    delay: number;
    last_timestamp: number;

    /**
     * 函数节流类
     * @param delay 多少毫秒
     * @param type
     */
    constructor(delay: number) {
        this.delay = delay;
        this.last_timestamp = 0;
    }

    execute(fnc: Function, ...args: any[]) {
        let now = new Date().getTime();
        if (now - this.last_timestamp >= this.delay) {
            this.last_timestamp = now;
            fnc(...args);
        }
    }

    /**
     * 提供一个函数，返回一个绑定了节流功能的函数
     */
    create(fnc: Function): Function {
        return this.execute.bind(this, fnc);
    }

}

/**
 * 防抖类的类型
 */
export enum DebounceType {
    /**
     * 立即调用一次，后续操作则忽略
     */
    Immediate,
    /**
     * 前面频繁操作忽略，只调用最后一次
     */
    After,
    /**
     * 假设有至少两次触发，则前后各调用一次
     */
    Both
}
