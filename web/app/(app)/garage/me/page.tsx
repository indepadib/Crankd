import { redirect } from 'next/navigation';

// The canonical garage contains real maintenance records and vehicle details.
// Keep old bookmarks working without maintaining a second, misleading garage UI.
export default function LegacyGaragePage() {
  redirect('/garage');
}
