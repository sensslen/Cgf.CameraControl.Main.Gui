import { eLogType, ILogMessage } from '../Ipc/ILogMessage';
import { IpcChannelConstants } from '../Ipc/IpcChannelConstants';

function addLog(log: ILogMessage) {
    const newLogEntry = document.createElement('p');
    newLogEntry.textContent = log.message;
    if (log.type === eLogType.Error) {
        newLogEntry.className = 'error';
    }

    const previousEntries = logs.querySelectorAll('p');
    if (previousEntries.length > 100) {
        previousEntries[0].remove();
    }
    logs.appendChild(newLogEntry);
    console.log('called');
}

const logs = document.getElementById('logs');
setTimeout(() => addLog({ type: eLogType.Error, message: 'test' }), 200);

window.api.electronIpcOn(IpcChannelConstants.Log, (event, log: ILogMessage) => {
    addLog(log);
});
