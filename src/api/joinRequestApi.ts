import { supabase } from "../config/supabase";
import { UserStatus } from "../types/Auth/AppUser";
import { JoinRequestSQL } from "../types/JoinRequest";

export const fetchUserJoinRequestApi = async (userId: string) =>
  await supabase
    .from("join_requests")
    .select("*")
    .eq("user_id", userId)
    .single();

export const deleteUserJoinRequestApi = async (userId: string) =>
  await supabase.from("join_requests").delete().eq("user_id", userId);

export const sendJoinCompanyRequestApi = async (
  companyUid: string,
  userId: string,
  userName: string,
) =>
  await supabase
    .from("join_requests")
    .insert<JoinRequestSQL>({
      company_uid: companyUid,
      user_id: userId,
      user_name: userName,
      status: "PENDING",
    })
    .select("*")
    .single();

export const fetchCompanyJoinRequestsApi = async (companyUid: string) =>
  await supabase
    .from("join_requests")
    .select("*")
    .eq("company_uid", companyUid);

export const acceptJoinRequestApi = async (userId?: string) =>
  await supabase
    .from("join_requests")
    .update({ status: UserStatus.ACCEPTED })
    .eq("user_id", userId ?? '')
    .select("*")
    .single();

export const rejectJoinRequestApi = async (userId?: string) =>
  await supabase
    .from("join_requests")
    .delete()
    .eq("user_id", userId ?? '')
    .select("*")
    .single();

