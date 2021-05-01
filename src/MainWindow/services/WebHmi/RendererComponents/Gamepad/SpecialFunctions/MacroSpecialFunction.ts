import { EHmiEvent } from '../../../Events/EHmiEvent';
import { ISpecialFunction } from './ISpecialFunction';
import { ISpecialFunctionMacroConfig } from './ISpecialFunctionMacroConfig';

export class MacroSpecialFunction implements ISpecialFunction {
    private nextIndex = 0;
    constructor(private config: ISpecialFunctionMacroConfig) {}

    run(
        _sendMixBlockEvent: (event: EHmiEvent, value: number) => void,
        sendEvent: (event: EHmiEvent, value: number) => void
    ): void {
        sendEvent(EHmiEvent.runMacro, this.config.indexes[this.nextIndex]);
        this.nextIndex++;
        if (this.nextIndex >= this.config.indexes.length) {
            this.nextIndex = 0;
        }
    }
}
