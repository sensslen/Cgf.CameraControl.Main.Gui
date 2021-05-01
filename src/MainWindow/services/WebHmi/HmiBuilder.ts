import * as ConfigSchema from './IHmiConfigurationWithoutCommunicationChannel.json';

import { IBuilder, IConfig, IHmi, ILogger, VideomixerFactory } from 'cgf.cameracontrol.main.core';
import { IHmiConfiguration, IHmiConfigurationWithoutCommunicationChannel } from './IHmiConfiguration';

import { ConfigValidator } from '../Configuration/ConfigValidator';
import { HmiBinding } from './HmiBinding';
import { ISendMessagesToGui } from '../../Ipc/ISendMessagesToGui';
import { IpcChannelConstants } from '../../Ipc/IpcChannelConstants';

export class HmiBuilder implements IBuilder<IHmi> {
    private hmiCounter = 0;

    constructor(
        private logger: ILogger,
        private mixerFactory: VideomixerFactory,
        private guiSender: ISendMessagesToGui
    ) {}
    public supportedTypes(): Promise<string[]> {
        return this.guiSender.invokeToGui(IpcChannelConstants.hmiTypesSupported);
    }

    public build(config: IConfig): Promise<IHmi> {
        const configValidator = new ConfigValidator();
        const validConfig = configValidator.validate<IHmiConfigurationWithoutCommunicationChannel>(
            config,
            ConfigSchema
        );

        if (validConfig === undefined) {
            this.error(configValidator.errorGet());
            return Promise.reject(configValidator.errorGet());
        }

        const hmiConfig = config as IHmiConfiguration;
        hmiConfig.communicationChannel = `${IpcChannelConstants.hmiEvent}${this.hmiCounter}`;
        this.hmiCounter++;

        const retval = new HmiBinding(hmiConfig, this.logger, this.mixerFactory, this.guiSender);
        return new Promise<IHmi>((resolve, reject) => {
            retval
                .startup()
                .then(() => {
                    resolve(retval);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    private error(error: string): void {
        this.logger.error(`HmiBuilder: ${error}`);
    }
}
