import { requireAdmin } from "@/Admin/backend/auth/require-admin";
import { signOut } from "@/Admin/backend/actions/auth-actions";
import AdminSidebar from "@/Admin/frontend/components/AdminSidebar";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const { email } = await requireAdmin();

  return (
    <div className="admin-app">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <span className="admin-topbar-user">{email}</span>
          <form action={signOut}>
            <button type="submit" className="admin-signout-button">
              Sign out
            </button>
          </form>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
