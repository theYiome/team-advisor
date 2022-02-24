import { Avatar, Divider, Stack, Typography, Autocomplete, Box, TextField, Paper } from '@mui/material';
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

    const boxShadow = isPlayer ? "0 6px 12px rgba(255, 215, 0, 0.25), 0 6px 12px rgba(255, 215, 0, 0.30)" : "0 10px 20px rgba(8, 60, 158, 0.25), 0 8px 12px rgba(8, 60, 158, 0.30)";
    const style = { p: 2, boxShadow };

    const avatarSize = 39;
    const avatarStyle = { width: avatarSize, height: avatarSize, boxShadow: 5 };

    const championRoleAvatars = (
        <Stack spacing={2}>
            <Avatar alt={championName} src={championName ? avatarURI(patch, championName) : ""} sx={avatarStyle} variant='square'/>
            <Avatar alt={roleName} src={roleImages[roleName]} sx={avatarStyle} variant="square" />
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
        </Stack>
    );

    const firstElement = reverse ? inputOutput : championRoleAvatars;
    const secondElement = reverse ? championRoleAvatars : inputOutput;

    return (
        <Paper elevation={6}>
            <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2} sx={style}>
                {firstElement}
                {secondElement}
            </Stack>
        </Paper>
    );
}

export { PickEntry, PickEntryProp };