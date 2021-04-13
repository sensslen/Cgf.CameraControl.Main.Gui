import Ajv, { Schema } from 'ajv';

export class ConfigValidator {
    private _ajv = new Ajv();

    validate<TExpected>(config: unknown, schema: Schema | string): TExpected | undefined {
        if (this._ajv.validate(schema, config)) {
            return config as TExpected;
        } else {
            return undefined;
        }
    }

    errorGet(): string {
        return this._ajv.errorsText();
    }
}
