import { Core, ILogger } from 'cgf.cameracontrol.main.core';
import { Fx10Builder, Rumblepad2Builder } from 'cgf.cameracontrol.main.gamepad';
import { BrowserWindow, dialog, Menu } from 'electron';
import * as fs from 'fs';

export class MainWindowLoader {
    private mainWindow?: Electron.BrowserWindow;
    private core?: Core;
    private readonly logger: ILogger = {
        log(toLog: string): void {
            console.log(toLog);
        },
        error(toLog: string): void {
            console.error(toLog);
        },
    };

    constructor() {}

    public createWindow(mainWindowLocation: any) {
        // Create the browser window.
        this.mainWindow = new BrowserWindow({
            height: 600,
            width: 800,
            webPreferences: {
                contextIsolation: true,
            },
        });

        // and load the index.html of the app.
        this.mainWindow.loadURL(mainWindowLocation);

        // Emitted when the window is closed.
        this.mainWindow.on('closed', () => {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            this.disposeCurrentCoreInstane().then(() => (this.mainWindow = undefined));
        });

        this.mainWindow.setMenu(this.createMenu());
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
            let openComplete = await dialog.showOpenDialog(this.mainWindow as BrowserWindow, {
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
            await this.core?.dispose();
        } catch (error) {
            console.log('dispose error:');
            console.log(error);
        }
    }

    private async loadConfig(filepath: string): Promise<void> {
        await this.disposeCurrentCoreInstane();

        this.core = new Core();

        this.core.HmiFactory.builderAdd(new Fx10Builder(this.logger, this.core.MixerFactory));
        this.core.HmiFactory.builderAdd(new Rumblepad2Builder(this.logger, this.core.MixerFactory));

        const config = JSON.parse(fs.readFileSync(filepath).toString());
        this.core.bootstrap(this.logger, config);
    }
}
