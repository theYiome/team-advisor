import { LinearProgress, CircularProgress, Avatar, Divider, Stack, Typography, Autocomplete, Box, TextField } from '@mui/material';
import React, { FC, ReactElement, useContext, useState } from 'react';

import { ChampionsContext } from './ChampionsContext';

// TODO: it does not work, issue with webpack?
// https://webpack.js.org/guides/asset-management/#loading-images

// import TopIcon from '../images/top.png';
// import JungleIcon from '../images/jungle.png'
// import BottomIcon from '../images/bottom.png';
// import SupportIcon from '../images/support.png';
// import MiddleIcon from '../images/middle.png';


export type PickEntryProp = {
    isPlayer: boolean,
    championId: number,
    role: string,
};

const roles = ["top", "jungle", "middle", "bottom", "support"];

export const PickEntry: FC<PickEntryProp> = (props: PickEntryProp): ReactElement => {

    const [champions, setChampions] = useContext(ChampionsContext);

    const style = { boxShadow: 1, p: 2, backgroundColor: "#EEE" };
    !props.isPlayer ? style.backgroundColor = "#EEE" : style.backgroundColor = "gold";

    const patch = champions["patch"];
    const championName = champions[props.championId];

    const championNames = Object.keys(champions).filter((key: string) => !isNaN(key as any)).map((goodKey: string) => champions[goodKey]).sort();

    const avatarStyle = { width: 64, height: 64, boxShadow: 5 };
    
    return (
        <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2} sx={style}>
            <Stack spacing={2}>
                <Avatar alt={championName} src={avatarURI(patch, championName)} sx={avatarStyle}/>
                <Avatar alt={props.role} src={avatarURI(patch, championName)} sx={avatarStyle}/>
            </Stack>

            <Stack spacing={1} sx={{width: 1 }}>

                <Autocomplete
                    options={roles}
                    renderOption={(props, option) => (
                        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 }}} {...props}>
                            {option.toString()}
                        </Box>
                    )}
                    renderInput={(params) => (
                        <TextField {...params} variant="standard" label="Role" />
                    )}
                />

                <Autocomplete
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

                <Divider orientation="horizontal" flexItem />
                <Typography>Suggestions from your champions</Typography>
                <Divider orientation="horizontal" flexItem />
                <Typography>Suggestions from all champions</Typography>
            </Stack>
        </Stack>
    );
}

function avatarURI(patch: string, championName: string) {
    return `http://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${championName}.png`;
}