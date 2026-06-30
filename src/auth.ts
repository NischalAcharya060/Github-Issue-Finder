import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"



export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      // `profile` is only present on initial sign-in
      if (profile?.login) {
        token.githubLogin = profile.login as string
        // Persist the GitHub username on the user record
        if (token.sub) {
          await prisma.user
            .update({
              where: { id: token.sub },
              data: { githubLogin: profile.login as string },
            })
            .catch(() => {})
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      if (token.githubLogin)
        session.user.githubLogin = token.githubLogin as string
      return session
    },
  },
})
