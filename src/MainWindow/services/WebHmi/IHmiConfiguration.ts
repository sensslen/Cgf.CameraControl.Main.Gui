import { IConfig } from 'cgf.cameracontrol.main.core';

export interface IHmiConfigurationWithoutCommunicationChannel extends IConfig {
    VideoMixer: number;
}

export interface IHmiConfiguration extends IHmiConfigurationWithoutCommunicationChannel {
    communicationChannel: string;
}
