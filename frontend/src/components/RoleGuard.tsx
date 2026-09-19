"use client";

import type { ReactNode } from "react";
import type { Role } from "@/types/auth";
import { useSession } from "next-auth/react";

export default function RoleGuard({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const { data: session } = useSession();

  if (!session?.roles?.includes(role)) return null;
  return <>{children}</>;
}
