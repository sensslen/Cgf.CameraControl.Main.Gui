export interface ISendMessagesToGui {
    sendToGui<TMessage>(channel: string, message: TMessage): void;
}
