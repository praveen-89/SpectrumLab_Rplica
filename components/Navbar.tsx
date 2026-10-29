"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Nav, NavDropdown, Offcanvas } from "react-bootstrap";
import ThemeToggle from "./ThemeToggle";
import { isNavDivider, isNavDropdown, navEntries, type NavEntry } from "@/lib/nav";

const withTrailingSlash = (path: string) => (path.endsWith("/") ? path : `${path}/`);

export default function Navbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isActive = (href: string) => withTrailingSlash(pathname) === withTrailingSlash(href);

  const closeDrawer = () => setDrawerOpen(false);

  // Mirrors the original's single scroll listener, which both adds the
  // navbar's scrolled shadow and reveals the footer popup near the bottom
  // of the page (assets/js inline script on the crawled pages).
  useEffect(() => {
    const navbar = document.getElementById("navbar");
    const footer = document.querySelector(".footer-popup");

    function handleScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      navbar?.classList.toggle("navbar-scrolled", scrollTop > 20);

      if (footer) {
        const nearBottom =
          scrollTop + window.innerHeight >= document.documentElement.scrollHeight - 100;
        footer.classList.toggle("footer-visible", nearBottom);
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="site-header">
      <nav
        id="navbar"
        className="navbar navbar-light navbar-expand-lg fixed-top"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container-fluid navbar-container">
          <button
            type="button"
            className="navbar-toggler"
            aria-controls="navbarNavDrawer"
            aria-expanded={drawerOpen}
            aria-label="Toggle navigation"
            onClick={() => setDrawerOpen(true)}
          >
            <span className="visually-hidden">Toggle navigation</span>
            <span className="icon-bar top-bar" />
            <span className="icon-bar middle-bar" />
            <span className="icon-bar bottom-bar" />
          </button>

          <Link className="navbar-brand" href="/" aria-label="Spectrum Lab - Home">
            <span className="spectrum-logo-light">
              <Image
                src="/assets/img/logo/spectrum/SpectrumLogo%20Black-800.webp"
                alt="Spectrum Lab"
                className="navbar-logo"
                width={800}
                height={63}
                priority
              />
            </span>
            <span className="spectrum-logo-dark">
              <Image
                src="/assets/img/logo/spectrum/SpectrumLogo%20White-800.webp"
                alt="Spectrum Lab"
                className="navbar-logo"
                width={800}
                height={63}
                priority
              />
            </span>
          </Link>

          <div className="d-lg-none mobile-nav-actions">
            <ThemeToggle id="mobile-light-toggle" />
          </div>

          <Nav as="ul" id="navbarNav" className="navbar-nav d-none d-lg-flex">
            {navEntries.map((entry) => (
              <NavEntryItem key={entry.label} entry={entry} isActive={isActive} />
            ))}
            <Nav.Item as="li" className="toggle-container">
              <ThemeToggle />
            </Nav.Item>
          </Nav>
        </div>
      </nav>

      <Offcanvas
        show={drawerOpen}
        onHide={() => setDrawerOpen(false)}
        placement="start"
        className="navbar-drawer"
        id="navbarNavDrawer"
      >
        <Offcanvas.Body className="p-0">
          <Nav as="ul" className="navbar-nav flex-column">
            {navEntries.map((entry) => (
              <NavEntryItem
                key={entry.label}
                entry={entry}
                isActive={isActive}
                onNavigate={closeDrawer}
              />
            ))}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
}

function NavEntryItem({
  entry,
  isActive,
  onNavigate,
}: {
  entry: NavEntry;
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
}) {
  if (isNavDropdown(entry)) {
    const active = entry.items.some((item) => !isNavDivider(item) && isActive(item.href));
    return (
      <NavDropdown
        as="li"
        title={entry.label}
        align="end"
        renderMenuOnMount
        className={active ? "active" : undefined}
      >
        {entry.items.map((item, index) =>
          isNavDivider(item) ? (
            <NavDropdown.Divider key={`divider-${index}`} />
          ) : (
            <NavDropdown.Item
              key={item.href}
              as={Link}
              href={item.href}
              className={isActive(item.href) ? "active" : undefined}
              onClick={onNavigate}
            >
              {item.label}
            </NavDropdown.Item>
          ),
        )}
      </NavDropdown>
    );
  }

  const active = isActive(entry.href);
  return (
    <Nav.Item as="li" className={active ? "active" : undefined}>
      <Nav.Link as={Link} href={entry.href} onClick={onNavigate}>
        {entry.label}
        {active && <span className="visually-hidden">(current)</span>}
      </Nav.Link>
    </Nav.Item>
  );
}
