import api from "./api";
import type { UserAccount } from "@/types/modules";

export async function getUsers(): Promise<UserAccount[]> {
  const response = await api.get<UserAccount[]>("/users/all");
  return response.data;
}

export async function updateUserStatus(
  id: number,
  status: boolean,
): Promise<UserAccount> {
  const response = await api.patch<UserAccount>(`/users/${id}/status`, {
    status,
  });
  return response.data;
}
