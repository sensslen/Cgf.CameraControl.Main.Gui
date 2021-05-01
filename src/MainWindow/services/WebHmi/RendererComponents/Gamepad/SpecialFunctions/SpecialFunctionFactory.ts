import * as KeySchema from './ISpecialFunctionKeyConfig.json';
import * as MacroSchema from './ISpecialFunctionMacroConfig.json';

import { ESpecialFunctionType, ISpecialFunctionDefinition } from './ISpecialFunctionDefinition';

import { ConfigValidator } from '../../../../Configuration/ConfigValidator';
import { ISpecialFunction } from './ISpecialFunction';
import { ISpecialFunctionKeyConfig } from './ISpecialFunctionKeyConfig';
import { ISpecialFunctionMacroConfig } from './ISpecialFunctionMacroConfig';
import { KeySpecialFunction } from './KeySpecialFunction';
import { MacroSpecialFunction } from './MacroSpecialFunction';

export class SpecialFunctionFactory {
    public static get(config: ISpecialFunctionDefinition): ISpecialFunction | undefined {
        switch (config.type) {
            case ESpecialFunctionType.key:
                return SpecialFunctionFactory.buildKeySpecialFunction(config);
            case ESpecialFunctionType.macro:
                return SpecialFunctionFactory.buildMacroSpecialFunction(config);
            default:
                return undefined;
        }
    }

    private static buildKeySpecialFunction(config: ISpecialFunctionDefinition): ISpecialFunction | undefined {
        const configValidator = new ConfigValidator();
        const validConfig = configValidator.validate<ISpecialFunctionKeyConfig>(config, KeySchema);

        if (validConfig === undefined) {
            return undefined;
        }
        return new KeySpecialFunction(validConfig);
    }

    private static buildMacroSpecialFunction(config: ISpecialFunctionDefinition): ISpecialFunction {
        const configValidator = new ConfigValidator();
        const validConfig = configValidator.validate<ISpecialFunctionMacroConfig>(config, MacroSchema);

        if (validConfig === undefined) {
            return undefined;
        }
        return new MacroSpecialFunction(validConfig);
    }
}
