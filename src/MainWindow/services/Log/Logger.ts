import { ELogType, ILogMessage } from '../../Ipc/ILogMessage';
import { ILogger } from 'cgf.cameracontrol.main.core';
import { IpcChannelConstants } from '../../Ipc/IpcChannelConstants';

export class Logger implements ILogger {
    log(toLog: string): void {
        window.api.electronIpcSend(IpcChannelConstants.log, this.assembleEvent(toLog, ELogType.info));
    }
    error(toLog: string): void {
        window.api.electronIpcSend(IpcChannelConstants.log, this.assembleEvent(toLog, ELogType.error));
    }

    private assembleEvent(message: string, type: ELogType): ILogMessage {
        return {
            type: type,
            message: message,
        };
    }
}
