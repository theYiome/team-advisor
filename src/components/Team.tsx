import { Chip, Container } from '@mui/material';
import * as React from 'react';


export class Team extends React.Component {
    state: any = {
        summoners: [],
        localPlayerCellId: null
    }

    renderSummoners() {
        if(!this.state.summoners) return (
            <Chip label="No summoner data" color="error"></Chip>
        );

        return this.state.summoners.map(
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

    render() {
        return (
            <Container className="team" sx={{boxShadow: 3}}>
                {this.renderSummoners()}
            </Container>
        );
    }
}