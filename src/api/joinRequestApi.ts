import { supabase, supabaseUrl } from "../config/supabase";
import { UserStatus } from "../types/Auth/AppUser";
import { JoinRequestSQL } from "../types/JoinRequest";

export const fetchUserJoinRequestApi = async (userId: string) =>
  await supabase
    .from("join_requests")
    .select("*")
    .eq("user_id", userId)
    .single();

export const deleteUserJoinRequestApi = async ({
  token,
  userId,
}: {
  token: string;
  userId: string;
}) =>
  await fetch(`${supabaseUrl}/functions/v1/cancel-technician-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), // optional
    },
    body: JSON.stringify({ userId }),
  });

export const sendJoinCompanyRequestApi = async (
  companyUid: string,
  userId: string,
  userName: string
) =>
  await supabase.rpc("submit_join_request", {
    p_company_uid: companyUid,
    p_user_id: userId,
    p_user_name: userName,
  });

export const fetchCompanyJoinRequestsApi = async (companyUid: string) =>
  await supabase
    .from("join_requests")
    .select("*")
    .eq("company_uid", companyUid);

export const acceptJoinRequestApi = async ({
  token,
  technicianId,
  companyId
}: {
  token: string;
  technicianId: string;
  companyId: string;
}) =>
  await fetch(`${supabaseUrl}/functions/v1/accept-technician-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), // optional
    },
    body: JSON.stringify({ technicianId, companyId }),
  });

export const rejectJoinRequestApi = async (userId?: string) =>
  await supabase
    .from("join_requests")
    .delete()
    .eq("user_id", userId ?? "")
    .select("*")
    .single();
