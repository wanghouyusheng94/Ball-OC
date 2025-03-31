// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { Global } from "../Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Common  {

    static getBezierAnim(startNode:cc.Node,endNode:cc.Node,random:number, parent: cc.Node){

        let width = Global.game_node.width;
        let height = Global.game_node.height;

        let startPos = startNode.parent.convertToWorldSpaceAR(startNode.getPosition());   
            startPos = cc.v2(startPos.x-width/2,startPos.y-height/2);
            startNode.setPosition(startPos);
            startNode.setParent(parent);

            let endPos = endNode.parent.convertToWorldSpaceAR(endNode.getPosition());
            endPos = cc.v2(endPos.x-width/2,endPos.y-height/2);
            console.log(`start:${startPos}:${endPos}`)

            let centerPos = cc.v2((startPos.x + endPos.x) / 2, (startPos.y + endPos.y) / 2);
         
            if (random <= 0.5) {
                centerPos = cc.v2(centerPos.x - 150, centerPos.y - 150);
            } else {
                centerPos = cc.v2(centerPos.x + 150, centerPos.y + 150);
            }
            let action = cc.bezierTo(0.5, [startPos, centerPos, endPos]);
            return action;
    }
}
