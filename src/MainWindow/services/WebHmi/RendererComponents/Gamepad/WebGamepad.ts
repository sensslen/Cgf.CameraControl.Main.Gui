import { EHmiEvent, getEventConnection } from '../../Events/EHmiEvent';
import { IWebGamepadConfig, eButtonDirection, eSpecialFunctionType } from './IWebGamepadConfig';

import { ILogger } from 'cgf.cameracontrol.main.core';
import { IMixBlockNumberEvent } from '../../Events/IMixBlockNumberEvent';
import { WebGamepadManager } from './WebGamepadManager';

enum eAltKey {
    none,
    alt,
    altLower,
}

export class WebGamepad {
    private readonly lastValueStates: { [key in EHmiEvent]?: number } = {};
    private readonly lastButtonState: { [key: number]: GamepadButton } = {};

    private altKeyState = eAltKey.none;

    private gamepad?: Gamepad = undefined;
    private disposed = false;
    constructor(private logger: ILogger, private config: IWebGamepadConfig) {}

    public start(): void {
        const manager = WebGamepadManager.Get();
        manager.Connect(
            (pad) => this.onConnect(pad),
            () => this.onDisconnect()
        );

        const gamepadDisposeEventConnection = getEventConnection(this.config.communicationChannel, EHmiEvent.dispose);
        window.api.electronIpcOnce(gamepadDisposeEventConnection, (_event) => {
            this.dispose();
            window.api.electronIpcSend(gamepadDisposeEventConnection, undefined);
        });
    }

    private onConnect(pad: Gamepad) {
        this.gamepad = pad;
        this.sendEvent(EHmiEvent.connection, true);
        this.Log(`connected to:${pad.index}`);
        this.processGamepad();
    }

    private onDisconnect() {
        this.gamepad = undefined;
        this.Log('disconnected');
        this.sendEvent(EHmiEvent.connection, false);
    }

    private processGamepad() {
        if (this.disposed || !this.gamepad) {
            return;
        }

        this.evaluatePressRelease(12, () => this.changeConnection(eButtonDirection.up));
        this.evaluatePressRelease(15, () => this.changeConnection(eButtonDirection.right));
        this.evaluatePressRelease(13, () => this.changeConnection(eButtonDirection.down));
        this.evaluatePressRelease(14, () => this.changeConnection(eButtonDirection.left));

        this.evaluatePressRelease(5, () => this.sendEvent(EHmiEvent.cut, this.config.MixBlock));
        this.evaluatePressRelease(7, () => this.sendEvent(EHmiEvent.auto, this.config.MixBlock));

        this.evaluatePressRelease(3, () => this.specialFunction(eButtonDirection.up));
        this.evaluatePressRelease(1, () => this.specialFunction(eButtonDirection.right));
        this.evaluatePressRelease(0, () => this.specialFunction(eButtonDirection.down));
        this.evaluatePressRelease(2, () => this.specialFunction(eButtonDirection.left));

        this.evaluatePressRelease(
            4,
            () => {
                if (this.altKeyState === eAltKey.none) {
                    this.altKeyState = eAltKey.alt;
                }
            },
            () => {
                if (this.altKeyState === eAltKey.alt) {
                    this.altKeyState = eAltKey.none;
                }
            }
        );
        this.evaluatePressRelease(
            6,
            () => {
                if (this.altKeyState === eAltKey.none) {
                    this.altKeyState = eAltKey.altLower;
                }
            },
            () => {
                if (this.altKeyState === eAltKey.altLower) {
                    this.altKeyState = eAltKey.none;
                }
            }
        );

        this.sendMixBlockEventIfChanged(EHmiEvent.pan, this.gamepad.axes[0] * this.gamepad.axes[0]);
        this.sendMixBlockEventIfChanged(EHmiEvent.tilt, -this.gamepad.axes[1] * this.gamepad.axes[1]);
        this.sendMixBlockEventIfChanged(EHmiEvent.zoom, this.gamepad.axes[2]);
        this.sendMixBlockEventIfChanged(EHmiEvent.focus, this.gamepad.axes[3]);

        window.requestAnimationFrame(() => this.processGamepad());
    }

    private changeConnection(direction: eButtonDirection) {
        let nextInput = this.config.ConnectionChange.Default[direction];
        switch (this.altKeyState) {
            case eAltKey.alt:
                if (this.config.ConnectionChange.Alt) {
                    nextInput = this.config.ConnectionChange.Alt[direction];
                }
                break;
            case eAltKey.altLower:
                if (this.config.ConnectionChange.AltLower) {
                    nextInput = this.config.ConnectionChange.AltLower[direction];
                }
                break;
            default:
                break;
        }

        if (nextInput) {
            this.sendMixBlockEventIfChanged(EHmiEvent.changeInput, nextInput);
        }
    }

    private specialFunction(key: eButtonDirection) {
        let specialFunction = this.config.SpecialFunction.Default[key];
        switch (this.altKeyState) {
            case eAltKey.alt:
                if (this.config.SpecialFunction.Alt) {
                    specialFunction = this.config.SpecialFunction.Alt[key];
                }
                break;
            case eAltKey.altLower:
                if (this.config.SpecialFunction.AltLower) {
                    specialFunction = this.config.SpecialFunction.AltLower[key];
                }
                break;
            default:
                break;
        }

        if (specialFunction) {
            switch (specialFunction.Type) {
                case eSpecialFunctionType.key:
                    this.sendMixBlockEventIfChanged(EHmiEvent.toggleKey, specialFunction.Index);
                    break;
                case eSpecialFunctionType.macro:
                    this.sendEvent(EHmiEvent.runMacro, specialFunction.Index);
                    break;
            }
        }
    }

    private dispose() {
        const manager = WebGamepadManager.Get();
        manager.Disconnect(
            (pad) => this.onConnect(pad),
            () => this.onDisconnect()
        );
        this.disposed = true;
    }

    private Log(message: string) {
        this.logger.log(`WebGamepad:${message}`);
    }

    private sendEvent<T>(event: EHmiEvent, argument: T) {
        const eventConnection = getEventConnection(this.config.communicationChannel, event);

        window.api.electronIpcSend(eventConnection, argument);
    }

    private sendMixBlockEventIfChanged(event: EHmiEvent, value: number) {
        const lastState = this.lastValueStates[event];
        if (lastState !== value) {
            this.sendEvent<IMixBlockNumberEvent>(event, {
                mixEffectBlock: this.config.MixBlock,
                value: value,
            });
            this.lastValueStates[event] = value;
        }
    }

    private evaluatePressRelease(button: number, onPress?: () => void, onRelease?: () => void): void {
        const newValue = this.gamepad.buttons[button];
        if (newValue) {
            const lastValue = this.lastButtonState[button];
            this.lastButtonState[button] = newValue;
            if (lastValue === undefined || lastValue.pressed !== newValue.pressed) {
                newValue.pressed ? onPress() : onRelease();
            }
        }
    }
}
