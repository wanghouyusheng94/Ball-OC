// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html
import { Button } from "../../Button";
const {ccclass, property} = cc._decorator;

@ccclass
export default class ShopItem extends cc.Component {

    @property(cc.Label)
    txt_label: cc.Label = null;

    @property(Button)
    btn_buy: Button = null;

    private _index = 0;

    setPurchaseData(index: number) {
        this._index = index;
    }

    start () {
        this.btn_buy.onTouchEnd(()=>{
            console.log("购买", this._index);
        });
    }

    // update (dt) {}
}
