export enum eLogType {
    Info,
    Error,
}

export interface ILogMessage {
    type: eLogType;
    message: string;
}
