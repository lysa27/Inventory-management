import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Your authentication logic, like checking against a database
        const user = await yourAuthenticationMethod(credentials); // Replace with actual DB check logic
        if (user) {
          return user; // Return user object if authentication succeeds
        }
        return null; // Return null if authentication fails
      },
    }),
  ],
  session: {
    strategy: "jwt", // JWT session strategy (can be "database" or "jwt")
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Add user id to JWT
        token.role = user.role; // Add role to JWT if needed
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id; // Attach user id to session
        session.user.role = token.role; // Attach user role to session
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
function yourAuthenticationMethod(credentials: Record<"username" | "password", string> | undefined) {
    throw new Error("Function not implemented.");
}

