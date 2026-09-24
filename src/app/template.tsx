/**
 * Wraps each screen so it gently rises and fades in when you arrive,
 * instead of snapping into place.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="rise">{children}</div>;
}
