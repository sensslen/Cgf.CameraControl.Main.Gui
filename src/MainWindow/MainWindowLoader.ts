import * as fs from 'fs';

import { BrowserWindow, Menu, dialog, ipcMain } from 'electron';
import { Core, ILogger } from 'cgf.cameracontrol.main.core';
import { ILogMessage, eLogType } from './Ipc/ILogMessage';

import { HmiBuilder } from './services/WebHmi/HmiBuilder';
import { ISendMessagesToGui } from './Ipc/ISendMessagesToGui';
import { IpcChannelConstants } from './Ipc/IpcChannelConstants';

export class MainWindowLoader implements ISendMessagesToGui {
    private mainWindow?: Electron.BrowserWindow;
    private core?: Core;

    public createWindow(mainWindowLocation: any, preloadLocation: any): void {
        // Create the browser window.
        this.mainWindow = new BrowserWindow({
            height: 600,
            width: 800,
            webPreferences: {
                contextIsolation: true,
                preload: preloadLocation,
            },
        });

        // and load the index.html of the app.
        this.mainWindow.loadURL(mainWindowLocation);

        // Emitted before the window is closed.
        this.mainWindow.on('close', async () => {
            await this.disposeCurrentCoreInstane().then(() => (this.mainWindow = undefined));
        });

        // Emitted after the window is closed.
        this.mainWindow.on('closed', () => {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            this.mainWindow = undefined;
        });

        this.mainWindow.setMenu(this.createMenu());
        this.registerForUiEvents();
    }

    private registerForUiEvents() {
        ipcMain.on(IpcChannelConstants.LoadConfiguration, () => this.showLoadConfigDialog());
    }

    private createMenu(): Menu {
        return Menu.buildFromTemplate([
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Load Configuration',
                        click: () => this.showLoadConfigDialog(),
                    },
                    { role: 'forceReload' },
                    { role: 'toggleDevTools' },
                    { role: 'quit' },
                ],
            },
        ]);
    }

    private async showLoadConfigDialog() {
        try {
            const openComplete = await dialog.showOpenDialog(this.mainWindow as BrowserWindow, {
                properties: ['openFile'],
                filters: [{ name: 'JSON Files', extensions: ['json'] }],
            });
            if (!openComplete.canceled) {
                this.loadConfig(openComplete.filePaths[0]);
            }
        } catch (error) {
            console.error(error);
        }
    }

    private async disposeCurrentCoreInstane() {
        try {
            if (this.core) {
                await this.core.dispose();
                this.core = undefined;
            }
        } catch (error) {
            console.log('dispose error:');
            console.log(error);
        }
    }

    private async loadConfig(filepath: string): Promise<void> {
        await this.disposeCurrentCoreInstane();

        this.core = new Core();

        const logger: ILogger = {
            log: (message: string) => this.sendLogToGui(eLogType.Info, message),
            error: (message: string) => this.sendLogToGui(eLogType.Error, message),
        };

        await this.core.HmiFactory.builderAdd(new HmiBuilder(logger, this.core.MixerFactory, this));

        const config = JSON.parse(fs.readFileSync(filepath).toString());
        this.core.bootstrap(logger, config);
    }

    private sendLogToGui(type: eLogType, message: string) {
        const m: ILogMessage = { type: type, message: message };
        this.sendToGui(IpcChannelConstants.Log, m);
    }

    public sendToGui<TMessage>(channel: string, message: TMessage): void {
        if (this.mainWindow) {
            this.mainWindow.webContents.send(channel, message);
        }
    }
}
