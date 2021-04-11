import { ILogger } from 'cgf.cameracontrol.main.core';

export class Logger implements ILogger {
    log(toLog: string): void {
        console.log(toLog);
    }
    error(toLog: string): void {
        console.error(toLog);
    }
}
