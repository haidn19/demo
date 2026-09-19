import NextAuth from "next-auth";
import { authOptions } from "@/auth";

// Tạo handler NextAuth và xuất cho cả GET (đọc session) và POST (đăng nhập).
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
