// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Adaptsize extends cc.Component {


    start () {

        this.scheduleOnce(()=>{
            if(this.node.height/this.node.width >= (1334/750)) {
                this.node.getComponent(cc.Canvas).fitHeight = false;
                this.node.getComponent(cc.Canvas).fitWidth = true;

                console.log("竖屏")

            } else {
                this.node.getComponent(cc.Canvas).fitWidth = false;
                this.node.getComponent(cc.Canvas).fitHeight = true;

                console.log("横屏")
            }
        })
    }

    // update (dt) {}
}
