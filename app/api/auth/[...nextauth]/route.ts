import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { createUser, getUserByEmail } from "@/lib/db"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account.provider === "google") {
        try {
          // Create or update user in our database
          await createUser({
            uid: user.id,
            email: user.email,
            name: user.name,
            photo_url: user.image,
          })
          return true
        } catch (error) {
          console.error("Error saving user to database:", error)
          // Check if this is a "relation does not exist" error
          if (
            error instanceof Error &&
            error.message.includes("relation") &&
            error.message.includes("does not exist")
          ) {
            // Redirect to setup page
            return "/setup?error=database_not_initialized"
          }
          return true // Still allow sign in even if DB save fails
        }
      }
      return true
    },
    async session({ session, token }: any) {
      // Add user ID to session
      if (session.user) {
        try {
          const dbUser = await getUserByEmail(session.user.email)
          if (dbUser) {
            session.user.id = dbUser.id
            session.user.uid = dbUser.uid
          }
        } catch (error) {
          console.error("Error fetching user data for session:", error)
          // We don't need to handle this error specifically, as it won't break the app
          // The session will just not have the additional user data
        }
      }
      return session
    },
    async jwt({ token, user, account }: any) {
      // Persist the user id to the token
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
