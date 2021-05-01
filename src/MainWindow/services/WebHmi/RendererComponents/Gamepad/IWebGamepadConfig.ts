import { IHmiConfiguration } from '../../IHmiConfiguration';
import { ISpecialFunctionKeyConfig } from './SpecialFunctions/ISpecialFunctionKeyConfig';
import { ISpecialFunctionMacroConfig } from './SpecialFunctions/ISpecialFunctionMacroConfig';

export enum EButtonDirection {
    up = 'up',
    down = 'down',
    left = 'left',
    right = 'right',
}

export interface IWebGamepadConfig extends IHmiConfiguration {
    mixBlock: number;
    connectionChange: {
        default: { [key in EButtonDirection]?: number };
        alt?: { [key in EButtonDirection]?: number };
        altLower?: { [key in EButtonDirection]?: number };
    };
    specialFunction: {
        default: { [key in EButtonDirection]?: ISpecialFunctionMacroConfig | ISpecialFunctionKeyConfig };
        alt?: { [key in EButtonDirection]?: ISpecialFunctionMacroConfig | ISpecialFunctionKeyConfig };
        altLower?: { [key in EButtonDirection]?: ISpecialFunctionMacroConfig | ISpecialFunctionKeyConfig };
    };
}
