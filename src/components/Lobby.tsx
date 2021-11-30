import { Container } from '@mui/material';
import React, { ReactElement, FC, useState } from 'react';
import { Team, TeamProp } from './Team';

//TODO Lobby should be able to do client requests
//TODO provide data form lockfile

export const Lobby: FC<any> = (): ReactElement => {
    const initialState: any = {
        leftTeamRef: null,
        rightTeamRef: null,
        bans: [],
        leftTeam: [],
        rightTeam: [],
        localPlayerCellId: null,
        localPlayerTeamId: null,
        gameId: null
    };

    const [lobbyState, setLobbyState] = useState(initialState);

    const tmp: TeamProp = {
        summoners: [], 
        localPlayerCellId: 1
    }

    return (
        <Container>
            <Container>
                <Team {...tmp}></Team>
            </Container>
            <Container>
                Bans: {lobbyState.bans.toString()}
            </Container>
            <Container>
                <Team {...tmp}></Team>
            </Container>
        </Container>
    );
}

// export class Lobby2 extends React.Component {
//     constructor(props: any) {
//         super(props);
//         this.state.leftTeamRef = React.createRef();
//         this.state.rightTeamRef = React.createRef();
//     }

//     state: any = {
//         leftTeamRef: null,
//         rightTeamRef: null,
//         bans: [],
//         leftTeam: [],
//         rightTeam: [],
//         localPlayerCellId: null,
//         localPlayerTeamId: null,
//         gameId: null
//     }

//     update(lobbyState: any) {

//         this.setState(lobbyState)

//         const leftTeamComponent = this.state.leftTeamRef.current;
//         leftTeamComponent.setState({summoners: lobbyState.leftTeam});

//         const rightTeamComponent = this.state.rightTeamRef.current;
//         rightTeamComponent.setState({summoners: lobbyState.rightTeam});

//         if(lobbyState.localPlayerTeamId === 1)
//             leftTeamComponent.setState({localPlayerCellId: lobbyState.localPlayerCellId});
//         else
//             rightTeamComponent.setState({localPlayerCellId: lobbyState.localPlayerCellId});
//     }

//     render() {
//         return (
//             <Container>
//                 <Container>
//                     <Team ref={this.state.leftTeamRef}></Team>
//                 </Container>
//                 <Container>
//                     Bans: {this.state.bans.toString()}
//                 </Container>
//                 <Container>
//                     <Team ref={this.state.rightTeamRef}></Team>
//                 </Container>
//             </Container>
//         )
//     } 
// }