import { Chip, Container } from '@mui/material';
import React from 'react';
import {FC, ReactElement, useState} from 'react';

export const Team: FC<any> = (): ReactElement => {
    const [summoners, setSummoners] = useState([]);
    const [localPlayerCellId, setLocalPlayerCellId] = useState(null);

    const renderSummoners = () => {
        if(!summoners) return (
            <Chip label="No summoner data" color="error"></Chip>
        );

        return summoners.map(
            (s: any) => {
                <Container className="summoner" key={s.cellId}>
                    <div className="summonerId">{s.summonerId}</div>
                    <div className="cellId">{s.cellId}</div>
                    <div className="assignedPosition">{s.assignedPosition}</div>
                    <div className="championId">{s.championId}</div>
                    <div className="championPickIntent">{s.championPickIntent}</div>
                </Container>
            }
        );
    }

    return (
        <Container className="team">
            {renderSummoners()}
        </Container>
    );
}