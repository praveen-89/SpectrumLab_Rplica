import type { Metadata } from "next";
import LoginForm from "@/Admin/frontend/components/LoginForm";

export const metadata: Metadata = { title: "Admin Login" };

export default function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <div className="admin-login">
      <h1>Spectrum Lab Admin</h1>
      <LoginForm />
      <AdminLoginNotice searchParams={searchParams} />
    </div>
  );
}

async function AdminLoginNotice({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  if (error === "not-authorized") {
    return <p className="admin-login-error">That account isn&apos;t authorized to access the admin portal.</p>;
  }
  return null;
}
