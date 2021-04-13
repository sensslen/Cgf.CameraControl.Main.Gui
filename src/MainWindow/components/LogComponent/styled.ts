import styled from 'styled-components';

const logEntry = styled.p`
    font-family: monospace;
`;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ErrorStyle = styled(logEntry)`
    color: red;
`;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const LogStyle = styled(logEntry)``;
