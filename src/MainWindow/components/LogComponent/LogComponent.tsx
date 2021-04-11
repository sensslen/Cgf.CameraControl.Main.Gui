import * as React from 'react';

import { ErrorStyle, LogStyle } from './styled';
import { ILogMessage, eLogType } from '../../Ipc/ILogMessage';

import { IpcChannelConstants } from '../../Ipc/IpcChannelConstants';
import { ReactNode } from 'react';

interface ILogMessageInternal {
    log: ILogMessage;
    key: number;
}

class LogComponentState {
    logs: ILogMessageInternal[];
}

export class LogComponent extends React.Component<Record<string, never>, LogComponentState> {
    private readonly MaximumLogCount = 50;
    private UniqueKeyCounter = 0;
    constructor(props: Record<string, never>) {
        super(props);

        this.state = { logs: [] };
    }

    render(): ReactNode {
        const items = [];

        for (const log of this.state.logs) {
            if (log.log.type === eLogType.Error) {
                items.push(<ErrorStyle key={log.key}>{log.log.message}</ErrorStyle>);
            } else {
                items.push(<LogStyle key={log.key}>{log.log.message}</LogStyle>);
            }
        }

        return <div>{items}</div>;
    }

    componentDidMount(): void {
        window.api.electronIpcOn(IpcChannelConstants.Log, (_event, LogEvent: ILogMessage) => {
            const newLogs = this.state.logs.slice(Math.max(-this.state.logs.length, -(this.MaximumLogCount - 1)));
            newLogs.push({ log: LogEvent, key: this.UniqueKeyCounter });
            this.UniqueKeyCounter++;

            this.setState({ logs: newLogs });
        });
    }
}
