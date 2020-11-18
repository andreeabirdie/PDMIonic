import axios from 'axios';
import {authConfig, baseUrl, getLogger, withLogs} from '../core';
import {SongProps} from './SongProps';
import { Plugins } from "@capacitor/core";
const { Storage } = Plugins;

const songUrl = `http://${baseUrl}/api/song`;

export const getSongs: (token: string) => Promise<SongProps[]> = token => {
    var result = axios.get(songUrl, authConfig(token))
    result.then(async result => {
        for (const song of result.data) {
            await Storage.set({
                key: song._id!,
                value: JSON.stringify({
                    _id: song._id,
                    title: song.title,
                    streams: song.streams,
                    releaseDate: song.releaseDate,
                    hasAwards: song.hasAwards
                }),
            });
        }
    });
    return withLogs(result, 'getSongs');
}

export const createSong: (token: string, song: SongProps) => Promise<SongProps[]> = (token, song) => {
    var result = axios.post(songUrl, song, authConfig(token))
    result.then(async result => {
        var song = result.data;
        await Storage.set({
            key: song._id!,
            value: JSON.stringify({
                _id: song._id,
                title: song.title,
                streams: song.streams,
                releaseDate: song.releaseDate,
                hasAwards: song.hasAwards
            }),
        });
    });
    return withLogs(result, 'createSong');
}

export const updateSong: (token: string, song: SongProps) => Promise<SongProps[]> = (token, song) => {
    var result = axios.put(`${songUrl}/${song._id}`, song, authConfig(token))
    result.then(async result => {
        var song = result.data;
        await Storage.set({
            key: song._id!,
            value: JSON.stringify({
                _id: song._id,
                title: song.title,
                streams: song.streams,
                releaseDate: song.releaseDate,
                hasAwards: song.hasAwards
            }),
        });
    });
    return withLogs(result, 'updateSong');
}

export const removeSong: (token: string, song: SongProps) => Promise<SongProps[]> = (token, song) => {
    var result = axios.delete(`${songUrl}/${song._id}`, authConfig(token))
    result.then(async result => {
        await Storage.remove({key: song._id!})
    })
    return withLogs(result, 'deleteSong');
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
        ws.send(JSON.stringify({type: 'authorization', payload: {token}}));
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
