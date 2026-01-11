'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { GET_ME, LOGIN, LOGOUT } from '@/graphql/operations';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatarUrl: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const client = useApolloClient();

    // Query to get current user
    const { data, loading: queryLoading, refetch } = useQuery(GET_ME, {
        fetchPolicy: 'network-only',
    });

    // Update user when query data changes
    useEffect(() => {
        if (!queryLoading) {
            setUser(data?.me || null);
            setInitialLoading(false);
        }
    }, [data, queryLoading]);

    // Login mutation
    const [loginMutation] = useMutation(LOGIN);

    // Logout mutation
    const [logoutMutation] = useMutation(LOGOUT);

    const login = useCallback(async (email: string, password: string) => {
        const result = await loginMutation({
            variables: { email, password },
        });

        if (result.data?.login?.user) {
            setUser(result.data.login.user);
            // Clear Apollo cache to refetch data with new auth
            await client.resetStore();
        }
    }, [loginMutation, client]);

    const logout = useCallback(async () => {
        await logoutMutation();
        setUser(null);
        // Clear Apollo cache
        await client.resetStore();
    }, [logoutMutation, client]);

    const refetchUser = useCallback(async () => {
        const result = await refetch();
        setUser(result.data?.me || null);
    }, [refetch]);

    const loading = initialLoading || queryLoading;

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
