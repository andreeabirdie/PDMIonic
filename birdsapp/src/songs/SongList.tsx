import React, {useContext, useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonLabel,
    IonList, IonListHeader, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {add} from 'ionicons/icons';
import {getLogger} from '../core';
import {SongContext} from "./SongProvider";
import Song from "./Song";
import {AuthContext} from "../auth";
import {SongProps} from "./SongProps";

const log = getLogger('SongList');

const offset = 10;

const SongList: React.FC<RouteComponentProps> = ({history}) => {
    const {logout} = useContext(AuthContext);
    const {songs, fetching, fetchingError} = useContext(SongContext);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState(false);
    const [visibleSongs, setVisibleSongs] = useState<SongProps[] | undefined>([]);
    const [page, setPage] = useState(offset)

    useEffect(()=>{
        log('search term effect')
        setPage(offset)
        fetchData();
    }, [songs]);

    function fetchData(){
        setVisibleSongs(songs?.slice(0, page))
        setPage(page + offset);
        if (songs && page > songs?.length) {
            setDisableInfiniteScroll(true);
            setPage(songs.length);
        }
        else {
            setDisableInfiniteScroll(false);
        }
    }

    async function getNextPage($event:CustomEvent<void>){
        fetchData();
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Songs</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching songs"/>
                {visibleSongs && (
                    <IonList>
                        <IonListHeader lines="inset">
                            <IonLabel>Title</IonLabel>
                            <IonLabel>Nr of streams</IonLabel>
                            <IonLabel>Date</IonLabel>
                            <IonLabel>hasAwards?</IonLabel>
                        </IonListHeader>
                        {visibleSongs.map(({_id, title, streams, releaseDate, hasAwards}) =>
                            <Song key={_id} _id={_id} title={title} streams={streams}
                                             releaseDate={releaseDate} hasAwards={hasAwards}
                                             onEdit={_id => history.push(`/song/${_id}`)}/>
                        )}
                    </IonList>
                )}
                <IonInfiniteScroll threshold = "100px" disabled={disableInfiniteScroll}
                                   onIonInfinite = {(e:CustomEvent<void>)=>getNextPage(e)}>
                    <IonInfiniteScrollContent
                        loadingText="Loading more songs...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch songs'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/song')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonFabButton onClick={handleLogout}>
                        Logout
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );

    function handleLogout() {
        log("logout");
        logout?.();
    }
};

export default SongList;