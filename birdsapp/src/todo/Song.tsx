import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import {SongProps} from "./SongProps";

interface SongPropsExt extends SongProps {
    onEdit: (id?: string) => void;
}

const Song: React.FC<SongPropsExt> = ({ id, title, streams, releaseDate, hasAwards, onEdit }) => {
    console.log("title " + title + " streams " + streams + "releaseDate" + releaseDate + " hasAwards " + hasAwards)
    return (
        <IonItem onClick={() => onEdit(id)}>
            <IonLabel>{title}</IonLabel>
            <IonLabel>{streams}</IonLabel>
            <IonLabel>{timeConverter(releaseDate)}</IonLabel>
            <IonLabel>{hasAwards.toString()}</IonLabel>
        </IonItem>
    );
};

export default Song;

function timeConverter(dateUnix: string){
    var a = new Date(parseInt(dateUnix));
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var time = date + ' ' + month + ' ' + year ;
    return time;
}