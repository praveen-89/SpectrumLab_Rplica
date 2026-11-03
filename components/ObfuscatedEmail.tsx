"use client";

import { useSyncExternalStore, type ReactNode, type MouseEvent } from "react";
import { deobfuscateEmail } from "@/lib/security/obfuscate";

interface ObfuscatedEmailProps {
  /** The Base64-obfuscated email address */
  encoded: string;
  className?: string;
  title?: string;
  ariaLabel?: string;
  showText?: boolean;
  children?: ReactNode;
}

const emptySubscribe = () => () => {};

export default function ObfuscatedEmail({
  encoded,
  className,
  title = "Email",
  ariaLabel = "Email",
  showText = false,
  children,
}: ObfuscatedEmailProps) {
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const email = isHydrated ? deobfuscateEmail(encoded) : null;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = email || deobfuscateEmail(encoded);
    if (target) {
      window.location.href = `mailto:${target}`;
    }
    e.preventDefault();
  };

  return (
    <a
      href={email ? `mailto:${email}` : "#"}
      onClick={handleClick}
      title={title}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
      {showText && <span>{email || "..."}</span>}
    </a>
  );
}
