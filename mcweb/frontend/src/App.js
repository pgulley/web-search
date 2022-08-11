// React
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux'
import { SnackbarProvider } from 'notistack';

// Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// MUI Styling
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';

// user status
import Account from './features/auth/Account'
import SignIn from './features/auth/SignIn'
import SignUp from './features/auth/SignUp';
import ResetPassword from './features/auth/ResetPassword'
import ConfirmedReset from './features/auth/ConfirmedReset'

// Componenets
import Homepage from './Homepage';

// pages
import Collections from './features/collections/Collections';
import Search from './features/search/Search'
import Sources from './features/sources/Sources';

import { selectIsLoggedIn } from './features/auth/authSlice';
import { useSelector } from 'react-redux';
import { useLocation, Navigate } from 'react-router-dom';

const theme = createTheme();
// Store
import { getStore } from './app/store';


const App = () => (
  <Provider store={getStore()}>
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3} autoHideDuration={1500}>
        <Box sx={{ bgcolor: '#B0DFEB', width: '100%', height: '100vh' }}>
          <Homepage />
        </Box>
      </SnackbarProvider>
    </ThemeProvider>
  </Provider >
);

export const renderApp = () => {
  createRoot(document.getElementById('app')).
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>

            <Route path="collections" element={
              <RequireAuth>
                <Collections />
              </RequireAuth>}
            />

            <Route path="search" element={
              <RequireAuth>
                <Search />
              </RequireAuth>} />

            <Route path="sources" element={
              <RequireAuth>
                <Sources />
              </RequireAuth>} />

            <Route path="sign-in" element={<SignIn />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="reset-password/confirmed" element={<ConfirmedReset />} />

            <Route path="sign-up" element={<SignUp />} />
            <Route path="account" element={
              <RequireAuth>
                <Account />
              </RequireAuth>} />
          </Route>
        </Routes>
      </BrowserRouter >
    );
};

function RequireAuth({ children }) {
  const auth = useSelector(selectIsLoggedIn);
  const location = useLocation();

  if (!auth) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }
  return children;
}


