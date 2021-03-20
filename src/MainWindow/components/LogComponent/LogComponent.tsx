import * as React from 'react';
import { eLogType, ILogMessage } from '../../../Ipc/ILogMessage';
import { IpcChannelConstants } from '../../../Ipc/IpcChannelConstants';
import { ErrorStyle, LogStyle } from './styled';

interface ILogMessageInternal {
    log: ILogMessage;
    key: number;
}

class LogComponentState {
    logs: ILogMessageInternal[];
}

export class LogComponent extends React.Component<{}, LogComponentState> {
    private readonly MaximumLogCount = 50;
    private UniqueKeyCounter = 0;
    constructor(props: {}) {
        super(props);

        this.state = { logs: [] };
    }

    render() {
        const items = [];

        for (let log of this.state.logs) {
            if (log.log.type === eLogType.Error) {
                items.push(<ErrorStyle key={log.key}>{log.log.message}</ErrorStyle>);
            } else {
                items.push(<LogStyle key={log.key}>{log.log.message}</LogStyle>);
            }
        }

        return <div>{items}</div>;
    }

    componentDidMount() {
        window.api.electronIpcOn(IpcChannelConstants.Log, (event, LogEvent: ILogMessage) => {
            const newLogs = this.state.logs.slice(Math.max(-this.state.logs.length, -(this.MaximumLogCount - 1)));
            newLogs.push({ log: LogEvent, key: this.UniqueKeyCounter });
            this.UniqueKeyCounter++;

            this.setState({ logs: newLogs });
        });
    }
}
