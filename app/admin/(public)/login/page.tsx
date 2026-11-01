import type { Metadata } from "next";
import LoginForm from "@/Admin/frontend/components/LoginForm";

export const metadata: Metadata = { title: "Admin Login" };

export default function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <div className="admin-login-page">
      <div className="admin-login">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/img/funders/IISc_Master_Seal_Transparent-800.webp" alt="" className="admin-login-logo" />
        <h1>Admin Portal</h1>
        <LoginForm />
        <AdminLoginNotice searchParams={searchParams} />
      </div>
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
