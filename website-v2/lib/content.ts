import { defaultContent } from "./default-content";
import { getSupabase } from "./supabase";
import type { SiteContent } from "./types";

export async function getSiteContent(): Promise<SiteContent> {
  const supabase = getSupabase();
  if (!supabase) return defaultContent;

  const { data, error } = await supabase
    .from("site_content")
    .select("content")
    .eq("id", "main")
    .maybeSingle();

  if (error || !data?.content) return defaultContent;
  return { ...defaultContent, ...(data.content as SiteContent) };
}
