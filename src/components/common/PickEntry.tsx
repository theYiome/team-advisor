import { Avatar, Divider, Stack, Typography, Autocomplete, Box, TextField } from '@mui/material';
import React, { FC, ReactElement } from 'react';

import { avatarURI, roleImages } from '../../componentLibs/leagueImages';
import { SingleChampionPicker, SingleRolePicker } from './ChampionRolePicker';


type PickEntryProp = {
    championName: string,
    roleName: string,
    patch: string,
    champions?: string[],
    roles?: string[],
    disabled?: boolean,
    isPlayer?: boolean,
    onChange?: any
};


const PickEntry: FC<PickEntryProp> = ({
    championName,
    roleName,
    patch,
    champions = ["Aatrox", "Annie", "Ahri"],
    roles = ["top", "jungle", "middle", "bottom", "support"],
    disabled = false,
    isPlayer = false,
    onChange = (newChamionName: string, newRoleName: string) => console.log(newChamionName, newRoleName)
}: PickEntryProp): ReactElement => {

    const style = { boxShadow: 1, p: 2, backgroundImage: "linear-gradient(to left, #FFF, #FFF, #e6f0ff)" };
    if(isPlayer) 
        style.backgroundImage = "linear-gradient(to left, #FFF, #FFF, #fff4e5)";

    const avatarSize = 39;
    const avatarStyle = { width: avatarSize, height: avatarSize, boxShadow: 5, backgroundColor: "white" };

    return (
        <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2} sx={style}>
            <Stack spacing={2}>
                <Avatar alt={championName} src={championName ? avatarURI(patch, championName) : ""} sx={avatarStyle} />
                <Avatar alt={roleName} src={roleImages[roleName]} sx={avatarStyle} variant="rounded" />
            </Stack>

            <Stack spacing={1} sx={{ width: 1 }}>
                <Stack spacing={2}>
                    <SingleChampionPicker
                        championNames={champions}
                        currentChampion={championName}
                        patch={patch}
                        label="Champion"
                        onChange={(newChampion: string | null) => onChange(newChampion, roleName)}
                        disabled={disabled}
                        special={championName ? true : false}
                    />

                    <SingleRolePicker
                        currentRole={roleName}
                        roleNames={roles}
                        label="Role"
                        onChange={(newRole: string | null) => onChange(championName, newRole)}
                        disabled={disabled}
                        special={roleName ? true : false}
                    />
                </Stack>

                <Divider orientation="horizontal" flexItem />

                <Stack spacing={1}>
                    <Typography>Suggestions from your champions</Typography>
                    <Divider orientation="horizontal" flexItem />
                    <Typography>Suggestions from all champions</Typography>
                </Stack>
            </Stack>
        </Stack>
    );
}

export { PickEntry, PickEntryProp };