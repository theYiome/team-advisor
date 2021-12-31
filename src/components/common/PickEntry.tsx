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
    onChange?: any,
    reverse?: boolean
};


const PickEntry: FC<PickEntryProp> = ({
    championName,
    roleName,
    patch,
    champions = ["Aatrox", "Annie", "Ahri"],
    roles = ["top", "jungle", "middle", "bottom", "support"],
    disabled = false,
    isPlayer = false,
    onChange = (newChamionName: string, newRoleName: string) => console.log(newChamionName, newRoleName),
    reverse = false
}: PickEntryProp): ReactElement => {

    const gradientDirection = reverse ? "to right" : "to left";
    const gradientColor = isPlayer ? "#fff4e5" : "#e6f0ff";
    const style = { boxShadow: 1, p: 2, backgroundImage: `linear-gradient(${gradientDirection}, #FFF, #FFF, ${gradientColor})` };

    const avatarSize = 39;
    const avatarStyle = { width: avatarSize, height: avatarSize, boxShadow: 5, backgroundColor: "white" };

    const championRoleAvatars = (
        <Stack spacing={2}>
            <Avatar alt={championName} src={championName ? avatarURI(patch, championName) : ""} sx={avatarStyle} />
            <Avatar alt={roleName} src={roleImages[roleName]} sx={avatarStyle} variant="rounded" />
        </Stack>
    );

    const inputOutput = (
        <Stack spacing={1} sx={{ width: 1 }} className="pick-entry">
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
    );

    const firstElement = reverse ? inputOutput : championRoleAvatars;
    const secondElement = reverse ? championRoleAvatars : inputOutput;

    return (
        <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2} sx={style}>
            {firstElement}
            {secondElement}
        </Stack>
    );
}

export { PickEntry, PickEntryProp };