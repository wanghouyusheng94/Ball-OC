import { EClickAdsPos } from "./GameData";


export namespace Global {

    export let openCount = 0;

    export let playBgm: boolean = true;
    export let playEffect: boolean = true;
    export let needGuide: boolean = true;
    export let chooseLevel: number = 1;

    export let levelData: string[] = [];

    export let awardConfig: cc.JsonAsset = null;

    export let game_node: cc.Node = null;

    export let chooseBgm = "Login";

    export let clickAdsPos:EClickAdsPos = 0;

    export let isOpenAds = true;

    export let adsType = EClickAdsPos.none;

    export let userInfo: {
        name:string,
        gold:number,
        level:number,
        ballSkin: string,
        bgSkin: string,
        bottleSkin: string,

        addBottleNum: number,
        backNum: number,

        unlockBall: string[],
        unlockBg: string[],
        unlockBottle: string[],
        lookAdsNum: number,
        date: string,
    } = {
        name: 'zzz',
        gold: 1000,
        level: 1,
        ballSkin: "1",
        bgSkin: "1",
        bottleSkin: "1",
        addBottleNum: 3,
        backNum: 3,
        unlockBall: ["1"],
        unlockBg: ["1"],
        unlockBottle: ["1"],
        lookAdsNum: 3,
        date: "",
    }
}
