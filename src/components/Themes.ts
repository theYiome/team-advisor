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
            default: '#010101',
            paper: '#020202',
        },
        text: {
            primary: '#F5F5F5',
            secondary: '#DDD'
        },
    },
    shape: {
        borderRadius: 10,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                contained: {
                    background: 'linear-gradient(45deg, #195ad2 30%, #083c9e 90%)',
                    // boxShadow: '0 1px 2px 2px #083c9e',
                    color: 'white'
                },
            },
        }
    }
});