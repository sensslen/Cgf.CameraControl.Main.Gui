import { EHmiEvent } from '../../../Events/EHmiEvent';

export interface ISpecialFunction {
    run(
        sendMixBlockEvent: (event: EHmiEvent, value: number) => void,
        sendEvent: (event: EHmiEvent, value: number) => void
    ): void;
}
