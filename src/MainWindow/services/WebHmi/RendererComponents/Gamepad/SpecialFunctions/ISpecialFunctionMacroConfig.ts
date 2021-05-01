import { ISpecialFunctionDefinition } from './ISpecialFunctionDefinition';

export interface ISpecialFunctionMacroConfig extends ISpecialFunctionDefinition {
    indexes: [number, ...number[]];
}
