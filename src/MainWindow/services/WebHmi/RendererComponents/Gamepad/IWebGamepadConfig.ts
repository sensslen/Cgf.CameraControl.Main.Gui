import { IHmiConfiguration } from '../../IHmiConfiguration';

export enum eButtonDirection {
    up = 'up',
    down = 'down',
    left = 'left',
    right = 'right',
}

export enum eSpecialFunctionType {
    key = 'key',
    macro = 'macro',
}

export interface ISpecialFunctionDefinition {
    Type: eSpecialFunctionType;
    Index: number;
}

export interface IWebGamepadConfig extends IHmiConfiguration {
    MixBlock: number;
    ConnectionChange: {
        Default: { [key in eButtonDirection]?: number };
        Alt?: { [key in eButtonDirection]?: number };
        AltLower?: { [key in eButtonDirection]?: number };
    };
    SpecialFunction: {
        Default: { [key in eButtonDirection]?: ISpecialFunctionDefinition };
        Alt?: { [key in eButtonDirection]?: ISpecialFunctionDefinition };
        AltLower?: { [key in eButtonDirection]?: ISpecialFunctionDefinition };
    };
}
