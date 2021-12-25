import { LinearProgress, CircularProgress, Avatar, Divider, Stack, Typography, Autocomplete, Box, TextField } from '@mui/material';
import React, { FC, ReactElement, useContext, useState } from 'react';

import { ChampionsContext } from './ChampionsContext';

export type PickEntryProp = {
    isPlayer: boolean,
    championId: number,
    role: string,
};


export const PickEntry: FC<PickEntryProp> = (props: PickEntryProp): ReactElement => {

    const [champions, setChampions] = useContext(ChampionsContext);

    const style = { boxShadow: 1, p: 2, backgroundColor: "#EEE" };
    !props.isPlayer ? style.backgroundColor = "#EEE" : style.backgroundColor = "gold";

    const patch = champions["patch"];
    const championName = champions[props.championId];

    const championNames = Object.keys(champions).filter((key: string) => !isNaN(key as any)).map((goodKey: string) => champions[goodKey]).sort();

    return (
        <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2} sx={style}>
            <Avatar alt={championName} src={avatarURI(patch, championName)} />
            <Stack divider={<Divider orientation="horizontal" flexItem />} spacing={1}>
                <Typography>{props.role}</Typography>
                <Autocomplete
                    sx={{width: 1 }}
                    options={championNames}
                    renderOption={(props, option) => (
                        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 }}} {...props}>
                            <img loading="lazy" width="20" src={avatarURI(patch, option)} alt={championName} />
                            {option.toString()}
                        </Box>
                    )}
                    renderInput={(params) => (
                        <TextField {...params} variant="standard" label="Champion" />
                    )}
                />
            </Stack>
        </Stack>
    );
}

function avatarURI(patch: string, championName: string) {
    return `http://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${championName}.png`;
}