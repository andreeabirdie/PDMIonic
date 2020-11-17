import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { SongProps } from './SongProps';

const songUrl = `http://${baseUrl}/api/song`;

export const getSongs: (token: string) => Promise<SongProps[]> = token => {
    return withLogs(axios.get(songUrl, authConfig(token)), 'getSongs');
}

export const createSong: (token: string, song: SongProps) => Promise<SongProps[]> = (token, song) => {
    return withLogs(axios.post(songUrl, song, authConfig(token)), 'createSong');
}

export const updateSong: (token: string, song: SongProps) => Promise<SongProps[]> = (token, song) => {
    return withLogs(axios.put(`${songUrl}/${song._id}`, song, authConfig(token)), 'updateSong');
}

interface MessageData {
    type: string;
    payload: SongProps;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}