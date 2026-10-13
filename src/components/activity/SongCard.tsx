/**
 * THE SONG for a Daily Activity.
 * Commercial songs open in her own music service (nothing is stored in the
 * app). Music Radiate has the rights to can play right here.
 */
import { ExternalLink } from "lucide-react";
import { songLinks, type Song } from "@/lib/content";
import { Artwork } from "../Artwork";

export function SongCard({ song, colors }: { song: Song; colors: [string, string] }) {
  return (
    <section className="card p-5">
      <p className="label">Your song</p>
      <div className="mt-4 flex items-center gap-4">
        <Artwork colors={colors} size={64} />
        <div className="min-w-0">
          <p className="font-serif text-2xl leading-tight text-plum">{song.title}</p>
          <p className="text-sm text-plum-soft">{song.artist}</p>
        </div>
      </div>
      {song.audioUrl ? (
        <audio controls preload="none" src={song.audioUrl} className="mt-4 w-full" aria-label={`Play ${song.title}`} />
      ) : (
        <>
          <p className="mt-4 text-sm text-plum-soft">Start the song, then come back and begin.</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {songLinks(song).map((l) => (
              <li key={l.service}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ivory-light/60 px-3.5 py-2 text-sm text-plum transition-colors hover:border-taupe"
                >
                  {l.service} <ExternalLink size={13} strokeWidth={1.6} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
