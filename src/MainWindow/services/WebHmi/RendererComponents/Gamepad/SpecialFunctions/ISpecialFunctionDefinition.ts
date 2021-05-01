export enum ESpecialFunctionType {
    key = 'key',
    macro = 'macro',
}

export interface ISpecialFunctionDefinition {
    type: ESpecialFunctionType;
}
