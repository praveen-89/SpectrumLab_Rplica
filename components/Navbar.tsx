"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Nav, NavDropdown, Offcanvas } from "react-bootstrap";
import ThemeToggle from "./ThemeToggle";
import SearchTrigger from "./SearchTrigger";
import SearchDialog from "./SearchDialog";
import { isNavDivider, isNavDropdown, navEntries, type NavEntry } from "@/lib/nav";

const withTrailingSlash = (path: string) => (path.endsWith("/") ? path : `${path}/`);

export default function Navbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTriggerRef = useRef<HTMLElement | null>(null);
  const isActive = (href: string) => withTrailingSlash(pathname) === withTrailingSlash(href);

  function openSearch(event: React.MouseEvent<HTMLElement>) {
    searchTriggerRef.current = event.currentTarget;
    setSearchOpen(true);
  }

  const closeDrawer = () => setDrawerOpen(false);

  // The original sets body's top padding to the navbar's own measured
  // height (confirmed by inspecting both live): its two-row desktop
  // layout is taller than the one-row mobile layout, so a single fixed
  // padding-top can't fit both without either a gap on mobile or the
  // content hiding under the navbar on desktop (the bug this fixes).
  // --navbar-height is read by body.fixed-top-nav in globals.css.
  useLayoutEffect(() => {
    const navbarElement = document.getElementById("navbar");
    if (!navbarElement) return;
    const navbar = navbarElement;

    function setHeight() {
      document.documentElement.style.setProperty("--navbar-height", `${navbar.offsetHeight}px`);
    }

    setHeight();
    const observer = new ResizeObserver(setHeight);
    observer.observe(navbar);
    return () => observer.disconnect();
  }, []);

  // Mirrors the original's scroll script exactly: shadow after 20px,
  // hidden (translateY(-100%)) while scrolling down past a 50px/5px
  // threshold, shown again on scroll up, always shown within 50px of the
  // top or 100px of the bottom, and kept visible whenever the drawer is
  // open (so it can't hide itself out from under an open menu). Also
  // reveals the footer popup near the bottom, same as before.
  useEffect(() => {
    const navbar = document.getElementById("navbar");
    const footer = document.querySelector(".footer-popup");
    let lastScrollTop = 0;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    const scrollThreshold = 5;
    const hideThreshold = 50;

    function handleScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollDelta = scrollTop - lastScrollTop;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;

      navbar?.classList.toggle("navbar-scrolled", scrollTop > 20);

      if (footer) {
        const nearBottom = scrollTop + windowHeight >= documentHeight - 100;
        footer.classList.toggle("footer-visible", nearBottom);
      }

      if (scrollTop <= hideThreshold || scrollTop + windowHeight >= documentHeight - 100) {
        navbar?.classList.remove("navbar-hidden");
        lastScrollTop = scrollTop;
        return;
      }

      if (Math.abs(scrollDelta) > scrollThreshold) {
        navbar?.classList.toggle("navbar-hidden", scrollDelta > 0);
      }

      lastScrollTop = scrollTop;
    }

    function throttledScroll() {
      if (scrollTimer) return;
      scrollTimer = setTimeout(() => {
        handleScroll();
        scrollTimer = null;
      }, 16);
    }

    handleScroll();
    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", throttledScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, []);

  useEffect(() => {
    document.getElementById("navbar")?.classList.toggle("navbar-menu-open", drawerOpen);
  }, [drawerOpen]);

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
            onClick={() => setDrawerOpen((open) => !open)}
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
              <NavEntryItem key={entry.label} entry={entry} isActive={isActive} desktop />
            ))}
            <Nav.Item as="li" className="d-none d-lg-block">
              <SearchTrigger onClick={openSearch} />
            </Nav.Item>
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
            <Nav.Item as="li">
              <SearchTrigger
                mobile
                onClick={(event) => {
                  closeDrawer();
                  openSearch(event);
                }}
              />
            </Nav.Item>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} restoreFocusRef={searchTriggerRef} />
    </header>
  );
}

function NavEntryItem({
  entry,
  isActive,
  onNavigate,
  desktop,
}: {
  entry: NavEntry;
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
  desktop?: boolean;
}) {
  if (isNavDropdown(entry)) {
    const active = entry.items.some((item) => !isNavDivider(item) && isActive(item.href));
    return (
      <DesktopHoverDropdown title={entry.label} active={active} desktop={desktop}>
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
      </DesktopHoverDropdown>
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

// Click/tap always opens the menu (react-bootstrap's own Dropdown
// behaviour, needed for touch and keyboard users). On desktop, hovering
// the whole nav item also opens it and leaving closes it again — unlike
// the original, whose matching CSS rule is dead (leaves `display:none`
// untouched), so hovering there visibly does nothing; this is a
// deliberate improvement over that, not a reproduction of it.
function DesktopHoverDropdown({
  title,
  active,
  desktop,
  children,
}: {
  title: string;
  active: boolean;
  desktop?: boolean;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  // The toggle and the menu both sit inside this same <li>, but the menu
  // is absolutely positioned with a margin-top gap (see #navbar
  // .dropdown-menu) — moving the mouse in a straight line from one to the
  // other crosses a sliver of the page that's outside both, briefly
  // "leaving" the li and closing the menu before the cursor arrives. A
  // short close delay (cleared if the mouse re-enters in time) bridges
  // that gap without making the menu stay open noticeably longer.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openNow() {
    clearCloseTimer();
    setShow(true);
  }

  function closeSoon() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setShow(false), 200);
  }

  useEffect(() => clearCloseTimer, []);

  if (!desktop) {
    return (
      <NavDropdown as="li" title={title} align="end" renderMenuOnMount className={active ? "active" : undefined}>
        {children}
      </NavDropdown>
    );
  }

  return (
    <NavDropdown
      as="li"
      title={title}
      align="end"
      renderMenuOnMount
      className={active ? "active" : undefined}
      show={show}
      onToggle={(nextShow) => (nextShow ? openNow() : closeSoon())}
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      {children}
    </NavDropdown>
  );
}
