import * as React from 'react';
import { LogComponent } from '../LogComponent/LogComponent';

export class Main extends React.Component<{}, {}> {
    render() {
        return (
            <div>
                <LogComponent />
            </div>
        );
    }
}
