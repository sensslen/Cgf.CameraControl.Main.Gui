class GamepadConnection {
    private readonly _onConnect: (pad: Gamepad) => void;
    private readonly _onDisconnect?: () => void;
    private _gamepadInstance?: Gamepad;
    private disposed = false;

    public get Gamepad() {
        return this._gamepadInstance;
    }

    public get Connected() {
        return this.Gamepad !== undefined;
    }

    public onConnect(instance: Gamepad): void {
        if (!this.disposed) {
            this._gamepadInstance = instance;
            this._onConnect(instance);
        }
    }

    public onDisconnect(): void {
        if (!this.disposed) {
            this._gamepadInstance = undefined;
            if (this._onDisconnect) {
                this._onDisconnect();
            }
        }
    }

    public Compare(onConnect: (pad: Gamepad) => void, onDisconnect?: () => void): boolean {
        return onConnect === this._onConnect && onDisconnect === this._onDisconnect;
    }

    constructor(onConnect: (pad: Gamepad) => void, onDisconnect?: () => void) {
        this.onConnect = onConnect;
        this.onDisconnect = onDisconnect;
    }
}

export class WebGamepadManager {
    private static singleton: WebGamepadManager | undefined = undefined;
    private gamepadConnections: GamepadConnection[] = [];
    private availableGamepads: { [key: number]: { pad: Gamepad; used: boolean } } = {};
    private constructor() {
        navigator.getGamepads().forEach((pad) => this.gamepadConnected(pad));
        window.addEventListener('gamepadconnected', (event) => this.gamepadConnected(event.gamepad));
        window.addEventListener('gamepaddisconnected', (event) => this.gamepadDisconnected(event.gamepad));
    }

    public static Get(): WebGamepadManager {
        if (this.singleton === undefined) {
            this.singleton = new WebGamepadManager();
        }
        return this.singleton;
    }

    public Connect(onConnect: (pad: Gamepad) => void, onDisconnect?: () => void): void {
        const resolver = new GamepadConnection(onConnect, onDisconnect);
        this.gamepadConnections.push(resolver);

        this.assignPads();
    }

    public Disconnect(onConnect: (pad: Gamepad) => void, onDisconnect?: () => void): void {
        const removeIndex = this.gamepadConnections.findIndex((connection) =>
            connection.Compare(onConnect, onDisconnect)
        );
        if (removeIndex != -1) {
            const newlyAvailableGamepad = this.gamepadConnections[removeIndex].Gamepad;
            const newlyAvailableInstance = this.availableGamepads[newlyAvailableGamepad.index];
            if (newlyAvailableInstance) {
                newlyAvailableInstance.used = false;
            }
            this.gamepadConnections.splice(removeIndex, 1);
        }

        this.assignPads();
    }

    private gamepadConnected(pad: Gamepad) {
        if (pad && pad.mapping === 'standard') {
            if (this.availableGamepads[pad.index] === undefined) {
                this.availableGamepads[pad.index] = { pad: pad, used: false };
            }
        }
    }

    private gamepadDisconnected(pad: Gamepad) {
        if (pad) {
            if (this.availableGamepads[pad.index]) {
                this.availableGamepads[pad.index] = undefined;
            }
            this.gamepadConnections.forEach((connection) => {
                if (connection.Gamepad && connection.onDisconnect && connection.Gamepad.index === pad.index) {
                    connection.onDisconnect();
                }
            });
        }
    }

    private assignPads() {
        for (const key in this.availableGamepads) {
            if (Object.prototype.hasOwnProperty.call(this.availableGamepads, key)) {
                const available = this.availableGamepads[key];
                if (!available.used && this.gamepadConnections.length > 0) {
                    const newAssignment = this.gamepadConnections.pop();
                    available.used = true;
                    newAssignment.onConnect(available.pad);
                }
            }
        }
    }
}
