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

        console.log(`adaptsize`,this.node.name);

        this.scheduleOnce(()=>{

            let width = this.node.width;
            let height = this.node.height;

            let canvas = this.node.getComponent(cc.Canvas);

            if(height*750 > width * 1334) {
                canvas.fitHeight = false;
                canvas.fitWidth = true;

                console.log("适配宽度")

            } else {
                canvas.fitHeight = true;
                canvas.fitWidth = false;
                console.log("适配高度");
            }
            this.node.getComponent(cc.Widget).updateAlignment();
            //this.node.getChildByName("Login").getComponent(cc.Widget).updateAlignment();
        })
    }

    // update (dt) {}
}
