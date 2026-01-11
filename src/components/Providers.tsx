'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { theme } from '@/theme/theme';
import { AuthProvider } from '@/components/AuthContext';

const client = new ApolloClient({
    uri: '/api/graphql',
    cache: new InMemoryCache(),
    credentials: 'same-origin', // Include cookies in requests
});

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ApolloProvider client={client}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AuthProvider>{children}</AuthProvider>
            </ThemeProvider>
        </ApolloProvider>
    );
}
