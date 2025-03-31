
export default class EventUtil {
    private static eventTarget = new cc.EventTarget();

    public static on(type: string, callback: Function, target?: any): Function {
        return this.eventTarget.on(type, callback, target);
    }

    public static off(type: string, callback?: Function, target?: any): void {
        this.eventTarget.off(type, callback, target)
    }

    public static emit(key: string, ...arg){
        this.eventTarget.emit(key, ...arg);
    }
}