import ajv from 'ajv/lib/ajv';

export class ConfigValidator {
    private _ajv = new ajv();

    public validate<TExpected>(config: unknown, schema: string | { [key: string]: unknown }): TExpected | undefined {
        if (this._ajv.validate(schema, config)) {
            return config as TExpected;
        } else {
            return undefined;
        }
    }

    public errorGet(): string {
        return this._ajv.errorsText();
    }
}
