import { IHmiConfiguration } from '../../IHmiConfiguration';
import { ISpecialFunctionDefinition } from './SpecialFunctions/ISpecialFunctionDefinition';

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
        default: { [key in EButtonDirection]?: ISpecialFunctionDefinition };
        alt?: { [key in EButtonDirection]?: ISpecialFunctionDefinition };
        altLower?: { [key in EButtonDirection]?: ISpecialFunctionDefinition };
    };
}
