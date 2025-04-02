
import { Button } from "../../Button";
import Api from "../../Api/Api";
const {ccclass, property} = cc._decorator;

@ccclass
export default class ShopItem extends cc.Component {

    @property(cc.Label)
    txt_label: cc.Label = null;

    @property(cc.Label)
    txt_count: cc.Label = null

    @property(Button)
    btn_buy: Button = null;



    private _index = 0;

    setPurchaseData(index: number, number) {
        this._index = index;

        this.txt_count.string = `X ${number}`;
        this.txt_label.string = `$${number}`;

    }

    start () {
        this.btn_buy.onTouchEnd(()=>{
            Api.purchase(`${this._index}`);
        });
    }

    // update (dt) {}
}
