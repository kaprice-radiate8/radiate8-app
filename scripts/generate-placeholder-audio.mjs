/**
 * Generates soft placeholder "songs" (gentle ambient chord pads) as .wav files
 * in public/audio/. They stand in for real music until licensed tracks are added.
 *
 * Run once with:  node scripts/generate-placeholder-audio.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";

const SAMPLE_RATE = 16000;
const SECONDS = 20;

// Each track is a slow sequence of chords (frequencies in Hz).
const tracks = {
  "golden-hour": [
    [174.61, 220.0, 261.63, 329.63], // F maj7
    [146.83, 220.0, 261.63, 349.23], // D min7
    [196.0, 246.94, 293.66, 392.0], // G
    [130.81, 196.0, 261.63, 329.63], // C
  ],
  "morning-tide": [
    [110.0, 164.81, 261.63, 329.63], // A min
    [87.31, 174.61, 261.63, 329.63], // F
    [130.81, 196.0, 293.66, 329.63], // C add9
    [98.0, 196.0, 246.94, 293.66], // G
  ],
  "still-water": [
    [130.81, 196.0, 246.94, 329.63], // C maj7
    [110.0, 164.81, 246.94, 329.63], // A min9-ish
    [87.31, 174.61, 220.0, 329.63], // F maj7
    [130.81, 196.0, 246.94, 329.63],
  ],
};

function render(chords) {
  const total = SAMPLE_RATE * SECONDS;
  const perChord = total / chords.length;
  const samples = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    const t = i / SAMPLE_RATE;
    const c = Math.floor(i / perChord);
    const local = (i % perChord) / perChord;
    // Soft swell in and out for each chord
    const env = Math.sin(Math.PI * local) ** 1.5;
    let v = 0;
    for (const f of chords[c]) {
      v += Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t);
    }
    // Gentle overall fade at the very start and end
    const fade = Math.min(1, t / 1.5, (SECONDS - t) / 1.5);
    samples[i] = (v / chords[c].length) * env * fade * 0.28;
  }
  return samples;
}

function toWav(samples) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((s, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), 44 + i * 2));
  return buf;
}

mkdirSync("public/audio", { recursive: true });
for (const [name, chords] of Object.entries(tracks)) {
  writeFileSync(`public/audio/${name}.wav`, toWav(render(chords)));
  console.log(`wrote public/audio/${name}.wav`);
}
