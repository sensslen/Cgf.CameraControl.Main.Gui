import * as React from 'react';

import { ELogType, ILogMessage } from '../../Ipc/ILogMessage';
import { ErrorStyle, LogStyle } from './styled';

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
    private readonly maximumLogCount = 500;
    private uniqueKeyCounter = 0;
    constructor(props: Record<string, never>) {
        super(props);

        this.state = { logs: [] };
    }

    render(): ReactNode {
        const items = [];

        for (const log of this.state.logs) {
            if (log.log.type === ELogType.error) {
                items.push(<ErrorStyle key={log.key}>{log.log.message}</ErrorStyle>);
            } else {
                items.push(<LogStyle key={log.key}>{log.log.message}</LogStyle>);
            }
        }

        return <div>{items}</div>;
    }

    componentDidMount(): void {
        window.api.electronIpcOn(IpcChannelConstants.log, (_event, logEvent: ILogMessage) => {
            const newLogs = this.state.logs.slice(Math.max(-this.state.logs.length, -(this.maximumLogCount - 1)));
            newLogs.push({ log: logEvent, key: this.uniqueKeyCounter });
            this.uniqueKeyCounter++;

            this.setState({ logs: newLogs });
        });
    }
}
