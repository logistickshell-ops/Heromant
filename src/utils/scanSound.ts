let context: AudioContext | null = null;
let master: GainNode | null = null;
let nodes: OscillatorNode[] = [];

export function startScanSound(): boolean {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return false;
    context = context ?? new AudioContextClass();
    master = context.createGain();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.8);
    master.connect(context.destination);

    const ambient = context.createOscillator();
    ambient.type = "sine";
    ambient.frequency.setValueAtTime(110, context.currentTime);
    const ambientGain = context.createGain();
    ambientGain.gain.value = 0.28;
    ambient.connect(ambientGain).connect(master);
    ambient.start();
    nodes = [ambient];

    const shimmer = context.createOscillator();
    shimmer.type = "triangle";
    shimmer.frequency.setValueAtTime(220, context.currentTime);
    const shimmerGain = context.createGain();
    shimmerGain.gain.value = 0.05;
    shimmer.connect(shimmerGain).connect(master);
    shimmer.start();
    nodes.push(shimmer);
    return true;
  } catch {
    stopScanSound();
    return false;
  }
}

export function playScanChime(): void {
  if (!context || !master) return;
  const now = context.currentTime;
  const chime = context.createOscillator();
  const gain = context.createGain();
  chime.type = "sine";
  chime.frequency.setValueAtTime(440 + Math.random() * 120, now);
  chime.frequency.exponentialRampToValueAtTime(880, now + 0.45);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
  chime.connect(gain).connect(master);
  chime.start(now);
  chime.stop(now + 0.7);
}

export function stopScanSound(): void {
  if (context && master) {
    const now = context.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(0.0001, now, 0.18);
  }
  window.setTimeout(() => {
    nodes.forEach((node) => { try { node.stop(); } catch { /* already stopped */ } });
    nodes = [];
    master?.disconnect();
    master = null;
  }, 700);
}
