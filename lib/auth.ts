import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/account",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";

        if (!email || !password) return null;

        type DbUserRow = {
          id: string;
          email: string;
          password_hash: string | null;
        };
        const rows = (await sql`
          select id::text, email, password_hash
          from users
          where email = ${email}
          limit 1
        `) as DbUserRow[];

        const user = rows[0];
        if (!user) return null;
        if (!user.password_hash) return null;

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return null;

        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Credentials login sets user.id already.
      if (user?.id && !account) token.uid = user.id;

      // On OAuth sign-in, map provider identity to our Neon `users` row.
      if (account?.provider === "google") {
        const email =
          (profile as { email?: string } | undefined)?.email?.toLowerCase().trim() ||
          token.email?.toLowerCase().trim();
        const sub = (profile as { sub?: string } | undefined)?.sub;

        if (email && sub) {
          type Row = { id: string };
          const rows = (await sql`
            insert into users (email, name, image, oauth_provider, oauth_sub)
            values (
              ${email},
              ${(profile as { name?: string } | undefined)?.name ?? null},
              ${(profile as { picture?: string } | undefined)?.picture ?? null},
              'google',
              ${sub}
            )
            on conflict (email)
            do update set
              name = coalesce(excluded.name, users.name),
              image = coalesce(excluded.image, users.image),
              oauth_provider = coalesce(users.oauth_provider, excluded.oauth_provider),
              oauth_sub = coalesce(users.oauth_sub, excluded.oauth_sub)
            returning id::text as id
          `) as Row[];

          token.uid = rows[0]?.id;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string | undefined;
      }
      return session;
    },
  },
};

