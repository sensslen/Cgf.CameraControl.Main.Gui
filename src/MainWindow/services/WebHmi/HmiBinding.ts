import { EHmiEvent, getEventConnection } from './Events/EHmiEvent';
import { IConnection, IHmi, ILogger, IVideoMixer, VideomixerFactory } from 'cgf.cameracontrol.main.core';

import { EventEmitter } from 'events';
import { IHmiBuildResult } from './IHmiBuildResult';
import { IHmiConfiguration } from './IHmiConfiguration';
import { IMixBlockNumberEvent } from './Events/IMixBlockNumberEvent';
import { ISendMessagesToGui } from '../../Ipc/ISendMessagesToGui';
import { IpcChannelConstants } from '../../Ipc/IpcChannelConstants';
import { StrictEventEmitter } from 'strict-event-emitter-types';
import { ipcMain } from 'electron';

export class HmiBinding implements IHmi {
    private readonly _connectionEmitter: StrictEventEmitter<EventEmitter, IConnection> = new EventEmitter();

    private _videoMixer: IVideoMixer;
    private _connected = false;
    public get connected(): boolean {
        return this._connected;
    }
    public set connected(v: boolean) {
        this._connected = v;
        this._connectionEmitter.emit('change', v);
        this.log(`connected:${v}`);
    }

    constructor(
        private config: IHmiConfiguration,
        private logger: ILogger,
        mixerFactory: VideomixerFactory,
        private guiSender: ISendMessagesToGui
    ) {
        this._videoMixer = mixerFactory.get(this.config.videoMixer);
        ipcMain.on(
            getEventConnection(this.config.communicationChannel, EHmiEvent.connection),
            (_event, connected: boolean) => {
                this.connected = connected;
            }
        );

        ipcMain.on(
            getEventConnection(this.config.communicationChannel, EHmiEvent.pan),
            (_event, data: IMixBlockNumberEvent) => {
                this._videoMixer.pan(data.mixEffectBlock, data.value);
            }
        );
        ipcMain.on(
            getEventConnection(this.config.communicationChannel, EHmiEvent.tilt),
            (_event, data: IMixBlockNumberEvent) => {
                this._videoMixer.tilt(data.mixEffectBlock, data.value);
            }
        );
        ipcMain.on(
            getEventConnection(this.config.communicationChannel, EHmiEvent.zoom),
            (_event, data: IMixBlockNumberEvent) => {
                this._videoMixer.zoom(data.mixEffectBlock, data.value);
            }
        );
        ipcMain.on(
            getEventConnection(this.config.communicationChannel, EHmiEvent.focus),
            (_event, data: IMixBlockNumberEvent) => {
                this._videoMixer.focus(data.mixEffectBlock, data.value);
            }
        );
        ipcMain.on(
            getEventConnection(this.config.communicationChannel, EHmiEvent.changeInput),
            (_event, data: IMixBlockNumberEvent) => {
                this._videoMixer.changeInput(data.mixEffectBlock, data.value);
            }
        );
        ipcMain.on(getEventConnection(this.config.communicationChannel, EHmiEvent.runMacro), (_event, data: number) => {
            this._videoMixer.runMacro(data);
        });
        ipcMain.on(
            getEventConnection(this.config.communicationChannel, EHmiEvent.toggleKey),
            (_event, data: IMixBlockNumberEvent) => {
                this._videoMixer.toggleKey(data.mixEffectBlock, data.value);
            }
        );
        ipcMain.on(getEventConnection(this.config.communicationChannel, EHmiEvent.cut), (_event, data: number) => {
            this._videoMixer.cut(data);
        });
        ipcMain.on(getEventConnection(this.config.communicationChannel, EHmiEvent.auto), (_event, data: number) => {
            this._videoMixer.auto(data);
        });
    }

    public subscribe(i: IConnection): void {
        i.change(this._connected);
        this._connectionEmitter.on('change', i.change);
    }

    public unsubscribe(i: IConnection): void {
        this._connectionEmitter.removeListener('change', i.change);
    }

    public async dispose(): Promise<void> {
        await this.guiSender.invokeToGui(getEventConnection(this.config.communicationChannel, EHmiEvent.dispose));

        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.connection),
            (_event, connected: boolean) => {
                this.connected = connected;
            }
        );

        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.pan),
            (_event, data: IMixBlockNumberEvent) => {
                this._videoMixer.pan(data.mixEffectBlock, data.value);
            }
        );
        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.tilt),
            (_event, data: IMixBlockNumberEvent) => {
                this._videoMixer.tilt(data.mixEffectBlock, data.value);
            }
        );
        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.zoom),
            (_event, data: IMixBlockNumberEvent) => {
                this._videoMixer.zoom(data.mixEffectBlock, data.value);
            }
        );
        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.focus),
            (_event, data: IMixBlockNumberEvent) => {
                this._videoMixer.focus(data.mixEffectBlock, data.value);
            }
        );
        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.changeInput),
            (_event, data: IMixBlockNumberEvent) => {
                this._videoMixer.changeInput(data.mixEffectBlock, data.value);
            }
        );
        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.runMacro),
            (_event, data: number) => {
                this._videoMixer.runMacro(data);
            }
        );
        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.toggleKey),
            (_event, data: IMixBlockNumberEvent) => {
                this._videoMixer.toggleKey(data.mixEffectBlock, data.value);
            }
        );
        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.cut),
            (_event, data: number) => {
                this._videoMixer.cut(data);
            }
        );
        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.auto),
            (_event, data: number) => {
                this._videoMixer.auto(data);
            }
        );
    }

    public async startup(): Promise<void> {
        const buildResult: IHmiBuildResult = await this.guiSender.invokeToGui(
            IpcChannelConstants.hmiConfiguration,
            this.config
        );
        if (buildResult.success) {
            return Promise.resolve();
        } else {
            return Promise.reject(buildResult.error);
        }
    }

    private log(toLog: string) {
        this.logger.log(`HmiBinding-${this.config.communicationChannel}:${toLog}`);
    }
}
