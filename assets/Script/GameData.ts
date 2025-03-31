
export const GameData = {

}

export const PrefabPath = {
    CarRoot: "Prefab/Game/Car",
}

export const SpritePath = {
    bgRoot: "Texture/BG/",
    animalRoot: "Texture/Prop/animal",
    wasteRoot: "Texture/Prop/waste",
    carRoot: "Texture/Car/Car",
}

export const StorageName = {
    first: `first`,
    userInfo: "userInfo",
    bgmVolume: "bgmVolume",
    effectVolume: "effectVolume",
    level:"level",
    needGuide: "needGuide",
}

export const Sound = {
    loginBgm: "Music/loginBgm",
    gameBgm: "Music/gameBgm",
    click: "Music/buttonClick",
    passOne: "Music/passOne",
    passAll: "Music/passAll",
    getGold: "Music/getGold",
    special: "Music/special",
}

export const enum ZIndex {
    layer = 0,
    tips = 1000,
}

export const enum EClickAdsPos {
    none = 0,
    gameRefresh = 1,    // 刷新
    gameRetract = 2,    // 回滚
    gameAddBottle = 3,  // 添加球
    goldUnlockSkin = 4, // 金币解锁皮肤
    specialAddGold = 5, // 特殊关加金币
    returnLogin = 6,    // 返回
}

export let UIPath = {
    Success: 'prefab/Success',
    Login: 'prefab/Login',
    Bottle: 'prefab/Bottle',
    Ball: 'prefab/Ball',
    SpecialLevel: 'prefab/SpecialLevel',
    SetLayer: 'prefab/SetLayer',
    Tips: "prefab/Common/Tips",
    ChooseLevelLayer: "prefab/ChooseLevelLayer",
    SkipLayer: "prefab/SkipLevel",
    Flower: "prefab/Flower",
    ChooseSkinLayer: "prefab/ChooseSkinLayer",
    ContactLayer: "prefab/ContactLayer",
    PolicyLayer: "prefab/PolicyLayer",
    ShopLayer: "prefab/ShopLayer",
}

export let AniPath = {
    Aperture: "prefab/ani/aperture",
    Star: "prefab/ani/star",
    Right: 'prefab/ani/right',
    Left: 'prefab/ani/left',
    Mid: "prefab/ani/mid",
}

export let ConfigPath = {
    LevelPath: 'Text/Level',
    AwardPath: 'Text/Award',
}