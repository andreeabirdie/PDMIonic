import axios from 'axios';
import { getLogger } from '../core';
import { SongProps } from './SongProps';

const log = getLogger('itemApi');

const baseUrl = 'localhost:3000';
const itemUrl = `http://${baseUrl}/song`;

interface ResponseProps<T> {
    data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
    log(`${fnName} - started`);
    return promise
        .then(res => {
            log(`${fnName} - succeeded`);
            return Promise.resolve(res.data);
        })
        .catch(err => {
            log(`${fnName} - failed`);
            return Promise.reject(err);
        });
}

const config = {
    headers: {
        'Content-Type': 'application/json'
    }
};

export const getItems: () => Promise<SongProps[]> = () => {
    return withLogs(axios.get(itemUrl, config), 'getItems');
}

export const createItem: (item: SongProps) => Promise<SongProps[]> = item => {
    return withLogs(axios.post(itemUrl, item, config), 'createItem');
}

export const updateItem: (item: SongProps) => Promise<SongProps[]> = item => {
    return withLogs(axios.put(`${itemUrl}/${item.id}`, item, config), 'updateItem');
}

interface MessageData {
    event: string;
    payload: {
        item: SongProps;
    };
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
        log('web socket onopen');
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