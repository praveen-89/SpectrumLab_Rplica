import { requireAdmin } from "@/Admin/backend/auth/require-admin";
import { signOut } from "@/Admin/backend/actions/auth-actions";
import AdminShell from "@/Admin/frontend/components/AdminShell";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const { email } = await requireAdmin();

  return (
    <AdminShell email={email} signOutAction={signOut}>
      {children}
    </AdminShell>
  );
}
