import React, { FC } from 'react';
import { TextField, Autocomplete, Box } from '@mui/material';
import { avatarURI, roleImages } from '../../componentLibs/leagueImages';


// Multiple
type MultipleChampionPickerProp = {
    championNames: string[],
    currentList: string[],
    patch: string,
    label?: string,
    onChange?: (newList: string[]) => void,
    disabled?: boolean,
    special?: boolean
};

const MultipleChampionPicker: FC<MultipleChampionPickerProp> = ({
    championNames,
    currentList,
    patch,
    label = "Multiple champion picker",
    onChange = (newList: string[]) => console.log(newList),
    disabled = false,
    special = false
}) => (
    <Autocomplete
        multiple
        options={championNames}
        value={currentList}
        onChange={(event: any, newList: string[]) => onChange(newList)}
        renderOption={(props, option) => (
            <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                <img loading="lazy" width="20" src={avatarURI(patch, option)} alt={option} />
                {option.toString()}
            </Box>
        )}
        renderInput={
            (params) => <TextField
                {...params}
                variant="standard"
                label={label}
                color={special ? "primary" : "info"}
            />
        }
        disabled={disabled}
    />
);

// Single
type SingleChampionPickerProp = {
    championNames: string[],
    currentChampion: string,
    patch: string,
    label?: string,
    onChange?: (newChampion: string | null) => void,
    disabled?: boolean,
    special?: boolean
    focused?: boolean
};

const SingleChampionPicker: FC<SingleChampionPickerProp> = ({
    championNames,
    currentChampion,
    patch,
    label = "Single champion picker",
    onChange = (newChampion: string | null) => console.log(newChampion),
    disabled = false,
    special = false,
    focused = true
}) => (
    <Autocomplete
        options={championNames}
        value={currentChampion}
        onChange={(event: any, newChampion: string | null) => onChange(newChampion)}
        renderOption={(props, option) => (
            <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                <img loading="lazy" width="20" src={avatarURI(patch, option)} alt={option} />
                {option.toString()}
            </Box>
        )}
        renderInput={
            (params) => <TextField
                {...params}
                variant="outlined"
                label={label}
                color={special ? "success" : "primary"}
                size="small"
                focused={focused}
            />
        }
        disabled={disabled}
    />
);

// Role
type SingleRolePickerProp = {
    currentRole: string,
    roleNames?: string[],
    label?: string,
    onChange?: (newRole: string | null) => void,
    disabled?: boolean,
    special?: boolean,
    focused?: boolean
};

const SingleRolePicker: FC<SingleRolePickerProp> = ({
    currentRole,
    roleNames = ["top", "jungle", "middle", "bottom", "support"],
    label = "Single role picker",
    onChange = (newRole: string | null) => console.log(newRole),
    disabled = false,
    special = false,
    focused = true
}) => (
    <Autocomplete
        options={roleNames}
        value={currentRole}
        onChange={(event: any, newRole: string | null) => onChange(newRole)}
        renderOption={(props, option) => (
            <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                <img loading="lazy" width="20" src={roleImages[option]} alt={option} />
                {option.toString()}
            </Box>
        )}
        renderInput={
            (params) => <TextField
                {...params}
                variant="outlined"
                label={label}
                color={special ? "success" : "primary"}
                size="small"
                focused={focused}
            />
        }
        disabled={disabled}
    />
);

export {
    MultipleChampionPicker, MultipleChampionPickerProp,
    SingleChampionPicker, SingleChampionPickerProp,
    SingleRolePicker, SingleRolePickerProp
};