class GamepadConnection {
    private readonly _onConnect?: (id: number) => void;
    private readonly _onLoop: (pad: Gamepad) => void;
    private readonly _onDisconnect?: () => void;

    private _padIndex?: number = undefined;
    public get connected(): boolean {
        return this.padIndex !== undefined;
    }
    public get padIndex(): number | undefined {
        return this._padIndex;
    }

    constructor(onLoop: (pad: Gamepad) => void, onConnect?: (id: number) => void, onDisconnect?: () => void) {
        this._onLoop = onLoop;
        this._onConnect = onConnect;
        this._onDisconnect = onDisconnect;
    }

    public onConnect(pad: number): void {
        this._padIndex = pad;
        if (this._onConnect) {
            this._onConnect(pad);
        }
    }

    public onDisconnect(): void {
        if (this._onDisconnect) {
            this._onDisconnect();
        }
        this._padIndex = undefined;
    }

    public onLoop(pad: Gamepad): void {
        this._onLoop(pad);
    }

    public compare(
        onLoop: (pad: Gamepad) => void,
        onConnect?: (id: number) => void,
        onDisconnect?: () => void
    ): boolean {
        return onLoop === this._onLoop && onConnect === this._onConnect && onDisconnect === this._onDisconnect;
    }
}

export class WebGamepadManager {
    private static singleton?: WebGamepadManager = undefined;
    private gamepadConnections: GamepadConnection[] = [];
    private availableGamepads: Map<number, boolean> = new Map<number, boolean>();
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

    public connect(onLoop: (pad: Gamepad) => void, onConnect?: (id: number) => void, onDisconnect?: () => void): void {
        const resolver = new GamepadConnection(onLoop, onConnect, onDisconnect);
        this.gamepadConnections.push(resolver);

        this.assignPads();
    }

    public disconnect(
        onLoop: (pad: Gamepad) => void,
        onConnect?: (id: number) => void,
        onDisconnect?: () => void
    ): void {
        const removeIndex = this.gamepadConnections.findIndex((connection) =>
            connection.compare(onLoop, onConnect, onDisconnect)
        );
        if (removeIndex != -1) {
            this.availableGamepads.set(removeIndex, true);
            this.gamepadConnections.splice(removeIndex, 1);
        }

        this.assignPads();
    }

    private gamepadConnected(pad: Gamepad) {
        if (!pad) {
            return;
        }
        if (pad.mapping === 'standard') {
            if (!this.availableGamepads.has(pad.index)) {
                this.availableGamepads.set(pad.index, false);
            }
        }

        this.assignPads();
    }

    private gamepadDisconnected(pad: Gamepad) {
        if (pad) {
            if (this.availableGamepads.has(pad.index)) {
                this.availableGamepads.delete(pad.index);
            }
            this.gamepadConnections.forEach((connection) => {
                if (connection.padIndex && connection.onDisconnect && connection.padIndex === pad.index) {
                    connection.onDisconnect();
                }
            });
        }
    }

    private assignPads() {
        const unassignedPads: number[] = [];
        this.availableGamepads.forEach((value, key) => {
            if (!value) {
                unassignedPads.push(key);
            }
        });
        for (const connection of this.gamepadConnections) {
            if (unassignedPads.length <= 0) {
                continue;
            }

            if (!connection.connected) {
                const newConnection = unassignedPads.pop();
                this.availableGamepads.set(newConnection, true);
                connection.onConnect(newConnection);
            }
        }
        this.gamepadLoop();
    }

    private gamepadLoop() {
        if (this.availableGamepads.size <= 0) {
            return;
        }

        if (this.gamepadConnections.length <= 0) {
            return;
        }

        const gamepads = navigator.getGamepads();
        for (const connection of this.gamepadConnections) {
            if (connection.connected) {
                const pad = gamepads[connection.padIndex];
                if (pad) {
                    connection.onLoop(pad);
                }
            }
        }

        window.requestAnimationFrame(() => this.gamepadLoop());
    }
}
