import React, { ReactElement, useContext } from 'react';

import Container from '@mui/material/Container'
import { Button, Typography, Stack, Paper, ButtonGroup, Divider, Chip } from '@mui/material';
import { LcuContext, LcuCredentials } from './LcuProvider';
import { rawLcuRequest } from '../../libs/lcuRequest';

export const ClientUtilities: React.FC = (): ReactElement => {

    const lcuState = useContext(LcuContext);
    return (
        <Container>
            <Stack spacing={3}>
                <Typography variant='h6'>Utilities</Typography>

                <Divider>
                    <Chip label="League Client UX"/>
                </Divider>

                <Typography>
                    Sometimes client may bug while using this app (annoying sounds or visual glitches).
                    If that happens you can restart client UX (visual part of League Client).
                    It will take around 10 seconds and <strong>it will not kick you out</strong> of lobby, game search or champion select.
                    Features like auto accept or auto ban will still work when client UX is offline.
                </Typography>

                <ButtonGroup sx={{ width: 1 }} variant="contained" aria-label="outlined primary button group">
                    <Button sx={{ width: 1 }} color="primary" onClick={() => restartClientUX(lcuState.credentials)}>RESTART CLIENT UX</Button>
                </ButtonGroup>
            </Stack>
        </Container>
    );
}

function restartClientUX(lockfileContent: LcuCredentials): void {
    const endpointName = "riotclient/kill-and-restart-ux";
    rawLcuRequest(lockfileContent, endpointName, { method: 'POST' }).catch(error => console.warn(error));
}