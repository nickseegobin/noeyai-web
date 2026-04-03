import { getSiteSettings } from '@/lib/wp';
import ProfileSelectClient from '@/components/ui/ProfileSelectClient';

export default async function ProfileSelectPage() {
  const site = await getSiteSettings();
  return <ProfileSelectClient site={site} />;
}