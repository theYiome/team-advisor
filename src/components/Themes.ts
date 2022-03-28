import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
    palette: {
        mode: 'light',
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                containedPrimary: {
                    background: 'linear-gradient(45deg, #195ad2 30%, #083c9e 90%)',
                    color: 'white'
                },
            },
        }
    }
});

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#195ad2',
        },
        secondary: {
            main: '#000',
        },
        background: {
            default: '#040404',
            paper: '#070707',
        },
        text: {
            primary: '#FFF',
            secondary: '#FFF'
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                containedPrimary: {
                    background: 'linear-gradient(45deg, #195ad2 30%, #083c9e 90%)',
                    color: 'white'
                },
            },
        }
    },
    typography: {
        allVariants: {
            color: "#EEE"
        }
    }
});

const themesMap = {
    "dark": darkTheme,
    "light": lightTheme
};

type AppTheme = keyof typeof themesMap;

export { themesMap, AppTheme };