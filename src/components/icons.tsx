import type { SVGProps } from 'react';

// Line icons, 20×20, stroke 1.5. Nav icons are keyed by route id.
const PATHS: Record<string, string> = {
  launch: '<path d="M10 2.8c2.6 1.6 4 4.4 4 7.6v3.4H6v-3.4c0-3.2 1.4-6 4-7.6Z"/><path d="M6 11.4 3.8 13.6v2.6L6 15M14 11.4l2.2 2.2v2.6L14 15M8.4 16.6h3.2"/><circle cx="10" cy="8.4" r="1.4"/>',
  pairs: '<path d="M3.5 15.5h13"/><path d="M5.5 12.5v-3M5.5 9.5V7M9 13V6.5M9 6.5V4M12.5 12.5V9M16 11.5V5"/><rect x="4.4" y="7" width="2.2" height="5" rx=".4"/><rect x="7.9" y="6.5" width="2.2" height="6.5" rx=".4"/><rect x="11.4" y="9" width="2.2" height="3.5" rx=".4"/>',
  offerings: '<rect x="3.5" y="4" width="13" height="12" rx="2"/><path d="M3.5 8h13M8 4v12"/>',
  swap: '<path d="M4 7h11l-3-3M16 13H5l3 3"/>',
  bridge: '<path d="M2.5 13.5h15M4 13.5V9.5M16 13.5V9.5M4 9.5c2-3 10-3 12 0M7.5 13.5v-2.5M12.5 13.5v-2.5"/>',
  earnings: '<circle cx="10" cy="10" r="6.5"/><path d="M12.3 7.6c-.5-.7-1.3-1-2.3-1-1.3 0-2.3.7-2.3 1.7 0 2.3 4.8 1.2 4.8 3.5 0 1-1.1 1.7-2.5 1.7-1 0-1.9-.4-2.4-1.1M10 5.2v1.4M10 13.5v1.3"/>',
  stats: '<path d="M3.5 16.5h13M5.5 13l3-3.5 3 2 4-5.5"/>',
  vaults: '<rect x="3.5" y="4" width="13" height="12" rx="2"/><circle cx="10" cy="10" r="2.6"/><path d="M10 7.4V6M10 14v-1.4M12.6 10H14M6 10h1.4"/>',
  docs: '<path d="M6 3.5h6l3.5 3.5v9a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5Z"/><path d="M12 3.5V7h3.5M8 10.5h5M8 13h4"/>',
  pause: '<path d="M7 4.5v11M13 4.5v11"/>',
  play: '<path d="M6.5 4.6v10.8a.6.6 0 0 0 .9.5l8.4-5.4a.6.6 0 0 0 0-1L7.4 4.1a.6.6 0 0 0-.9.5Z"/>',
  search: '<circle cx="9" cy="9" r="5.5"/><path d="m13.2 13.2 3.3 3.3"/>',
  menu: '<path d="M3.5 6h13M3.5 10h13M3.5 14h8"/>',
  sidebar: '<rect x="3" y="3.5" width="14" height="13" rx="1.5"/><path d="M8 3.5v13"/>',
  help: '<circle cx="10" cy="10" r="7"/><path d="M7.9 8a2.2 2.2 0 1 1 3.1 2c-.6.3-1 .8-1 1.5M10 14.2h.01"/>',
  plus: '<path d="M10 4v12M4 10h12"/>',
  chevron: '<path d="m6 8 4 4 4-4"/>',
  arrow: '<path d="M6 14 14 6M7.5 6H14v6.5"/>',
  shield: '<path d="M10 2.8 4.5 5v4.6c0 3.6 2.4 6.2 5.5 7.6 3.1-1.4 5.5-4 5.5-7.6V5L10 2.8Z"/><path d="m7.6 10 1.7 1.7 3.2-3.4"/>',
  x: '<path d="m5 5 10 10M15 5 5 15"/>',
  flip: '<path d="M7 3.5v13M7 16.5l-3-3M13 16.5v-13M13 3.5l3 3"/>',
  external: '<path d="M8 4.5H5a1 1 0 0 0-1 1v9.5a1 1 0 0 0 1 1h9.5a1 1 0 0 0 1-1V12M11 4h5v5M16 4l-7 7"/>',
  copy: '<rect x="7" y="7" width="9.5" height="9.5" rx="1.5"/><path d="M13 7V4.5a1 1 0 0 0-1-1H4.5a1 1 0 0 0-1 1V12a1 1 0 0 0 1 1H7"/>',
};

export function Icon({ name, ...p }: { name: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden {...p} dangerouslySetInnerHTML={{ __html: PATHS[name] ?? '' }} />
  );
}

/** Brand mark: the folded hands (Twemoji 🙏 geometry, CC-BY 4.0) in amber with violet sleeves. */
const MARK_SVG = `<path fill="#8B7CFF" d="M30 22c-3 0-6.688 7.094-7 10-.421 3.915 2 4 2 4h11V26s-3.438-4-6-4z"/><ellipse transform="rotate(-60 27.574 28.49)" fill="#5A4BD1" cx="27.574" cy="28.489" rx="5.848" ry="1.638"/><path fill="#D99A3A" d="M20.086 0c1.181 0 2.138.957 2.138 2.138 0 .789.668 10.824.668 10.824L17.948 18V2.138C17.948.957 18.905 0 20.086 0z"/><path fill="#FFC266" d="M18.875 4.323c0-1.099.852-1.989 1.903-1.989 1.051 0 1.903.891 1.903 1.989 0 0 .535 5.942 1.192 9.37.878 1.866 1.369 4.682 1.261 6.248.054.398 5.625 5.006 5.625 5.006-.281 1.813-2.259 6.155-4.759 8.159l-3.521-2.924c-2.885-.404-4.458-3.331-4.458-4.264 0-2.984.854-21.595.854-21.595z"/><path fill="#8B7CFF" d="M6 22c3 0 6.688 7.094 7 10 .421 3.915-2 4-2 4H0V26s3.438-4 6-4z"/><ellipse transform="rotate(-30 8.424 28.489)" fill="#5A4BD1" cx="8.426" cy="28.489" rx="1.638" ry="5.848"/><path fill="#D99A3A" d="M16.061.011c-1.266-.127-2.333.864-2.333 2.103 0 .78-.184 10.319-.184 10.319L17.895 18l.062-15.765c0-1.106-.795-2.114-1.896-2.224z"/><path fill="#FFD48A" d="M17.125 4.323c0-1.099-.852-1.989-1.903-1.989-1.051 0-1.903.891-1.903 1.989 0 0-.535 5.942-1.192 9.37-.878 1.866-1.369 4.682-1.261 6.248-.054.398-5.625 5.006-5.625 5.006C5.522 26.76 7.5 31.102 10 33.106l3.521-2.924c2.885-.404 4.458-3.331 4.458-4.264 0-2.984-.854-21.595-.854-21.595z"/><path fill="#D99A3A" d="M17.958 25.823c-.414 0-.75-.336-.75-.75V2.792c0-.414.336-.75.75-.75s.75.336.75.75v22.282c.001.413-.335.749-.75.749z"/>`;
export function Mark({ className = '', size }: { className?: string; size?: number }) {
  return <svg viewBox="0 0 36 36" className={className} width={size} height={size} aria-hidden dangerouslySetInnerHTML={{ __html: MARK_SVG }} />;
}
