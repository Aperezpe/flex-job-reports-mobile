import { supabaseUrl } from "./supabase";

export const callGemini = async (prompt: string, accessToken: string | undefined): Promise<string> => {
  const response = await fetch( `${supabaseUrl}/functions/v1/call-gemini`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`Supabase Function error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result;
};