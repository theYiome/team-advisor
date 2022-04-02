import React, { useContext } from 'react';
import { Stack, Container, Typography, IconButton } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import { ChampionsContext } from '../Champions/ChampionProvider';
import { FavouritesActionType, FavouritesContext, MAX_FAVOURITES } from './FavouritesProvider';
import { SettingsActionType, SettingsContext } from '../Settings/SettingsProvider';
import { MultipleChampionPicker } from '../common/ChampionRolePicker';
import { defaultChampionsForRole } from '../Settings/SettingsConstants'

export const FavouriteChampions: React.FC = () => {
    const { championNameToId, patch } = useContext(ChampionsContext);
    const { settings, settingsDispatch } = useContext(SettingsContext);
    const { favourites, favouritesDispatch} = useContext(FavouritesContext);

    const championNames: string[] = Object.keys(championNameToId);

    return (
        <Container>
            <Stack spacing={3}>
                <Stack spacing={2}>
                    <Typography variant='h6'>
                        Ban list
                    </Typography>
                    <MultipleChampionPicker
                        championNames={championNames}
                        currentList={settings.prefferedBans}
                        patch={patch}
                        onChange={(newBanList) => settingsDispatch({type: SettingsActionType.SetPrefferedBans, payload: newBanList})}
                        label="Ban list"
                        variant="outlined"
                    />

                    <Typography variant='h6'>
                        Favourite champions
                    </Typography>
                    <Typography>
                        Consider including some niche champions from your champion pool as this will guarantee their appearance in predictions.
                        Limited to {MAX_FAVOURITES} champions per role.
                    </Typography>

                    <Stack direction="row">
                        <IconButton
                            aria-label="Reset top to defaults"
                            onClick={() => favouritesDispatch({type: FavouritesActionType.SetFavouritesTop, payload: defaultChampionsForRole.top})}
                        >
                            <RestartAltIcon />
                        </IconButton>

                        <MultipleChampionPicker
                            championNames={championNames}
                            currentList={favourites.top}
                            patch={patch}
                            onChange={(newList) => favouritesDispatch({type: FavouritesActionType.SetFavouritesTop, payload: newList})}
                            label="Top"
                        />
                    </Stack>

                    <Stack direction="row">
                        <IconButton
                            aria-label="Reset jungle to defaults"
                            onClick={() => favouritesDispatch({type: FavouritesActionType.SetFavouritesJungle, payload: defaultChampionsForRole.jungle})}
                        >
                            <RestartAltIcon />
                        </IconButton>

                        <MultipleChampionPicker
                            championNames={championNames}
                            currentList={favourites.jungle}
                            patch={patch}
                            onChange={(newList) => {
                                console.log({newList});
                                favouritesDispatch({type: FavouritesActionType.SetFavouritesJungle, payload: newList})
                            }}
                            label="Jungle"
                        />
                    </Stack>

                    <Stack direction="row">
                        <IconButton
                            aria-label="Reset middle to defaults"
                            onClick={() => favouritesDispatch({type: FavouritesActionType.SetFavouritesMiddle, payload: defaultChampionsForRole.middle})}
                        >
                            <RestartAltIcon />
                        </IconButton>

                        <MultipleChampionPicker
                            championNames={championNames}
                            currentList={favourites.middle}
                            patch={patch}
                            onChange={(newList) => favouritesDispatch({type: FavouritesActionType.SetFavouritesMiddle, payload: newList})}
                            label="Middle"
                        />
                    </Stack>

                    <Stack direction="row">
                        <IconButton
                            aria-label="Reset bottom to defaults"
                            onClick={() => favouritesDispatch({type: FavouritesActionType.SetFavouritesBottom, payload: defaultChampionsForRole.bottom})}>
                            <RestartAltIcon />
                        </IconButton>

                        <MultipleChampionPicker
                            championNames={championNames}
                            currentList={favourites.bottom}
                            patch={patch}
                            onChange={(newList) => favouritesDispatch({type: FavouritesActionType.SetFavouritesBottom, payload: newList})}
                            label="Bottom"
                        />
                    </Stack>

                    <Stack direction="row">
                        <IconButton
                            aria-label="Reset support to defaults"
                            onClick={() => favouritesDispatch({type: FavouritesActionType.SetFavouritesSupport, payload: defaultChampionsForRole.support})}>
                            <RestartAltIcon />
                        </IconButton>

                        <MultipleChampionPicker
                            championNames={championNames}
                            currentList={favourites.support}
                            patch={patch}
                            onChange={(newList) => favouritesDispatch({type: FavouritesActionType.SetFavouritesSupport, payload: newList})}
                            label="Support"
                        />
                    </Stack>
                </Stack>
            </Stack>
        </Container>
    );
}

