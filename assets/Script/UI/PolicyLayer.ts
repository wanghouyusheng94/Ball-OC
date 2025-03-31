// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { Button } from "../Button";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PolicyLayer extends cc.Component {

     
    @property(Button)
    btn_close: Button = null;


    start () {
        this.btn_close.onTouchEnd(()=>{
            this.node.destroy();
        })

    }


    // update (dt) {}
}
