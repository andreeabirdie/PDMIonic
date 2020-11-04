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
    IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { RouteComponentProps } from 'react-router';
import {SongContext} from "./SongProvider";
import {SongProps} from "./SongProps";

const log = getLogger('ItemEdit');

interface SongEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const SongEdit: React.FC<SongEditProps> = ({ history, match }) => {
    const { items, saving, savingError, saveItem } = useContext(SongContext);
    const [title, setTitle] = useState('');
    const [streams, setStreams] = useState(0);
    const [releaseDate, setReleaseDate] = useState('');
    const [hasAwards, setHasAwards] = useState('');
    const [item, setItem] = useState<SongProps>();
    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const item = items?.find(it => it.id === routeId);
        setItem(item);
        if (item) {
            setTitle(item.title)
            setStreams(item.streams)
            setReleaseDate(item.releaseDate);
            setHasAwards(item.hasAwards)
        }
    }, [match.params.id, items]);
    const handleSave = () => {
        const editedItem = item ? { ...item, title, streams, releaseDate, hasAwards } : { title, streams, releaseDate, hasAwards };
        saveItem && saveItem(editedItem).then(() => history.goBack());
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
                <IonInput placeholder="title" value={title} onIonChange={e => setTitle(e.detail.value || '')} />
                <IonInput placeholder="streams" value={streams} onIonChange={e => setStreams(parseInt(e.detail.value || '0'))} />
                <IonInput placeholder="releaseDate" value={releaseDate} onIonChange={e => setReleaseDate(e.detail.value || '')} />
                <IonInput placeholder="hasAwards" value={hasAwards} onIonChange={e => setHasAwards(e.detail.value || '')} />
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save item'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default SongEdit;