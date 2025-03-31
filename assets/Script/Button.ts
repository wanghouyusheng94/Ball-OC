import { Sound } from "./GameData";
import { Debounce, Throttle } from "./ThrottleAndDebounce";
import { AudioManager } from "./util/AudioUtils";


const { ccclass, property, executeInEditMode, menu } = cc._decorator;

export enum ButtonTweenType {
    Scale,
}

export enum ButtonLimitType {
    None,
    Throttle,
    Debounce
}

export enum ButtonState {
    None,
    InPressed,
    OutPressed
}

export enum AudioType {
    None,
    Click,
    Close
}

/**
 * 基础按钮组件
 * 封装了一些基本的按钮点击动画与样式，并预留扩展接口，也可以当作一个纯粹的逻辑组件使用
 * 当某个节点绑定了该组件后，将监听以下触摸事件的代码替换为相应的 Button.EventType 事件
 * this.node.on(cc.Node.EventType.TOUCH_END)
 * this.node.on(cc.Node.EventType.TOUCH_CANCEL)
 * this.node.on(cc.Node.EventType.TOUCH_MOVE)
 * this.node.on(cc.Node.EventType.TOUCH_START)
 * to
 * this.node.on(Button.EventType.TOUCH_END)
 * this.node.on(Button.EventType.TOUCH_CANCEL)
 * this.node.on(Button.EventType.TOUCH_MOVE)
 * this.node.on(Button.EventType.TOUCH_START)
 */
@ccclass
@menu("通用组件/Button")
export class Button extends cc.Component {

    /**
     * 控制是否发送触摸事件
     */
    touchEnabled: boolean = false;

    /**
     * 监听本节点的事件来响应点击事件
     */
    static readonly EventType = {
        TOUCH_END: "button-touch-end",
        TOUCH_START: "button-touch-start",
        TOUCH_MOVE: "button-touch-move",
        TOUCH_CANCEL: "button-touch-cancel"
    }

    /**
     * 按钮是否为禁止状态
     */
    @property({ tooltip: "按钮是否为禁止状态，是的话则会使 touchEnabled 为 false" })
    get disable(): boolean {
        return this._disable;
    }
    set disable(v: boolean) {
        this._disable = v;
        this.setDisable(v);
    }
    @property(cc.Boolean) private _disable: boolean = false;

    /**
     * 触摸事件节点
     */
    @property({ type: cc.Node, tooltip: "触摸事件监听节点，默认为 Button 组件挂载的节点" })
    private touch_node: cc.Node = null;

    /**
     * 点击频率限制（内部使用 Throttle 或 Debounce 类实现，如果是 Debounce，其 Type 为 Immediate）
     * tips:使用代码修改点击频率的任何参数需调用 applySettings 来应用刷新
     */
    @property({ type: cc.Enum(ButtonLimitType), tooltip: "点击频率限制（内部使用 Throttle 或 Debounce 类实现，如果是 Debounce，其 Type 为 Immediate）" })
    private touch_limit: ButtonLimitType = ButtonLimitType.None;
    /**
     * 点击频率限制间隔毫秒
     */
    @property({ tooltip: "限制多少毫秒", visible() { return this.touch_limit != ButtonLimitType.None } })
    private limit_delay: number = 1000;
    private limit_instance: Debounce | Throttle;
    private node_emit_fnc: Function;

    /**
     * 开启按钮图片变换效果
     */
    @property({ tooltip: "开启图片变换效果" })
    sprite_transition: boolean = false;
    @property({ type: cc.Sprite, tooltip: "图片变换目标组件", visible() { if (!this.sprite_transition) { this.sprite_target = null; } return this.sprite_transition } })
    get sprite_target(): cc.Sprite {
        return this._sprite_target;
    }
    set sprite_target(v: cc.Sprite) {
        this._sprite_target = v;
        if (!this.disable) {
            this.applySpriteFrame(this.normal_sprite_frame);
        } else {
            this.applySpriteFrame(this.disabled_sprite_frame);
        }
    }
    @property(cc.Sprite) private _sprite_target: cc.Sprite = null;
    @property({ type: cc.SpriteFrame, tooltip: "普通状态图片", visible() { return this.sprite_transition } })
    get normal_sprite_frame(): cc.SpriteFrame {
        return this._normal_sprite_frame;
    }
    set normal_sprite_frame(v: cc.SpriteFrame) {
        this._normal_sprite_frame = v;
        if (!this.disable) {
            this.applySpriteFrame(v);
        }
    }
    @property(cc.SpriteFrame) private _normal_sprite_frame: cc.SpriteFrame = null;
    @property({ type: cc.SpriteFrame, tooltip: "按下状态图片，留空使用普通状态图片", visible() { return this.sprite_transition } })
    pressed_sprite_frame: cc.SpriteFrame = null;
    @property({ type: cc.SpriteFrame, tooltip: "禁用状态图片，留空使用普通状态图片", visible() { return this.sprite_transition } })
    get disabled_sprite_frame(): cc.SpriteFrame {
        return this._disabled_sprite_frame;
    }
    set disabled_sprite_frame(v: cc.SpriteFrame) {
        this._disabled_sprite_frame = v;
        if (this.disable) {
            this.applySpriteFrame(v);
        }
    }
    @property(cc.SpriteFrame) private _disabled_sprite_frame: cc.SpriteFrame = null;

    /**
     * 开启按钮节点颜色变换效果
     */
    @property({ tooltip: "开启颜色变换效果" })
    color_transition: boolean = false;
    @property({ type: cc.Node, tooltip: "颜色变换目标节点", visible() { if (!this.color_transition) { this.color_target = null; } return this.color_transition } })
    get color_target(): cc.Node {
        return this._color_target;
    }
    set color_target(v: cc.Node) {
        this._color_target = v;
        if (!this.disable) {
            this.applyColor(this.normal_color);
        } else {
            this.applyColor(this.disabled_color);
        }
    }
    @property(cc.Node) private _color_target: cc.Node = null;
    @property({ tooltip: "普通状态颜色", visible() { return this.color_transition } })
    get normal_color(): cc.Color {
        return this._normal_color;
    }
    set normal_color(v: cc.Color) {
        this._normal_color = v;
        if (!this.disable) {
            this.applyColor(v);
        }
    }
    @property private _normal_color: cc.Color = cc.Color.WHITE;
    @property({ tooltip: "按下状态颜色，留空使用普通状态颜色", visible() { return this.color_transition } })
    pressed_color: cc.Color = cc.color(230, 230, 230);
    @property({ tooltip: "禁用状态颜色，留空使用普通状态颜色", visible() { return this.color_transition } })
    get disabled_color(): cc.Color {
        return this._disabled_color;
    }
    set disabled_color(v: cc.Color) {
        this._disabled_color = v;
        if (this.disable) {
            this.applyColor(v);
        }
    }
    @property private _disabled_color: cc.Color = cc.Color.GRAY;

    /**
     * 开启按钮动效变换效果
     * tips:使用代码修改动效的任何参数需调用 applySettings 来应用刷新
     */
    @property({ tooltip: "按钮点击时开启动效变换效果" })
    tween_transition: boolean = false;
    @property({ type: [cc.Node], tooltip: "动效变换目标节点", visible() { if (!this.tween_transition) { this.tween_target = null; } return this.tween_transition } })
    tween_targets: cc.Node[] = [null];
    @property({ type: cc.Enum(ButtonTweenType), tooltip: "效果类型\n - Scale 点击时缩放效果", visible() { return this.tween_transition } })
    tween_type: ButtonTweenType = ButtonTweenType.Scale;
    /**
     * Scale 动画
     */
    private scale_start_tween: cc.Tween[];
    private scale_end_tween: cc.Tween[];
    private scale_cancel_tween: cc.Tween[];
    /**
     * Scale 动画 start/cancel 持续时间
     */
    @property({ tooltip: "Scale 动画 start/scacel 持续时间", visible() { return (this.tween_transition && this.tween_type === ButtonTweenType.Scale) } })
    scale_start_duration: number = 0.05;
    /**
     * Scale 动画 end 持续时间
     */
    @property({ tooltip: "Scale 动画 end 持续时间", visible() { return (this.tween_transition && this.tween_type === ButtonTweenType.Scale) } })
    scale_end_duration: number = 0.2;
    /**
     * Scale 动画按下时最小倍数
     */
    @property({ tooltip: "Scale 原来大小", visible() { return (this.tween_transition && this.tween_type === ButtonTweenType.Scale) } })
    scale_origin: number = 1;
    /**
     * Scale 动画按下时最小倍数
     */
    @property({ tooltip: "Scale 动画按下时最小倍数", visible() { return (this.tween_transition && this.tween_type === ButtonTweenType.Scale) } })
    scale_min: number = 0.9;
    /**
     * Scale 动画按下时最大倍数
     */
    @property({ tooltip: "Scale 动画按下时最大倍数", visible() { return (this.tween_transition && this.tween_type === ButtonTweenType.Scale) } })
    scale_max: number = 1.1;


    @property({ tooltip: "按钮点击的音效 - onTouchEnd" })
    audio_transition: boolean = false;
    @property({ type: cc.Enum(AudioType), tooltip: "按钮点击的音效类型", visible() { return this.audio_transition; } })
    audio_type: AudioType = AudioType.None;


    /**
     * 按钮当前状态
     */
    state: ButtonState;

    /**
     * 触摸点 id
     */
    touch_id: number;

    onLoad() {
        if (this.touch_node == null) {
            this.touch_node = this.node;
        }
        if (!CC_EDITOR) {
            this.touch_node.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
            this.touch_node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
            this.touch_node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
            this.touch_node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
            this.node_emit_fnc = this.node.emit.bind(this.node);
            this.applySettings();
            this.setDisable(this.disable);
        }
    }


    /**
     * 应用所有参数修改
     * 当通过代码修改本组件部分参数时，需调用该函数来应用修改
     * - 点击频率相关参数
     * - 动画动效相关参数
     */
    applySettings() {
        this.applyClickLimitSettings();
        this.applyTweenSettings();
    }

    /**
     * 应用点击频率参数修改
     */
    applyClickLimitSettings() {
        this.initClickLimitInstance();
        if (this.limit_instance) {
            this.limit_instance.delay = this.limit_delay;
        }
    }

    /**
     * 设置按钮是否为禁用状态
     */
    private setDisable(v: boolean) {
        v = !v;
        this.touchEnabled = v;
        this.state = ButtonState.None;
        this.toOutPressedState();
    }

    /**
     * 初始化点击频率限制功能
     */
    private initClickLimitInstance() {
        if (this.touch_limit == ButtonLimitType.None) {
            this.limit_instance = null;
        } else if (this.touch_limit == ButtonLimitType.Debounce) {
            if (this.limit_instance == null || this.limit_instance instanceof Throttle) this.limit_instance = new Debounce(this.limit_delay);
        } else if (this.touch_limit == ButtonLimitType.Throttle) {
            if (this.limit_instance == null || this.limit_instance instanceof Debounce) this.limit_instance = new Throttle(this.limit_delay);
        }
    }

    /**
     * 修改目标 Sprite 当前图片，默认为 Normal
     */
    applySpriteFrame(sf: cc.SpriteFrame = this.normal_sprite_frame) {
        let sprite = this.sprite_target;
        if (sprite != null) {
            if (sf == null) {
                sf = this.normal_sprite_frame;
            }
            sprite.spriteFrame = sf;
        }
    }

    /**
     * 修改目标 Node 当前颜色，默认为 Normal
     */
    applyColor(color: cc.Color = this.normal_color) {
        let node = this.color_target;
        if (node != null) {
            if (color == null) {
                color = this.normal_color;
            }
            node.color = color;
        }
    }

    /**
     * 应用动效参数修改
     */
    applyTweenSettings() {
        this.scale_start_tween = null;
    }

    /**
     * 触发 tween 动画
     */
    private triggerTween(state: string) {
        if (this.tween_targets) {
            switch (this.tween_type) {
                case ButtonTweenType.Scale:
                    this.scaleTween(state);
                    break;
            }
        }
    }

    /**
     * 缩放 tween
     */
    private scaleTween(state: string) {
        if (this.scale_start_tween == null) {
            this.scale_start_tween = [];
            this.scale_end_tween = [];
            this.scale_cancel_tween = [];
            this.tween_targets.forEach((node) => {
                // 按下动画
                this.scale_start_tween.push(cc.tween(node).to(this.scale_start_duration, { scale: this.scale_min }));
                // 结束按下
                this.scale_end_tween.push(cc.tween(node).to(this.scale_end_duration * 0.3, { scale: this.scale_max }).to(this.scale_end_duration * 0.7, { scale: this.scale_origin ?? 1 }));
                // 取消按下
                this.scale_cancel_tween.push(cc.tween(node).to(this.scale_start_duration, { scale: this.scale_origin ?? 1 }));
            });
        }

        // 停止所有动画
        this.tween_targets.forEach((node, i) => {
            this.scale_start_tween[i].stop();
            this.scale_end_tween[i].stop();
            this.scale_cancel_tween[i].stop();
        });

        switch (state) {
            case Button.EventType.TOUCH_START:
                this.scale_start_tween.forEach((tween) => {
                    tween.start();
                })
                break;
            case Button.EventType.TOUCH_END:
                this.scale_end_tween.forEach((tween) => {
                    tween.start();
                });
                break;
            case Button.EventType.TOUCH_CANCEL:
                this.scale_cancel_tween.forEach((tween) => {
                    tween.start();
                });
                break;
        }
    }

    private playAudio() {
        switch (this.audio_type) {
            case AudioType.None:
                break;
            case AudioType.Click:
                AudioManager.playEffect(Sound.click);
                break;
            case AudioType.Close:
                AudioManager.playEffect(Sound.click);
                break;
        }
    }

    protected _onTouchStart(ev: cc.Event.EventTouch) {
        if (!this.disable) {
            if (this.touch_id == null) {
                this.setVaildTouchID(ev.getID());

                if (this.isCanTouch()) {
                    this.node.emit(Button.EventType.TOUCH_START, ev);
                    ev.stopPropagation();
                }

                if (!this.disable) {    // 判断两次是因为可能在事件中修改 disable 值

                    this.toInPressedState();
                }

            }
        }
    }

    /**
     * 优化 move 响应频率
     */
    private move_optimize_px: number = 0;

    protected _onTouchMove(ev: cc.Event.EventTouch) {
        if (!this.disable) {
            if (this.isVaildTouchID(ev.getID())) {

                if (this.isCanTouch()) {
                    this.node.emit(Button.EventType.TOUCH_MOVE, ev);
                    ev.stopPropagation();
                }

                // 如果被关闭，则直接改变状态
                if (this.disable) {
                    this.toOutPressedState();
                    this.move_optimize_px = 0;
                } else {

                    this.move_optimize_px += Math.abs(ev.getDeltaX()) + Math.abs(ev.getDeltaY());
                    if (this.move_optimize_px >= 10) {
                        this.move_optimize_px = 0;

                        // 判断是否超过触摸区域，是则改变显示
                        if (this.inButtonArea(ev.getLocation())) {
                            this.toInPressedState();
                        } else {
                            this.toOutPressedState();
                        }

                    }

                }

            }
        }
    }

    protected _onTouchEnd(ev: cc.Event.EventTouch) {
        this.setVaildTouchID(null);
        if (!this.disable) {

            if (this.isCanTouch()) {
                if (this.limit_instance) {
                    this.limit_instance.execute(this.node_emit_fnc, Button.EventType.TOUCH_END, ev);
                } else {
                    this.node.emit(Button.EventType.TOUCH_END, ev);
                }
                ev.stopPropagation();
            }

            this.toNoneState();
        }
    }

    protected _onTouchCancel(ev: cc.Event.EventTouch) {
        this.setVaildTouchID(null);
        if (!this.disable) {
            if (this.isCanTouch()) {
                this.node.emit(Button.EventType.TOUCH_CANCEL, ev);
                ev.stopPropagation();
            }

            this.toOutPressedState();
        }
    }


    private toNoneState() {
        if (this.state == ButtonState.None) return;
        this.state = ButtonState.None;

        // end 和 cancel 的动画必须执行，否则会卡住
        // if (!this.disable) {    // 判断两次是因为可能在事件中修改 disable 值
        if (this.sprite_transition) {
            if (this.disable) {
                this.applySpriteFrame(this.disabled_sprite_frame);
            } else {
                this.applySpriteFrame(this.normal_sprite_frame);
            }
        }
        if (this.color_transition) {
            if (this.disable) {
                this.applyColor(this.disabled_color);
            } else {
                this.applyColor(this.normal_color);
            }
        }
        if (this.tween_transition) {
            this.triggerTween(Button.EventType.TOUCH_END);
        }
        if (this.audio_transition) {
            this.playAudio();
        }
        // }
    }


    private toInPressedState() {
        if (this.state == ButtonState.InPressed) return;
        this.state = ButtonState.InPressed;

        if (this.sprite_transition) {
            this.applySpriteFrame(this.pressed_sprite_frame);
        }
        if (this.color_transition) {
            this.applyColor(this.pressed_color);
        }
        if (this.tween_transition) {
            this.triggerTween(Button.EventType.TOUCH_START);
        }
    }


    private toOutPressedState() {
        if (this.state == ButtonState.OutPressed) return;
        this.state = ButtonState.OutPressed;

        if (this.sprite_transition) {
            if (this.disable) {
                this.applySpriteFrame(this.disabled_sprite_frame);
            } else {
                this.applySpriteFrame(this.normal_sprite_frame);
            }
        }
        if (this.color_transition) {
            if (this.disable) {
                this.applyColor(this.disabled_color);
            } else {
                this.applyColor(this.normal_color);
            }
        }
        if (this.tween_transition) {
            this.triggerTween(Button.EventType.TOUCH_CANCEL);
        }
    }


    private inButtonArea(pos: cc.Vec2): boolean {
        let _in = this.touch_node.getBoundingBoxToWorld().contains(pos) as unknown as boolean;
        return _in;
    }


    onTouch(callback: (e: cc.Event.EventTouch) => void, thisArg?: any) {
        this.node.on(Button.EventType.TOUCH_START, callback, thisArg);
    }

    onTouchMove(callback: (e: cc.Event.EventTouch) => void, thisArg?: any) {
        this.node.on(Button.EventType.TOUCH_MOVE, callback, thisArg);
    }

    onTouchEnd(callback: (e: cc.Event.EventTouch) => void, thisArg?: any) {
        this.node.on(Button.EventType.TOUCH_END, callback, thisArg);
    }

    onTouchCancel(callback: (e: cc.Event.EventTouch) => void, thisArg?: any) {
        this.node.on(Button.EventType.TOUCH_CANCEL, callback, thisArg);
    }

    offTouch(callback: (e: cc.Event.EventTouch) => void, thisArg?: any) {
        this.node.off(Button.EventType.TOUCH_START, callback, thisArg);
    }

    offTouchEnd(callback: (e: cc.Event.EventTouch) => void, thisArg?: any) {
        this.node.off(Button.EventType.TOUCH_END, callback, thisArg);
    }

    offTouchMove(callback: (e: cc.Event.EventTouch) => void, thisArg?: any) {
        this.node.off(Button.EventType.TOUCH_MOVE, callback, thisArg);
    }

    offTouchCancel(callback: (e: cc.Event.EventTouch) => void, thisArg?: any) {
        this.node.off(Button.EventType.TOUCH_CANCEL, callback, thisArg);
    }

    targetOff(thisArg: any) {
        this.node.targetOff(thisArg);
    }


    isCanTouch(): boolean {
        return this.touchEnabled;
    }


    isVaildTouchID(id: number) {
        return this.touch_id == id;
    }


    setVaildTouchID(id: number) {
        this.touch_id = id;
    }


    onDisable() {
        this.setVaildTouchID(null);
        this.toOutPressedState();
    }


    onDestroy() {
        if (!CC_EDITOR) {
            this.node.off(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
            this.node.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
            this.node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
            this.node.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
        }
    }

}
