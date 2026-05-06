let lastChimeAt = 0;

export function playChime() {
  // Debounce so a freak burst of triggers can't produce overlapping beeps.
  const now = Date.now();
  if (now - lastChimeAt < 1000) return;
  lastChimeAt = now;

  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const duration = 0.45;
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    const freq = 660;
    for (let i = 0; i < length; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.exp(-3 * t);
      data[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.18;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
      ctx.close().catch(() => {});
    };
    source.start();
  } catch {
    // ignore — chime is best-effort
  }
}
