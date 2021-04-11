import * as React from 'react';

import { LogComponent } from '../LogComponent/LogComponent';
import { ReactNode } from 'react';

export class Main extends React.Component<Record<string, never>, Record<string, never>> {
    render(): ReactNode {
        return (
            <div>
                <LogComponent />
            </div>
        );
    }
}
