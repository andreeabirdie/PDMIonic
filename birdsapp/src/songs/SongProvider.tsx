import React, {useCallback, useContext, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from '../core';
import {createSong, getSongs, newWebSocket, removeSong, updateSong} from './songApi';
import {SongProps} from "./SongProps";
import {AuthContext} from "../auth";
import { Plugins } from "@capacitor/core";
const { Storage } = Plugins;

const log = getLogger('SongProvider');

type SaveSongFn = (song: SongProps) => Promise<any>;
type DeleteSongFn = (song: SongProps) => Promise<any>;

export interface SongsState {
    songs?: SongProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    deleting: boolean,
    deletingError?: Error | null,
    saveSong?: SaveSongFn,
    deleteSong?: DeleteSongFn
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: SongsState = {
    fetching: false,
    saving: false,
    deleting: false
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';
const DELETE_ITEM_STARTED = "DELETE_ITEM_STARTED";
const DELETE_ITEM_SUCCEEDED = "DELETE_ITEM_SUCCEEDED";
const DELETE_ITEM_FAILED = "DELETE_ITEM_FAILED";

const reducer: (state: SongsState, action: ActionProps) => SongsState =
    (state, {type, payload}) => {
        switch (type) {
            case FETCH_ITEMS_STARTED:
                return {...state, fetching: true, fetchingError: null};
            case FETCH_ITEMS_SUCCEEDED:
                return {...state, songs: payload.songs, fetching: false};
            case FETCH_ITEMS_FAILED:
                return {...state, songs: payload.songs, fetching: false};

            case SAVE_ITEM_STARTED:
                return {...state, savingError: null, saving: true};
            case SAVE_ITEM_SUCCEEDED:
                const songs = [...(state.songs || [])];
                const song = payload.song;
                const index = songs.findIndex(it => it._id === song._id);
                if (index === -1) {
                    songs.splice(0, 0, song);
                } else {
                    songs[index] = song;
                }
                return {...state, songs, saving: false};
            case SAVE_ITEM_FAILED:
                return {...state, songs: payload.error, saving: false};

            case DELETE_ITEM_STARTED:
                return {...state, deletingError: null, deleting: true};
            case DELETE_ITEM_SUCCEEDED: {
                const songs = [...(state.songs || [])];
                const song = payload.song;
                const index = songs.findIndex((it) => it._id === song._id);
                songs.splice(index, 1);
                return {...state, songs, deleting: false};
            }
            case DELETE_ITEM_FAILED:
                return {...state, deletingError: payload.error, deleting: false};
            default:
                return state;
        }
    };

export const SongContext = React.createContext<SongsState>(initialState);

interface SongProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const SongProvider: React.FC<SongProviderProps> = ({children}) => {
    const {token} = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const {songs, fetching, fetchingError, saving, savingError, deleting, deletingError} = state;
    useEffect(getSongsEffect, [token]);
    useEffect(wsEffect, [token]);
    const saveSong = useCallback<SaveSongFn>(saveSongCallback, [token]);
    const deleteSong = useCallback<DeleteSongFn>(deleteSongCallback, [token]);
    const value = {songs, fetching, fetchingError, saving, savingError, saveSong, deleting, deletingError, deleteSong};
    log('returns');
    return (
        <SongContext.Provider value={value}>
            {children}
        </SongContext.Provider>
    );

    function getSongsEffect() {
        let canceled = false;
        fetchSongs();
        return () => {
            canceled = true;
        }

        async function fetchSongs() {
            let canceled = false;
            fetchSongs();
            return () => {
                canceled = true;
            }

            async function fetchSongs() {
                if (!token?.trim()) {
                    return;
                }
                try {
                    log('fetchSongs started');
                    dispatch({type: FETCH_ITEMS_STARTED});
                    const songs = await getSongs(token);
                    log('fetchSongs succeeded');
                    if (!canceled) {
                        dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {songs}});
                    }
                } catch (error) {

                    let storageKeys = Storage.keys();
                    const promisedSongs = await storageKeys.then(async function (storageKeys) {
                        const songList = [];
                        for (let i = 0; i < storageKeys.keys.length; i++) {
                            // alert(storageKeys.keys[i])
                            if(storageKeys.keys[i] != 'token') {
                                const promisedSong = await Storage.get({key: storageKeys.keys[i]});
                                // alert(promisedSong.value)
                                if (promisedSong.value != null) {
                                    var song = JSON.parse(promisedSong.value);
                                }
                                songList.push(song);
                            }
                        }
                        return songList;
                    });

                    const songs = promisedSongs
                    dispatch({type: FETCH_ITEMS_FAILED, payload: {songs}});
                }
            }
        }
    }

    async function saveSongCallback(song: SongProps) {
        try {
            log('saveSong started');
            dispatch({type: SAVE_ITEM_STARTED});
            const savedSong = await (song._id ? updateSong(token, song) : createSong(token, song));
            log('saveSong succeeded');
            dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {song: savedSong}});
        } catch (error) {
            log('saveSong failed');
            dispatch({type: SAVE_ITEM_FAILED, payload: {error}});
        }
    }

    async function deleteSongCallback(song: SongProps) {
        try {
            log("delete started");
            dispatch({type: DELETE_ITEM_STARTED});
            const deletedSong = await removeSong(token, song);
            log("delete succeeded");
            console.log(deletedSong);
            dispatch({type: DELETE_ITEM_SUCCEEDED, payload: {song: song}});
        } catch (error) {
            log("delete failed");
            dispatch({type: DELETE_ITEM_FAILED, payload: {error}});
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, message => {
                if (canceled) {
                    return;
                }
                const {type, payload: song} = message;
                log(`ws message, song ${type}`);
                if (type === 'created' || type === 'updated') {
                    dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {song}});
                }
            });
        }
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket?.();
        }
    }
};