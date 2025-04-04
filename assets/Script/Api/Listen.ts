
import EventUtil from "../util/EventUtils";
import GameEventType from "../util/GameEventType";

class ListenInstance {

    public static Instance: ListenInstance = new ListenInstance(); 

    init() {
        cc.api = {
            flowCallback: null
        }

        //定义sdk回调
        cc.api.flowCallback = (event, json) => {
            console.log('api 回调事件： ' + event)
            console.log('api 回调数据： ' + json)
            let jsonStr = JSON.stringify(json)
            console.log('api 回调数据string： ' + jsonStr)
            switch (event) {
                case 0:
                    console.log("------js初始化回调成功");
                    break;

                case 1:
                    console.log("-------js激励", json);
                    EventUtil.emit(GameEventType.SHOW_ADS);
                    break;
                case 2:
                    EventUtil.emit(GameEventType.SHOW_ADS);
                    break;
                case 3:
                    EventUtil.emit(GameEventType.SHOW_ADS);
                    break;
                case 4:
                    console.log("------购买商品", json);
                    EventUtil.emit(GameEventType.BUY_ITEM, json.index);
                    break;
            }
        }

    }

    // update (dt) {}
}
export const Listen = ListenInstance.Instance;