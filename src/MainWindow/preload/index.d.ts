interface Window {
    api: {
        /** Electron ipcRenderer wrapper of send method */
        electronIpcSend(channel: string, ...args: unknown[]): void;
        /** Electron ipcRenderer wrapper of sendSync method */
        electronIpcInvoke<T>(channel: string, ...args: unknown[]): Promise<T>;
        /** Electron ipcRenderer wrapper of on method */
        electronIpcOn(channel: string, listener: (event: unknown, ...args: unknown[]) => void): void;
        /** Electron ipcRenderer wrapper of removeListener method */
        electronIpcRemoveListener(channel: string, listener: (event: unknown, ...args: unknown[]) => void): void;
        /** Electron ipcRenderer wrapper of removeAllListeners method */
        electronIpcRemoveAllListeners(channel: string): void;
    };
}
