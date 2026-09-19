"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useSession();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (status === "unauthenticated") {
        router.replace("/login");
        return;
      }

      if (status !== "authenticated") return;

      // Nhường một nhịp trước khi cập nhật state để effect không chặn giao diện.
      await Promise.resolve();
      setAllowed(true);
    };

    void checkAuthentication();
  }, [router, status]);

  if (!allowed) return <p className="center">Checking login...</p>;

  return <>{children}</>;
}
