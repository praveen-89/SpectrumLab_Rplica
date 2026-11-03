import type { Metadata } from "next";
import LoginForm from "@/Admin/frontend/components/LoginForm";

export const metadata: Metadata = { title: "Admin Login" };

export default function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <div className="admin-login-page">
      {/* Decorative animated orbs */}
      <div className="admin-login-orb admin-login-orb--1" aria-hidden="true" />
      <div className="admin-login-orb admin-login-orb--2" aria-hidden="true" />
      <div className="admin-login-orb admin-login-orb--3" aria-hidden="true" />

      <div className="admin-login-card">
        {/* ── Left branding panel ── */}
        <div className="admin-login-brand" aria-hidden="true">
          <div className="admin-login-brand__inner">
            <div className="admin-login-brand__ring" />
            <div className="admin-login-brand__logo-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/img/funders/IISc_Master_Seal_Transparent-800.webp"
                alt="IISc seal"
                className="admin-login-brand__logo"
              />
            </div>
            <p className="admin-login-brand__name">Spectrum Lab</p>
            <p className="admin-login-brand__sub">Indian Institute of Science</p>
          </div>
          <div className="admin-login-brand__dots" />
        </div>

        {/* ── Right form panel ── */}
        <div className="admin-login-form-panel">
          <div className="admin-login-form-header">
            <span className="admin-login-badge">Admin Portal</span>
            <h1 className="admin-login-title">Welcome back</h1>
            <p className="admin-login-subtitle">Sign in to manage lab content</p>
          </div>

          <LoginForm />
          <AdminLoginNotice searchParams={searchParams} />

          <p className="admin-login-footer-note">
            Restricted access · Spectrum Lab &copy; {new Date().getFullYear()}
          </p>
        </div>
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
