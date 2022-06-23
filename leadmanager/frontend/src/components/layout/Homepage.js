// React 
import React from 'react'

// Componenets 
import Header from './Header';

// MUI styling 
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Container from '@mui/material/Container';

const theme = createTheme();





const Homepage = () => {


    return (

        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">

                <Header />

            </Container>
        </ThemeProvider>

    );
}

export default Homepage
