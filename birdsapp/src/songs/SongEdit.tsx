import React, { useContext, useEffect, useState } from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonLabel, IonCheckbox, IonDatetime, IonFabButton, IonFab
} from '@ionic/react';
import { getLogger } from '../core';
import { SongContext } from './SongProvider';
import { RouteComponentProps } from 'react-router';
import { SongProps } from './SongProps';
import moment from 'moment';
import {MyModal} from "../animations/MyModal";

const log = getLogger('SongEdit');

interface SongEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const SongEdit: React.FC<SongEditProps> = ({ history, match }) => {
    const { songs, saving, savingError, saveSong, deleteSong } = useContext(SongContext);
    const [title, setTitle] = useState('');
    const [streams, setStreams] = useState(0);
    const [releaseDate, setReleaseDate] = useState('');
    const [hasAwards, setHasAwards] = useState(false);
    const [song, setSong] = useState<SongProps>();
    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const song = songs?.find(it => it._id === routeId);
        setSong(song);
        if (song) {
            setTitle(song.title);
            setStreams(song.streams);
            setReleaseDate(song.releaseDate);
            setHasAwards(song.hasAwards);
        }
    }, [match.params.id, songs]);
    const handleSave = () => {
        const editedSong = song ? { ...song, title, streams, releaseDate, hasAwards } : { title, streams, releaseDate, hasAwards };
        saveSong && saveSong(editedSong).then(() => history.goBack());
    };

    const handleDelete = () => {
        const editedSong = song
            ? { ...song, title, streams, releaseDate, hasAwards }
            : {title, streams, releaseDate, hasAwards };
        deleteSong && deleteSong(editedSong).then(() => history.goBack());
    };
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLabel>Song title</IonLabel>
                <IonInput value={title} onIonChange={e => setTitle(e.detail.value || '')} />
                <IonLabel>Streams</IonLabel>
                <IonInput value={streams} onIonChange={e => setStreams(Number(e.detail.value || 0))} />
                <IonLabel>Release Date</IonLabel>
                <IonDatetime displayFormat="DD.MM.YYYY" pickerFormat="DD.MM.YYYY" value={releaseDate} onBlur={e => setReleaseDate((moment(e.target.value).format('DD.MM.YYYY')) || '')}/>
                <IonCheckbox checked={hasAwards} onIonChange={e => setHasAwards(e.detail.checked)}/>
                <IonLabel>hasAwards</IonLabel>
                <MyModal/>
                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonFabButton onClick={handleDelete}>
                        delete
                    </IonFabButton>
                </IonFab>
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save song'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default SongEdit;