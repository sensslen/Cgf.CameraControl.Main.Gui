export enum EHmiEvent {
    connection = 'connection',
    pan = 'pan',
    tilt = 'tilt',
    zoom = 'zoom',
    focus = 'focus',
    changeInput = 'changeInput',
    runMacro = 'runMacro',
    toggleKey = 'toggleKey',
    cut = 'cut',
    auto = 'auto',
    dispose = 'dispose',
}

export function getEventConnection(connection: string, event: EHmiEvent): string {
    return `${connection}:${event}`;
}
