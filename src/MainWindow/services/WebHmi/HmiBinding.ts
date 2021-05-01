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

    private _videoMixer?: IVideoMixer;
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
        console.log(`getting mixer:${this.config.videoMixer}`);
        this._videoMixer = mixerFactory.get(this.config.videoMixer);
        ipcMain.on(
            getEventConnection(this.config.communicationChannel, EHmiEvent.connection),
            (_event, connected: boolean) => this.onConnectionChange(connected)
        );

        ipcMain.on(
            getEventConnection(this.config.communicationChannel, EHmiEvent.pan),
            (_event, data: IMixBlockNumberEvent) =>
                this.callVideoMixer((mixer) => mixer.pan(data.mixEffectBlock, data.value))
        );
        ipcMain.on(
            getEventConnection(this.config.communicationChannel, EHmiEvent.tilt),
            (_event, data: IMixBlockNumberEvent) =>
                this.callVideoMixer((mixer) => mixer.tilt(data.mixEffectBlock, data.value))
        );
        ipcMain.on(
            getEventConnection(this.config.communicationChannel, EHmiEvent.zoom),
            (_event, data: IMixBlockNumberEvent) =>
                this.callVideoMixer((mixer) => mixer.zoom(data.mixEffectBlock, data.value))
        );
        ipcMain.on(
            getEventConnection(this.config.communicationChannel, EHmiEvent.focus),
            (_event, data: IMixBlockNumberEvent) =>
                this.callVideoMixer((mixer) => mixer.focus(data.mixEffectBlock, data.value))
        );
        ipcMain.on(
            getEventConnection(this.config.communicationChannel, EHmiEvent.changeInput),
            (_event, data: IMixBlockNumberEvent) =>
                this.callVideoMixer((mixer) => mixer.changeInput(data.mixEffectBlock, data.value))
        );
        ipcMain.on(getEventConnection(this.config.communicationChannel, EHmiEvent.runMacro), (_event, data: number) =>
            this.callVideoMixer((mixer) => mixer.cut(data))
        );
        ipcMain.on(
            getEventConnection(this.config.communicationChannel, EHmiEvent.toggleKey),
            (_event, data: IMixBlockNumberEvent) =>
                this.callVideoMixer((mixer) => mixer.toggleKey(data.mixEffectBlock, data.value))
        );
        ipcMain.on(getEventConnection(this.config.communicationChannel, EHmiEvent.cut), (_event, data: number) =>
            this.callVideoMixer((mixer) => mixer.cut(data))
        );
        ipcMain.on(getEventConnection(this.config.communicationChannel, EHmiEvent.auto), (_event, data: number) =>
            this.callVideoMixer((mixer) => mixer.auto(data))
        );
    }

    public subscribe(i: IConnection): void {
        i.change(this._connected);
        this._connectionEmitter.on('change', i.change);
    }

    public unsubscribe(i: IConnection): void {
        this._connectionEmitter.removeListener('change', i.change);
    }

    public async dispose(): Promise<void> {
        try {
            await this.guiSender.invokeToGui(getEventConnection(this.config.communicationChannel, EHmiEvent.dispose));
        } catch (error) {
            this.log(`Failed to dispose:${error}`);
        }
        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.connection),
            (_event, connected: boolean) => this.onConnectionChange(connected)
        );

        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.pan),
            (_event, data: IMixBlockNumberEvent) =>
                this.callVideoMixer((mixer) => mixer.pan(data.mixEffectBlock, data.value))
        );
        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.tilt),
            (_event, data: IMixBlockNumberEvent) =>
                this.callVideoMixer((mixer) => mixer.tilt(data.mixEffectBlock, data.value))
        );
        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.zoom),
            (_event, data: IMixBlockNumberEvent) =>
                this.callVideoMixer((mixer) => mixer.zoom(data.mixEffectBlock, data.value))
        );
        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.focus),
            (_event, data: IMixBlockNumberEvent) =>
                this.callVideoMixer((mixer) => mixer.focus(data.mixEffectBlock, data.value))
        );
        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.changeInput),
            (_event, data: IMixBlockNumberEvent) =>
                this.callVideoMixer((mixer) => mixer.changeInput(data.mixEffectBlock, data.value))
        );
        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.runMacro),
            (_event, data: number) => this.callVideoMixer((mixer) => mixer.runMacro(data))
        );
        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.toggleKey),
            (_event, data: IMixBlockNumberEvent) =>
                this.callVideoMixer((mixer) => mixer.toggleKey(data.mixEffectBlock, data.value))
        );
        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.cut),
            (_event, data: number) => this.callVideoMixer((mixer) => mixer.cut(data))
        );
        ipcMain.removeListener(
            getEventConnection(this.config.communicationChannel, EHmiEvent.auto),
            (_event, data: number) => this.callVideoMixer((mixer) => mixer.auto(data))
        );
    }

    public startup(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._videoMixer === undefined) {
                reject('could not resolve video mixer');
            }

            this.guiSender
                .invokeToGui(IpcChannelConstants.hmiConfiguration, this.config)
                .then((buildResult: IHmiBuildResult) => {
                    if (buildResult.success) {
                        resolve();
                    } else {
                        reject(buildResult.error);
                    }
                })
                .catch((error) => {
                    this.log(`Failed to start:${error}`);
                    reject(error);
                });
        });
    }

    private log(toLog: string) {
        this.logger.log(`HmiBinding-${this.config.communicationChannel}:${toLog}`);
    }

    private onConnectionChange(connected: boolean) {
        this.connected = connected;
    }

    private callVideoMixer(call: (mixer: IVideoMixer) => void): void {
        if (this._videoMixer) {
            call(this._videoMixer);
        }
    }
}
