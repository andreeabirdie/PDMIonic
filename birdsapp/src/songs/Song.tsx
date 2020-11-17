import React from 'react';
import {IonItem, IonLabel} from '@ionic/react';
import {SongProps} from "./SongProps";

interface SongPropsExt extends SongProps {
    onEdit: (_id?: string) => void;
}

const Song: React.FC<SongPropsExt> = ({_id, title, streams, releaseDate, hasAwards, onEdit}) => {
    console.log("title " + title + " streams " + streams + "releaseDate" + releaseDate + " hasAwards " + hasAwards)
    return (
        <IonItem onClick={() => onEdit(_id)}>
            <IonLabel>{title}</IonLabel>
            <IonLabel>{streams}</IonLabel>
            <IonLabel>{releaseDate}</IonLabel>
            <IonLabel>{hasAwards.toString()}</IonLabel>
        </IonItem>
    );
};

export default Song;