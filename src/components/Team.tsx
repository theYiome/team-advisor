import { LinearProgress, CircularProgress, Avatar, Divider, Stack, Typography } from '@mui/material';
import React, {FC, ReactElement, useContext, useState} from 'react';

import { ChampionsContext } from './ChampionsContext';

export type TeamProp = {
    summoners: Array<any>,
    localPlayerCellId: Number
};

export const Team: FC<TeamProp> = (props: TeamProp): ReactElement => {
    const {summoners, localPlayerCellId} = props;

    const [champions, setChampions] = useContext(ChampionsContext);

    const renderSummoners = () => {
        // console.log(summoners, localPlayerCellId);
        return (!summoners || summoners.length < 1) ? <LinearProgress/> : summoners.map(
            (s: any) => {
                console.log(s);
                
                const style = {boxShadow: 1, p: 2, backgroundColor: "#EEE"};
                s.cellId !== localPlayerCellId ? style.backgroundColor = "#EEE" : style.backgroundColor = "gold";

                const patch = champions["patch"];
                const championName = champions[s.championId];

                return (
                    <Stack key={s.cellId} direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2} sx={style}>
                        <Avatar alt={championName} src={avatarURI(patch, championName)}/>
                        <Stack divider={<Divider orientation="horizontal" flexItem/>} spacing={1}>
                            <Typography>{s.summonerId}</Typography>
                            <Typography>{s.assignedPosition === "" ? "unknown role" : s.assignedPosition}</Typography>
                            <Typography>{championName}</Typography>
                            <Typography>{s.championPickIntent}</Typography>
                        </Stack>
                    </Stack>
                );
            }
        );
    }

    return (
        <Stack spacing={2}>
            {renderSummoners()}
        </Stack>
    );
}

function avatarURI(patch: string, championName: string) {
    return `http://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${championName}.png`;
}