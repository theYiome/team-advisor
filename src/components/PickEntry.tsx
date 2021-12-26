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

const roleImages: any = {
    top: "https://static.wikia.nocookie.net/leagueoflegends/images/e/ef/Top_icon.png",
    jungle: "https://static.wikia.nocookie.net/leagueoflegends/images/1/1b/Jungle_icon.png",
    middle: "https://static.wikia.nocookie.net/leagueoflegends/images/9/98/Middle_icon.png",
    bottom: "https://static.wikia.nocookie.net/leagueoflegends/images/9/97/Bottom_icon.png",
    support: "https://static.wikia.nocookie.net/leagueoflegends/images/e/e0/Support_icon.png"
}


export type PickEntryProp = {
    championName: string,
    roleName: string,
    patch: string,
    champions?: string[],
    roles?: string[],
    disabled?: boolean,
    isPlayer?: boolean,
    onChange?: any
};

const roles = ["top", "jungle", "middle", "bottom", "support"];

export const PickEntry: FC<PickEntryProp> = ({
    championName,
    roleName,
    patch,
    champions = [],
    roles = [],
    disabled = false,
    isPlayer = false,
    onChange = (newChamionName: string, newRoleName: string) => {}
}: PickEntryProp): ReactElement => {

    const style = { boxShadow: 1, p: 2, backgroundColor: "#EEE" };
    !isPlayer ? style.backgroundColor = "#EEE" : style.backgroundColor = "gold";


    const avatarStyle = { width: 64, height: 64, boxShadow: 5, backgroundColor: "white" };

    return (
        <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2} sx={style}>
            <Stack spacing={2}>
                <Avatar alt={championName} src={championName ? avatarURI(patch, championName) : ""} sx={avatarStyle} />
                <Avatar alt={roleName} src={roleImages[roleName]} sx={avatarStyle} variant="rounded" />
            </Stack>

            <Stack spacing={1} sx={{ width: 1 }}>
                <Autocomplete
                    value={championName}
                    onChange={(event: any, newValue: string | null) => onChange(newValue, roleName)}
                    options={champions}
                    renderOption={(props, option) => (
                        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                            <img loading="lazy" width="20" src={avatarURI(patch, option)} alt={championName} />
                            {option.toString()}
                        </Box>
                    )}
                    renderInput={(params) => (
                        <TextField {...params} variant="standard" label="Champion" />
                    )}
                    disabled={disabled}
                />

                <Autocomplete
                    value={roleName}
                    onChange={(event: any, newValue: string | null) => onChange(championName, newValue)}
                    options={roles}
                    renderOption={(props, option) => (
                        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                            <img loading="lazy" width="20" src={roleImages[option]} alt={championName} />
                            {option.toString()}
                        </Box>
                    )}
                    renderInput={(params) => (
                        <TextField {...params} variant="standard" label="Role" />
                    )}
                    disabled={disabled}
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