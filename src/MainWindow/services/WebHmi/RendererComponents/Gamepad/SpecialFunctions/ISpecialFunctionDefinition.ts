export enum ESpecialFunctionType {
    key = 'key',
    macro = 'macro',
    connectionChange = 'connectionChange',
}

export interface ISpecialFunctionDefinition {
    type: ESpecialFunctionType;
}
