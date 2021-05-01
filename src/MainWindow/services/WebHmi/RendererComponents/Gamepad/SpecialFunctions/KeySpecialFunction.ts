import { EHmiEvent } from '../../../Events/EHmiEvent';
import { ISpecialFunction } from './ISpecialFunction';
import { ISpecialFunctionKeyConfig } from './ISpecialFunctionKeyConfig';

export class KeySpecialFunction implements ISpecialFunction {
    constructor(private config: ISpecialFunctionKeyConfig) {}

    run(
        sendMixBlockEvent: (event: EHmiEvent, value: number) => void,
        _sendEvent: (event: EHmiEvent, value: number) => void
    ): void {
        sendMixBlockEvent(EHmiEvent.toggleKey, this.config.index);
    }
}
