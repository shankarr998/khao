'use client';

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { ThemeContextProvider } from '@/components/ThemeContext';
import { AuthProvider } from '@/components/AuthContext';

const client = new ApolloClient({
    uri: '/api/graphql',
    cache: new InMemoryCache(),
    credentials: 'same-origin', // Include cookies in requests
});

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ApolloProvider client={client}>
            <ThemeContextProvider>
                <AuthProvider>{children}</AuthProvider>
            </ThemeContextProvider>
        </ApolloProvider>
    );
}
