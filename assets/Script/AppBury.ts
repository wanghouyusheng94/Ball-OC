
import { Global } from "./Global";
import SdkApi from "./SDK/SdkApi";

const {ccclass, property} = cc._decorator;

export enum UpLoadEvent {
    FirstOpen     = `first_open`,
    AppOpen       = `app_open`,
    LevelStart    = `level_start`,
    LevelComplete = `level_complete`,
    LevelFail     = `level_fail`,
    BoosterUsed   = `booster_used`,
} 

export const Desc: {[key: string]: (index?: number)=>{}} = {
    [UpLoadEvent.FirstOpen]: function() {
        return { desc: "首次打开游戏" };
    },
    [UpLoadEvent.AppOpen]: function() {
        return { desc: "打开游戏" };
    },
    [UpLoadEvent.LevelStart]: function() {
        return { desc: `游戏开始`, levelDesc: `选择挑战${Global.chooseLevel}关` };
    },
    [UpLoadEvent.LevelComplete]: function() {
        return { desc: "游戏完成", levelDesc: `完成挑战${Global.chooseLevel}关` };
    },
    [UpLoadEvent.LevelFail]: function() {
        return { desc: "游戏失败", levelDesc: `挑战${Global.chooseLevel}关失败` };
    },
    [UpLoadEvent.BoosterUsed]: function(index) {
        let desc = `使用道具:`;

        switch(index) {
            case 0: desc += `刷新游戏`; break;
            case 1: desc += `回滚操作`; break;
            case 2: desc += `添加瓶子`; break;
        }
        return { desc };
    },
}


@ccclass
export default class AppBury {

    static UpLoad(args: { parent: string, index?: number }) {
        // 确保 args.parent 是 UpLoadEvent 枚举的一个有效值
        const eventKey = args.parent as keyof typeof UpLoadEvent;
        if (!Desc[eventKey]) {
            throw new Error('Invalid event key');
        }

        // 获取对应的描述
        const eventDesc = Desc[eventKey](args.index);

        // 如果需要，将 eventDesc 合并到 args 中
        SdkApi.tjReport(JSON.stringify(Object.assign(args, eventDesc)))
    }
}
