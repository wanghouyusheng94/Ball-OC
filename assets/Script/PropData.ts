// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

export namespace Nprop {

    export enum Eprop {
        "ball_1" = 1001,
        "ball_2" = 1002,

        "bottle_1" = 2001,
        
        "bg_1" = 3001,
    }

    export const PropUrlConfig = {
        1001: "skin/orange",
    }

}