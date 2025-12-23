import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          // Return the full user object to be used in the JWT callback
          return user;
        } else {
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, user object is available
      if (user) {
        token.id = user.id;
        token.balance = (user as any).balance; // Cast to any to access balance
        token.isAdmin = (user as any).isAdmin || false; // Include isAdmin flag
      } else {
        // On subsequent requests, token exists, fetch updated user data
        if (token.id) {
          const dbUser = await prisma.user.findUnique({ where: { id: token.id } });
          if (dbUser) {
            token.balance = dbUser.balance;
            token.isAdmin = dbUser.isAdmin;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.balance = token.balance;
        session.user.isAdmin = token.isAdmin || false; // Include isAdmin in session
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

