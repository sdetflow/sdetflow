import { getSiteContent } from "@/lib/content";
import SiteShell from "@/components/site-shell";

export default async function HomePage() {
  const content = await getSiteContent();
  return <SiteShell content={content} />;
}
