import { EButtonDirection, ESpecialFunctionType, IWebGamepadConfig } from './IWebGamepadConfig';
import { EHmiEvent, getEventConnection } from '../../Events/EHmiEvent';

import { ILogger } from 'cgf.cameracontrol.main.core';
import { IMixBlockNumberEvent } from '../../Events/IMixBlockNumberEvent';
import { WebGamepadManager } from './WebGamepadManager';

enum EAltKey {
    none,
    alt,
    altLower,
}

export class WebGamepad {
    private readonly lastValueStates: { [key in EHmiEvent]?: number } = {};
    private readonly lastButtonState: { [key: number]: GamepadButton } = {};

    private altKeyState = EAltKey.none;

    constructor(private logger: ILogger, private config: IWebGamepadConfig) {}

    public start(): void {
        const manager = WebGamepadManager.get();
        manager.connect(
            (pad) => this.gamepadLoop(pad),
            (id) => this.onConnect(id),
            () => this.onDisconnect()
        );

        const gamepadDisposeEventConnection = getEventConnection(this.config.communicationChannel, EHmiEvent.dispose);
        window.api.electronIpcOn(gamepadDisposeEventConnection, () => {
            this.dispose();
            window.api.electronIpcSend(gamepadDisposeEventConnection);
        });
    }

    private onConnect(id: number) {
        this.sendEvent(EHmiEvent.connection, true);
        this.log(`connected to:${id}`);
    }

    private onDisconnect() {
        this.log('disconnected');
        this.sendEvent(EHmiEvent.connection, false);
    }

    private gamepadLoop(pad: Gamepad) {
        this.evaluatePressRelease(pad, 12, () => this.changeConnection(EButtonDirection.up));
        this.evaluatePressRelease(pad, 15, () => this.changeConnection(EButtonDirection.right));
        this.evaluatePressRelease(pad, 13, () => this.changeConnection(EButtonDirection.down));
        this.evaluatePressRelease(pad, 14, () => this.changeConnection(EButtonDirection.left));

        this.evaluatePressRelease(pad, 5, () => this.sendEvent(EHmiEvent.cut, this.config.mixBlock));
        this.evaluatePressRelease(pad, 7, () => this.sendEvent(EHmiEvent.auto, this.config.mixBlock));

        this.evaluatePressRelease(pad, 3, () => this.specialFunction(EButtonDirection.up));
        this.evaluatePressRelease(pad, 1, () => this.specialFunction(EButtonDirection.right));
        this.evaluatePressRelease(pad, 0, () => this.specialFunction(EButtonDirection.down));
        this.evaluatePressRelease(pad, 2, () => this.specialFunction(EButtonDirection.left));

        this.evaluatePressRelease(
            pad,
            4,
            () => {
                if (this.altKeyState === EAltKey.none) {
                    this.altKeyState = EAltKey.alt;
                }
            },
            () => {
                if (this.altKeyState === EAltKey.alt) {
                    this.altKeyState = EAltKey.none;
                }
            }
        );
        this.evaluatePressRelease(
            pad,
            6,
            () => {
                if (this.altKeyState === EAltKey.none) {
                    this.altKeyState = EAltKey.altLower;
                }
            },
            () => {
                if (this.altKeyState === EAltKey.altLower) {
                    this.altKeyState = EAltKey.none;
                }
            }
        );

        this.sendMixBlockEventIfChanged(EHmiEvent.pan, pad.axes[0] * pad.axes[0]);
        this.sendMixBlockEventIfChanged(EHmiEvent.tilt, -pad.axes[1] * pad.axes[1]);
        this.sendMixBlockEventIfChanged(EHmiEvent.zoom, pad.axes[2]);
        this.sendMixBlockEventIfChanged(EHmiEvent.focus, pad.axes[3]);
    }

    private changeConnection(direction: EButtonDirection) {
        this.log(`change connection:${direction}`);
        let nextInput = this.config.connectionChange.default[direction];
        switch (this.altKeyState) {
            case EAltKey.alt:
                if (this.config.connectionChange.alt) {
                    nextInput = this.config.connectionChange.alt[direction];
                }
                break;
            case EAltKey.altLower:
                if (this.config.connectionChange.altLower) {
                    nextInput = this.config.connectionChange.altLower[direction];
                }
                break;
            default:
                break;
        }

        if (nextInput) {
            this.sendMixBlockEventIfChanged(EHmiEvent.changeInput, nextInput);
        }
    }

    private specialFunction(key: EButtonDirection) {
        let specialFunction = this.config.specialFunction.default[key];
        switch (this.altKeyState) {
            case EAltKey.alt:
                if (this.config.specialFunction.alt) {
                    specialFunction = this.config.specialFunction.alt[key];
                }
                break;
            case EAltKey.altLower:
                if (this.config.specialFunction.altLower) {
                    specialFunction = this.config.specialFunction.altLower[key];
                }
                break;
            default:
                break;
        }

        if (specialFunction) {
            switch (specialFunction.type) {
                case ESpecialFunctionType.key:
                    this.sendMixBlockEventIfChanged(EHmiEvent.toggleKey, specialFunction.index);
                    break;
                case ESpecialFunctionType.macro:
                    this.sendEvent(EHmiEvent.runMacro, specialFunction.index);
                    break;
            }
        }
    }

    private dispose() {
        const manager = WebGamepadManager.get();
        manager.disconnect(
            (pad) => this.gamepadLoop(pad),
            (id) => this.onConnect(id),
            () => this.onDisconnect()
        );
    }

    private log(message: string) {
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
                mixEffectBlock: this.config.mixBlock,
                value: value,
            });
            this.lastValueStates[event] = value;
        }
    }

    private evaluatePressRelease(pad: Gamepad, button: number, onPress?: () => void, onRelease?: () => void): void {
        const newValue = pad.buttons[button];
        if (newValue) {
            const lastValue = this.lastButtonState[button];
            this.lastButtonState[button] = newValue;
            if (lastValue === undefined || lastValue.pressed !== newValue.pressed) {
                if (newValue.pressed) {
                    if (onPress) {
                        onPress();
                    }
                } else {
                    if (onRelease) {
                        onRelease();
                    }
                }
            }
        }
    }
}
