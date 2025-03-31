

import { Button } from "../Button";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ContactLayer extends cc.Component {

   
    @property(Button)
    btn_close: Button = null;


    start () {
        this.btn_close.onTouchEnd(()=>{
            this.node.destroy();
        })

    }

    // update (dt) {}
}
