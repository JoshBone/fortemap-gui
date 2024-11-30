import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios'

const providers = [
    CredentialsProvider({
        name: 'Credentials',
        authorize: async (credentials) => {
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_FORTEPAN_API}/auth/token/login/`, {
                    username: credentials.username,
                    password: credentials.password,
                    headers: {
                        accept: '*/*',
                        'Content-Type': 'application/json'
                    }
                });
                return {
                    accessToken: response.data.auth_token,
                }
            } catch (error) {
                if (error.hasOwnProperty('errno')) {
                    throw new Error('serverProblem');
                } else {
                    throw new Error('badCredentials');
                }
            }
        }
    })
];

const callbacks = {
    async jwt({ token, user }) {
        // Signing in
        if (user) {
            token.accessToken = user.accessToken
        }
        return token
    },

    async session({ session, token, user }) {
        const url = `${process.env.NEXT_PUBLIC_FORTEPAN_API}/auth/users/me/`

        try {
            const response = await axios.get(url, {
                headers: {
                    accept: '*/*',
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token.accessToken}`
                }
            });
            session.username = response.data.username;
        } catch (error) {
            console.log(error)
        }

        session.accessToken = token.accessToken;
        return session
    }
};

const isProd = process.env.NODE_ENV === 'production'

const options = {
    providers,
    callbacks,
    session: { strategy: "jwt" },
    pages: {
        signIn: isProd ? `/auth/login` : '/auth/login',
        error: isProd ? `/auth/login` : '/auth/login',
    },
    secret: process.env.NEXT_PUBLIC_SECRET
};

export default NextAuth(options)
