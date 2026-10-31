"use client";

import { useEffect, useRef, type RefObject, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Command, useCommandState } from "cmdk";
import type { SearchItem, SearchSection } from "@/lib/search";
import { fuzzyMatch } from "@/lib/fuzzy-match";
import { ReturnKeyIcon, ArrowDownIcon, ArrowUpIcon, BackspaceIcon } from "./icons";

// Matches the order sections appear in the original's ninja-keys data
// array: Navigation and Dropdown items are interleaved there by nav
// order, but ninja-keys (like cmdk) groups by section for display either
// way, so this fixed order reproduces the same grouped result.
const SECTION_ORDER: SearchSection[] = [
  "Navigation",
  "Dropdown",
  "Publications",
  "News",
  "People",
  "Articles",
  "Talks",
  "Recognition",
  "Socials",
  "Theme",
];

export default function SearchDialog({
  open,
  onOpenChange,
  restoreFocusRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // The trigger to return focus to on close, captured by the caller at
  // click time — cmdk's own input autofocuses as soon as this component
  // opens, so capturing document.activeElement from an effect in here
  // would just record that input itself, not the real trigger.
  restoreFocusRef: RefObject<HTMLElement | null>;
}) {
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    // autoFocus on Command.Input triggers the browser's default
    // focus-scroll behaviour, which can misjudge the position:fixed
    // dialog as off-screen and scroll the whole page — the original's
    // ninja-keys widget never does this, the page stays put. Focusing
    // manually with preventScroll avoids it.
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (!open) {
          // Whatever had focus when the shortcut was pressed — captured
          // here, synchronously, before cmdk's own input autofocuses and
          // this would otherwise be too late to find out.
          restoreFocusRef.current = document.activeElement as HTMLElement | null;
        }
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange, restoreFocusRef]);

  useEffect(() => {
    if (!open || items) return;
    fetch("/search-index.json")
      .then((response) => response.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, [open, items]);

  function close() {
    onOpenChange(false);
    // Deferred: cmdk/the browser still owns focus during its own
    // close/unmount cleanup on this tick, so an immediate .focus() call
    // here gets silently overridden — restoring on the next tick wins.
    const target = restoreFocusRef.current;
    setTimeout(() => target?.focus(), 0);
  }

  function handleSelect(item: SearchItem) {
    close();
    if (item.themeAction) {
      setTheme(item.themeAction);
      return;
    }
    if (!item.href) return;
    if (item.external || /^(https?:)?\/\//.test(item.href) || item.href.startsWith("mailto:")) {
      window.open(item.href, "_blank");
    } else {
      router.push(item.href);
    }
  }

  const groups = SECTION_ORDER.map((section) => ({
    section,
    items: (items ?? []).filter((item) => item.section === section),
  })).filter((group) => group.items.length > 0);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      label="Search"
      className="search-dialog"
      shouldFilter
      filter={(value, search) => (fuzzyMatch(value, search) ? 1 : 0)}
    >
      <div className="search-dialog-input-wrapper">
        <Command.Input ref={inputRef} placeholder="Type to start searching" />
      </div>
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        {items === null && <Command.Loading>Loading...</Command.Loading>}
        {groups.map(({ section, items: sectionItems }) => (
          <Command.Group key={section} heading={section}>
            {sectionItems.map((item) => (
              <Command.Item key={item.id} value={item.title} onSelect={() => handleSelect(item)}>
                <span className="search-item-title">
                  <HighlightedText text={item.title} />
                </span>
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
      <div className="search-footer">
        <span className="search-footer-hint">
          <ReturnKeyIcon size={14} />
          to select
        </span>
        <span className="search-footer-hint">
          <ArrowDownIcon size={14} />
          <ArrowUpIcon size={14} />
          to navigate
        </span>
        <span className="search-footer-hint">
          <span className="search-footer-key">esc</span>
          to close
        </span>
        <span className="search-footer-hint">
          <BackspaceIcon size={14} />
          move to parent
        </span>
      </div>
    </Command.Dialog>
  );
}

// The original highlights each fuzzy-matched character of the current
// query within a result's title (not a plain substring highlight) —
// reads the live search string from cmdk's own state so it re-renders as
// the user types, same as every other cmdk-aware descendant.
function HighlightedText({ text }: { text: string }) {
  const search = useCommandState((state) => state.search);
  if (!search) return <>{text}</>;

  const indices = fuzzyMatch(text, search);
  if (!indices) return <>{text}</>;

  const matched = new Set(indices);
  return (
    <>
      {[...text].map((char, index) =>
        matched.has(index) ? (
          <span className="search-highlight" key={index}>
            {char}
          </span>
        ) : (
          char
        ),
      )}
    </>
  );
}
