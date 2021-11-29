import { Container } from '@mui/material';
import * as React from 'react';

import { Team } from './Team';

export class Lobby extends React.Component {
    constructor(props: any) {
        super(props);
        this.state.leftTeamRef = React.createRef();
        this.state.rightTeamRef = React.createRef();
    }

    state: any = {
        leftTeamRef: null,
        rightTeamRef: null,
        bans: [],
        leftTeam: [],
        rightTeam: [],
        localPlayerCellId: null,
        localPlayerTeamId: null,
        gameId: null
    }

    update(lobbyState: any) {

        this.setState(lobbyState)

        const leftTeamComponent = this.state.leftTeamRef.current;
        leftTeamComponent.setState({summoners: lobbyState.leftTeam});

        const rightTeamComponent = this.state.rightTeamRef.current;
        rightTeamComponent.setState({summoners: lobbyState.rightTeam});

        if(lobbyState.localPlayerTeamId === 1)
            leftTeamComponent.setState({localPlayerCellId: lobbyState.localPlayerCellId});
        else
            rightTeamComponent.setState({localPlayerCellId: lobbyState.localPlayerCellId});
    }

    render() {
        return (
            <Container sx={{boxShadow: 3}}>
                <Container>
                    <Team ref={this.state.leftTeamRef}></Team>
                </Container>
                <Container>
                    Bans: {this.state.bans.toString()}
                </Container>
                <Container>
                    <Team ref={this.state.rightTeamRef}></Team>
                </Container>
            </Container>
        )
    } 
}