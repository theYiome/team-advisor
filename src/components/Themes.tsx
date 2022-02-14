import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
    palette: {
        mode: 'light',
    },
    shape: {
        borderRadius: 14,
    }
});

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#195ad2',
        },
        secondary: {
            main: '#000',
        },
        background: {
            default: '#000000',
            paper: '#020202',
        },
        text: {
            primary: '#F3F3F3',
        },
    },
    shape: {
        borderRadius: 14,
    }
});