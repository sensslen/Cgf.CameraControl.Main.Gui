import * as ConfigSchema from './IHmiConfigurationWithoutCommunicationChannel.json';

import { IBuilder, IConfig, IHmi, ILogger, VideomixerFactory } from 'cgf.cameracontrol.main.core';
import { IHmiConfiguration, IHmiConfigurationWithoutCommunicationChannel } from './IHmiConfiguration';

import { ConfigValidator } from '../Configuration/ConfigValidator';
import { HmiBinding } from './HmiBinding';
import { ISendMessagesToGui } from '../../Ipc/ISendMessagesToGui';
import { IpcChannelConstants } from '../../Ipc/IpcChannelConstants';
import { ipcMain } from 'electron';

export class HmiBuilder implements IBuilder<IHmi> {
    constructor(
        private logger: ILogger,
        private mixerFactory: VideomixerFactory,
        private guiSender: ISendMessagesToGui
    ) {}
    public supportedTypes(): Promise<string[]> {
        const retval = new Promise<string[]>((resolve, _reject) => {
            ipcMain.once(IpcChannelConstants.HmiTypesSupported, (_event, types: string[]) => {
                resolve(types);
            });
        });

        this.guiSender.sendToGui(IpcChannelConstants.HmiTypesSupported, undefined);
        return retval;
    }

    private hmiCounter = 0;

    public async build(config: IConfig): Promise<IHmi> {
        const configValidator = new ConfigValidator();
        const validConfig = configValidator.validate<IHmiConfigurationWithoutCommunicationChannel>(
            config,
            ConfigSchema
        );

        if (validConfig === undefined) {
            this.error(configValidator.errorGet());
            return undefined;
        }

        const hmiConfig = config as IHmiConfiguration;
        hmiConfig.communicationChannel = `${IpcChannelConstants.HmiEvent}${this.hmiCounter}`;
        this.hmiCounter++;

        const retval = new HmiBinding(hmiConfig, this.logger, this.mixerFactory, this.guiSender);
        await retval.startup();
        return retval;
    }

    private error(error: string): void {
        this.logger.error(`HmiBuilder: ${error}`);
    }
}
