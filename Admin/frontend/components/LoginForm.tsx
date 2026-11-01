"use client";

import { useActionState } from "react";
import { signIn } from "@/Admin/backend/actions/auth-actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, undefined);

  return (
    <form action={formAction} className="admin-login-form">
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required autoComplete="username" />

      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" required autoComplete="current-password" />

      {state?.error && <p className="admin-login-error">{state.error}</p>}

      <button type="submit" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
