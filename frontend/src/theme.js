// frontend/src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        background: {
            default: '#f5f5f5',
            paper: '#ffffff'
        },
        primary: {
            main: '#1976d2'
        },
        secondary: {
            main: '#388e3c'
        }
    },
    shape: {
        borderRadius: 8
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }
            }
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: '#e3f2fd'
                }
            }
        }
    }
});

export default theme;
