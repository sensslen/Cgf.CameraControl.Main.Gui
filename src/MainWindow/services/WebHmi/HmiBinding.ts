import { EHmiEvent, getEventConnection } from './Events/EHmiEvent';
import { IConnection, IHmi, ILogger, VideomixerFactory } from 'cgf.cameracontrol.main.core';

import { EventEmitter } from 'events';
import { IHmiConfiguration } from './IHmiConfiguration';
import { IMixBlockNumberEvent } from './Events/IMixBlockNumberEvent';
import { ISendMessagesToGui } from '../../Ipc/ISendMessagesToGui';
import { IpcChannelConstants } from '../../Ipc/IpcChannelConstants';
import { StrictEventEmitter } from 'strict-event-emitter-types';
import { ipcMain } from 'electron';

export class HmiBinding implements IHmi {
    private readonly _connectionEmitter: StrictEventEmitter<EventEmitter, IConnection> = new EventEmitter();

    constructor(
        private config: IHmiConfiguration,
        private logger: ILogger,
        mixerFactory: VideomixerFactory,
        private guiSender: ISendMessagesToGui
    ) {
        ipcMain.on(
            getEventConnection(config.communicationChannel, EHmiEvent.connection),
            (_event, connected: boolean) => {
                this.connected = connected;
            }
        );

        const videoMixer = mixerFactory.get(config.VideoMixer);
        ipcMain.on(
            getEventConnection(config.communicationChannel, EHmiEvent.pan),
            (_event, data: IMixBlockNumberEvent) => {
                videoMixer.pan(data.mixEffectBlock, data.value);
            }
        );
        ipcMain.on(
            getEventConnection(config.communicationChannel, EHmiEvent.tilt),
            (_event, data: IMixBlockNumberEvent) => {
                videoMixer.tilt(data.mixEffectBlock, data.value);
            }
        );
        ipcMain.on(
            getEventConnection(config.communicationChannel, EHmiEvent.zoom),
            (_event, data: IMixBlockNumberEvent) => {
                videoMixer.zoom(data.mixEffectBlock, data.value);
            }
        );
        ipcMain.on(
            getEventConnection(config.communicationChannel, EHmiEvent.focus),
            (_event, data: IMixBlockNumberEvent) => {
                videoMixer.focus(data.mixEffectBlock, data.value);
            }
        );
        ipcMain.on(
            getEventConnection(config.communicationChannel, EHmiEvent.changeInput),
            (_event, data: IMixBlockNumberEvent) => {
                videoMixer.changeInput(data.mixEffectBlock, data.value);
            }
        );
        ipcMain.on(getEventConnection(config.communicationChannel, EHmiEvent.runMacro), (_event, data: number) => {
            videoMixer.runMacro(data);
        });
        ipcMain.on(
            getEventConnection(config.communicationChannel, EHmiEvent.toggleKey),
            (_event, data: IMixBlockNumberEvent) => {
                videoMixer.toggleKey(data.mixEffectBlock, data.value);
            }
        );
        ipcMain.on(getEventConnection(config.communicationChannel, EHmiEvent.cut), (_event, data: number) => {
            videoMixer.cut(data);
        });
        ipcMain.on(getEventConnection(config.communicationChannel, EHmiEvent.auto), (_event, data: number) => {
            videoMixer.auto(data);
        });
    }

    private _connected = false;
    public get connected(): boolean {
        return this._connected;
    }
    public set connected(v: boolean) {
        this._connected = v;
        this._connectionEmitter.emit('change', v);
        this.log(`connected:${v}`);
    }

    subscribe(i: IConnection): void {
        i.change(this._connected);
        this._connectionEmitter.on('change', i.change);
    }

    unsubscribe(i: IConnection): void {
        this._connectionEmitter.removeListener('change', i.change);
    }

    dispose(): Promise<void> {
        const retval = new Promise<void>((resolve, _reject) => {
            ipcMain.once(getEventConnection(this.config.communicationChannel, EHmiEvent.dispose), () => {
                resolve();
            });
        });

        this.guiSender.sendToGui(getEventConnection(this.config.communicationChannel, EHmiEvent.dispose), undefined);
        return retval;
    }

    async startup(): Promise<void> {
        this.guiSender.sendToGui(IpcChannelConstants.HmiConfiguration, this.config);
        return new Promise<void>((resolve, reject) => {
            ipcMain.once(IpcChannelConstants.HmiConfiguration, (_event, success: boolean, error?: any) => {
                if (success) {
                    resolve();
                } else {
                    reject(error);
                }
            });
        });
    }

    private log(toLog: string) {
        this.logger.log(`HmiBinding-${this.config.communicationChannel}:${toLog}`);
    }
}
