import { Chip, Container } from '@mui/material';
import React from 'react';
import {FC, ReactElement, useState} from 'react';

export type TeamProp = {
    summoners: Array<any>,
    localPlayerCellId: Number
};

export const Team: FC<TeamProp> = (props: TeamProp): ReactElement => {
    const {summoners, localPlayerCellId} = props;

    const renderSummoners = () => {
        return (!summoners) ? <Chip label="No summoner data" color="error"></Chip> : summoners.map(
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