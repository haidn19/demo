import type { DefaultSession } from "next-auth";
import type { Role } from "./auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    roles: Role[];
    user: DefaultSession["user"];
  }

  interface User {
    accessToken: string;
    roles: Role[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    roles?: Role[];
  }
}
