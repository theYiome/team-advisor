import { Alert, AlertTitle } from '@mui/material';

export const noClientMessage = (
    <Alert severity="error">
        <AlertTitle>Failed to load data from lockfile</AlertTitle>
        Either <strong>client is not running</strong> or <strong>given installation path is incorrect</strong>.
        Remember to choose your League instalation directory!
    </Alert>
);

export const errorStateMessage = (error: string) => (
    <Alert severity="error">
        <AlertTitle>An error has occured</AlertTitle>
        <strong>Error message:</strong> {error}
    </Alert>
);