import { SearchIcon } from "./icons";

// The original renders two of these as separate nav items (one visible
// only at >=lg, one only below it) rather than one responsive button —
// matched here with the same id/markup split, both calling the same
// onClick to open the one shared dialog.
export default function SearchTrigger({
  onClick,
  mobile = false,
}: {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <button id="mobile-search-toggle" type="button" className="nav-search-btn" title="Search" onClick={onClick}>
        <span className="nav-link">
          <SearchIcon size={17} />
        </span>
      </button>
    );
  }

  return (
    <button
      id="search-toggle"
      type="button"
      className="nav-search-btn"
      title="Search"
      aria-label="Search"
      onClick={onClick}
    >
      <SearchIcon size={17} />
      <kbd className="search-shortcut">Ctrl K</kbd>
    </button>
  );
}
