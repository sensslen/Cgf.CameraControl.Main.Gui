import * as GamepadSchema from './Gamepad/IWebGamepadConfig.json';

import { ConfigValidator } from '../../Configuration/ConfigValidator';
import { IHmiConfiguration } from '../IHmiConfiguration';
import { ILogger } from 'cgf.cameracontrol.main.core';
import { IWebGamepadConfig } from './Gamepad/IWebGamepadConfig';
import { IpcChannelConstants } from '../../../Ipc/IpcChannelConstants';
import { WebGamepad } from './Gamepad/WebGamepad';

interface IBuildResult {
    success: boolean;
    error?: string;
}

export class WebHmiFactory {
    private readonly gamepadType = 'web/gamepad';
    private readonly builders: { [key: string]: (config: IHmiConfiguration) => IBuildResult } = {};

    constructor(private logger: ILogger) {
        this.builders[this.gamepadType] = this.buildWebGamepad;

        window.api.electronIpcOn(IpcChannelConstants.HmiConfiguration, (_event, config: IHmiConfiguration) => {
            this.build(config);
        });
        window.api.electronIpcOn(IpcChannelConstants.HmiTypesSupported, (_event) => {
            window.api.electronIpcSend(IpcChannelConstants.HmiTypesSupported, Object.keys(this.builders));
        });
    }

    private build(config: IHmiConfiguration) {
        let result: IBuildResult;

        switch (config.type) {
            case this.gamepadType:
                result = this.buildWebGamepad(config);
                break;
        }

        window.api.electronIpcSend(IpcChannelConstants.HmiConfiguration, result.success, result.error);
    }

    private buildWebGamepad(config: IHmiConfiguration): IBuildResult {
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
