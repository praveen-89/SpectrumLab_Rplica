type IconProps = {
  size?: number;
  className?: string;
};

function Svg({
  size = 20,
  className,
  viewBox = "0 0 24 24",
  children,
}: IconProps & { viewBox?: string; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

// Real academicons "google-scholar" glyph (U+E9D4), extracted from
// public/assets/fonts/academicons.ttf with fontTools, Y-flipped from font
// units (em square 512, baseline-up) into SVG space via the matrix below —
// the same transform Font Awesome's own SVG exports use.
export function GoogleScholarIcon(props: IconProps) {
  return (
    <Svg {...props} viewBox="0 0 384 512">
      <path
        transform="matrix(1,0,0,-1,0,512)"
        d="M344 341Q350 340 350 331V202Q350 199 348.5 196.5Q347 194 344.5 192.5Q342 191 339 191H335Q333 191 330.5 192.5Q328 194 326.5 196.5Q325 199 325 202V331Q325 341 331 341V358L274 312Q275 311 275 310Q276 309 276 309Q284 295 284 275Q284 260 278.5 247.5Q273 235 266.0 227.5Q259 220 251.5 213.5Q244 207 238.5 200.0Q233 193 233.0 186.0Q233 179 240.0 171.5Q247 164 257 156Q266 149 276 140Q286 132 292.5 118.0Q299 104 299 88Q299 66 288.0 48.5Q277 31 259.0 20.5Q241 10 221.0 5.0Q201 0 181 0Q168 0 155.0 2.0Q142 4 129.0 9.0Q116 14 106.0 21.5Q96 29 89.5 40.5Q83 52 83 67Q83 84 92.5 98.5Q102 113 118 123Q146 140 204 144Q191 161 191 176Q191 184 195 194Q188 193 181 193Q149 193 127.5 213.5Q106 234 106 266Q106 269 106 272H20L150 384H364L344 369ZM220 131Q216 132 210 132Q195 132 181.0 129.0Q167 126 153.5 120.5Q140 115 131.5 103.5Q123 92 123 76Q123 62 130.5 50.5Q138 39 150.0 32.5Q162 26 175 23Q189 19 202 19Q230 19 249.5 31.5Q269 44 269 70Q269 75 267.5 80.0Q266 85 264.5 89.0Q263 93 259 98Q255 102 252 105Q250 108 244.0 113.0Q238 118 236.5 119.0Q235 120 228.0 125.0Q221 130 220 131ZM244 253Q244 270 238.0 289.0Q232 308 218.5 323.0Q205 338 187 338Q167 338 156.5 323.5Q146 309 146 289Q146 271 151.5 253.0Q157 235 170.5 220.5Q184 206 202 206Q222 206 233.0 219.5Q244 233 244 253Z"
      />
    </Svg>
  );
}

export function EmailIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1.4 2L12 12.5 19.6 7H4.4zM20 8.4l-7.4 5.4a1 1 0 0 1-1.2 0L4 8.4V17h16V8.4z" />
    </Svg>
  );
}

export function FileIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 1.5V8h4.5L13 3.5zM7 11h10v1.5H7V11zm0 3.5h10V16H7v-1.5zm0 3.5h7V19H7v-1z" />
    </Svg>
  );
}

export function GitHubIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.9 0-1.3.5-2.4 1.3-3.2-.1-.3-.6-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.9.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.7 5.6-5.3 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
    </Svg>
  );
}

export function TwitterIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M23.6 4.9c-.8.4-1.7.7-2.6.8a4.5 4.5 0 0 0 2-2.5c-.9.5-1.8.9-2.9 1.1a4.5 4.5 0 0 0-7.6 4.1A12.8 12.8 0 0 1 3 2.9a4.5 4.5 0 0 0 1.4 6 4.5 4.5 0 0 1-2-.6 4.5 4.5 0 0 0 3.6 4.5 4.5 4.5 0 0 1-2 .1 4.5 4.5 0 0 0 4.2 3.1A9.1 9.1 0 0 1 1 18a12.8 12.8 0 0 0 6.9 2c8.3 0 12.8-6.9 12.8-12.9v-.6c.9-.6 1.6-1.4 2-2.3z" />
    </Svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 18a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zM3 11H1a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2zm20 0h-2a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2zM4.2 4.2a1 1 0 0 1 1.4 0l1.4 1.4A1 1 0 1 1 5.6 7L4.2 5.6a1 1 0 0 1 0-1.4zm14.2 14.2a1 1 0 0 1 1.4 0l1.4 1.4a1 1 0 1 1-1.4 1.4l-1.4-1.4a1 1 0 0 1 0-1.4zM19.8 4.2a1 1 0 0 1 0 1.4L18.4 7a1 1 0 1 1-1.4-1.4l1.4-1.4a1 1 0 0 1 1.4 0zM5.6 18.4a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 1 1-1.4-1.4l1.4-1.4a1 1 0 0 1 1.4 0z" />
    </Svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </Svg>
  );
}

export function SystemIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 3a9 9 0 0 0 0 18z" />
    </Svg>
  );
}
