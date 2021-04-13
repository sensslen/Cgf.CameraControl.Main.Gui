import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
    electronIpcSend: (channel: string, ...args: unknown[]) => {
        ipcRenderer.send(channel, ...args);
    },
    electronIpcInvoke: (channel: string, ...args: unknown[]): Promise<unknown> => {
        return ipcRenderer.invoke(channel, ...args);
    },
    electronIpcOn: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => {
        ipcRenderer.on(channel, listener);
    },
    electronIpcRemoveListener: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => {
        ipcRenderer.removeListener(channel, listener);
    },
    electronIpcRemoveAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel);
    },
});
