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
    async jwt({ token, account }) {
        // Signing in
        if (account) {
            token.accessToken = account.access_token
        }
        return token
    },

    async session({ session, token, user }) {
        session.accessToken = token.accessToken;
        return session
    }
};

const options = {
    providers,
    callbacks,
    session: { strategy: "jwt" },
    pages: {
        signIn: `/auth/login`,
        error: `/auth/login`
    }
};

export default NextAuth(options)
