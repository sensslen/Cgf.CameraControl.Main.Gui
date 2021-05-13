import { EHmiEvent } from '../../../Events/EHmiEvent';
import { ISpecialFunction } from './ISpecialFunction';
import { ISpecialFunctionConnectionChangeConfig } from './ISpecialFunctionConnectionChangeConfig';

export class ConnectionChangeSpecialFunction implements ISpecialFunction {
    constructor(private config: ISpecialFunctionConnectionChangeConfig) {}

    run(
        sendMixBlockEvent: (event: EHmiEvent, value: number) => void,
        _sendEvent: (event: EHmiEvent, value: number) => void
    ): void {
        sendMixBlockEvent(EHmiEvent.changeInput, this.config.index);
    }
}
