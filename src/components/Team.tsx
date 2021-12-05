import { LinearProgress, CircularProgress, Avatar, Divider, Stack, Typography } from '@mui/material';
import React, {FC, ReactElement, useState} from 'react';

export type TeamProp = {
    summoners: Array<any>,
    localPlayerCellId: Number
};

export const Team: FC<TeamProp> = (props: TeamProp): ReactElement => {
    const {summoners, localPlayerCellId} = props;

    const renderSummoners = () => {
        // console.log(summoners, localPlayerCellId);
        return (!summoners || summoners.length < 1) ? <LinearProgress color="secondary"/> : summoners.map(
            (s: any) => {
                
                const style = {boxShadow: 1, p: 2, backgroundColor: "#EEE"};
                s.cellId !== localPlayerCellId ? style.backgroundColor = "#EEE" : style.backgroundColor = "gold";

                return (
                    <Stack key={s.cellId} direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2} sx={style}>
                        <Avatar alt="Champion name"/>
                        <Stack divider={<Divider orientation="horizontal" flexItem />} spacing={1}>
                            <Typography>{s.summonerId}</Typography>
                            {/* <Typography>{s.cellId}</Typography> */}
                            <Typography>{s.assignedPosition === "" ? "unknown role" : s.assignedPosition}</Typography>
                            <Typography>{s.championId}</Typography>
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