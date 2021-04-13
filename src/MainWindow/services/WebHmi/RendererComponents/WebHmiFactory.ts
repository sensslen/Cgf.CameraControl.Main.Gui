import * as GamepadSchema from './Gamepad/IWebGamepadConfig.json';

import { ConfigValidator } from '../../Configuration/ConfigValidator';
import { IHmiBuildResult } from '../IHmiBuildResult';
import { IHmiConfiguration } from '../IHmiConfiguration';
import { ILogger } from 'cgf.cameracontrol.main.core';
import { IWebGamepadConfig } from './Gamepad/IWebGamepadConfig';
import { IpcChannelConstants } from '../../../Ipc/IpcChannelConstants';
import { WebGamepad } from './Gamepad/WebGamepad';

export class WebHmiFactory {
    private readonly gamepadType = 'web/gamepad';
    private readonly builders: { [key: string]: (config: IHmiConfiguration) => IHmiBuildResult } = {};

    constructor(private logger: ILogger) {
        this.builders[this.gamepadType] = this.buildWebGamepad;

        window.api.electronIpcOn(IpcChannelConstants.hmiConfiguration, (_event, config: IHmiConfiguration) => {
            this.build(config);
        });
        window.api.electronIpcOn(IpcChannelConstants.hmiTypesSupported, (_event) => {
            window.api.electronIpcSend(IpcChannelConstants.hmiTypesSupported, Object.keys(this.builders));
        });
    }

    private build(config: IHmiConfiguration) {
        let result: IHmiBuildResult = { success: false, error: `${config.type} not supported` };

        switch (config.type) {
            case this.gamepadType:
                result = this.buildWebGamepad(config);
                break;
        }

        window.api.electronIpcSend(IpcChannelConstants.hmiConfiguration, result);
    }

    private buildWebGamepad(config: IHmiConfiguration): IHmiBuildResult {
        const configValidator = new ConfigValidator();
        const validConfig = configValidator.validate<IWebGamepadConfig>(config, GamepadSchema);

        if (validConfig === undefined) {
            return { success: false, error: configValidator.errorGet() };
        }

        const gamepad = new WebGamepad(this.logger, validConfig);
        gamepad.start();
        return { success: true };
    }
}
