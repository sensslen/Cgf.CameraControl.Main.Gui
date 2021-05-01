export enum ELogType {
    info,
    error,
}

export interface ILogMessage {
    type: ELogType;
    message: string;
}
