import { Alert, AlertTitle, Button } from '@mui/material';

export const unknownMessage = (
    <Alert severity="info">
        <AlertTitle>Inactive</AlertTitle>
        You can <strong>enable</strong> this module with slider above.
    </Alert>
);

export const noInChampionSelectMessage = (
    <Alert severity="warning">
        <AlertTitle>Not in champion select</AlertTitle>
        We will start when game is found.
    </Alert>
);

export const inChampionSelectMessage = (
    <Alert severity="info">
        <AlertTitle>In champion select</AlertTitle>
        No action required right now.
    </Alert>
);

export const planningMessage = (
    <Alert severity="success">
        <AlertTitle>Planning phase</AlertTitle>
        It is time to show your allies what you want to pick.
    </Alert>
);

export const banningMessage = (
    <Alert severity="success">
        <AlertTitle>You are banning</AlertTitle>
        Now it is time to ban something ugly.
    </Alert>
);

export const pickingMessage = (
    <Alert severity="success">
        <AlertTitle>You are picking</AlertTitle>
        Now it is time to pick your champion.
    </Alert>
);

export const pickedMessage = (
    <Alert severity="info">
        <AlertTitle>No more actions</AlertTitle>
        You have picked your champion, nothing more to do. Good luck!
    </Alert>
);

export const appInControl = (
    <Alert severity="info">
        <AlertTitle>App is in control</AlertTitle>
        App will act in appropriate phases.
    </Alert>
);

export const userInControl = (controlSetter: React.Dispatch<React.SetStateAction<boolean>>) => (
    <Alert severity="success">
        <AlertTitle>You are in control</AlertTitle>
        You hovered something and took control from the app <strong>in this phase</strong>.
        <br/>
        <br/>
        <Button onClick={() => controlSetter(false)} variant="contained" color="error">
            GIVE UP CONTROL
        </Button>
    </Alert>
);