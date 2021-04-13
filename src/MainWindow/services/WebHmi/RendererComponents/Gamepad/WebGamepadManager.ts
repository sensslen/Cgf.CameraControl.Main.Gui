class GamepadConnection {
    private readonly _onConnect: (pad: Gamepad) => void;
    private readonly _onDisconnect?: () => void;
    private _gamepadInstance?: Gamepad;
    private disposed = false;

    public get gamepad() {
        return this._gamepadInstance;
    }

    public get connected() {
        return this.gamepad !== undefined;
    }

    constructor(onConnect: (pad: Gamepad) => void, onDisconnect?: () => void) {
        this.onConnect = onConnect;
        this.onDisconnect = onDisconnect;
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

    public compare(onConnect: (pad: Gamepad) => void, onDisconnect?: () => void): boolean {
        return onConnect === this._onConnect && onDisconnect === this._onDisconnect;
    }
}

export class WebGamepadManager {
    private static singleton: WebGamepadManager | undefined = undefined;
    private gamepadConnections: GamepadConnection[] = [];
    private availableGamepads: { [key: number]: { pad: Gamepad; used: boolean } } = {};
    private constructor() {
        const gamepads = navigator.getGamepads();
        for (const pad of gamepads) {
            this.gamepadConnected(pad);
        }
        window.addEventListener('gamepadconnected', (event) => this.gamepadConnected(event.gamepad));
        window.addEventListener('gamepaddisconnected', (event) => this.gamepadDisconnected(event.gamepad));
    }

    public static get(): WebGamepadManager {
        if (this.singleton === undefined) {
            this.singleton = new WebGamepadManager();
        }
        return this.singleton;
    }

    public connect(onConnect: (pad: Gamepad) => void, onDisconnect?: () => void): void {
        const resolver = new GamepadConnection(onConnect, onDisconnect);
        this.gamepadConnections.push(resolver);

        this.assignPads();
    }

    public disconnect(onConnect: (pad: Gamepad) => void, onDisconnect?: () => void): void {
        const removeIndex = this.gamepadConnections.findIndex((connection) =>
            connection.compare(onConnect, onDisconnect)
        );
        if (removeIndex != -1) {
            const newlyAvailableGamepad = this.gamepadConnections[removeIndex].gamepad;
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
                if (connection.gamepad && connection.onDisconnect && connection.gamepad.index === pad.index) {
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
