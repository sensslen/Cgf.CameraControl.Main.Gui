export interface ISendMessagesToGui {
    sendToGui(channel: string, ...args: unknown[]): void;
    invokeToGui<T>(channel: string, ...args: unknown[]): Promise<T>;
}
