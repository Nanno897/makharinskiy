// Gentle audio chime generator using Web Audio API
export const playSuccessChime = () => {
  if (typeof window === 'undefined') return

  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext
    if (!AudioContext) return

    const ctx = new AudioContext()
    
    // Create two subtle warm tones (A major chord feel)
    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc2.type = 'sine'
    
    // Soft dual pitch chime (523.25Hz / C5 to 659.25Hz / E5)
    osc1.frequency.setValueAtTime(523.25, now)
    osc2.frequency.setValueAtTime(659.25, now + 0.05)

    // Smooth gain decay so it sounds warm, soft, and subtle
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now + 0.05)
    osc1.stop(now + 0.35)
    osc2.stop(now + 0.35)
  } catch {
    // Graceful fallback if audio context is blocked
  }
}

// Subtle mobile vibration cue
export const triggerHaptic = (pattern: number | number[] = 40) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // Ignored if device doesn't permit vibration
    }
  }
}

// Combined cozy feedback function
export const playCheckoffFeedback = () => {
  triggerHaptic(35) // Light 35ms tap
  playSuccessChime()
}
// Warm, lower-toned chime for chat toggle (F3 / A3 pitch)
export const playChatToggleFeedback = () => {
  if (typeof window === 'undefined') return

  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext
    if (!AudioContext) return

    const ctx = new AudioContext()
    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    // Smooth sine wave for a soft, rounded tone
    osc1.type = 'sine'
    osc2.type = 'sine'
    
    // Deeper frequencies (174.61Hz / F3 and 220Hz / A3) instead of high pitch
    osc1.frequency.setValueAtTime(174.61, now)
    osc2.frequency.setValueAtTime(220.00, now + 0.04)

    // Gentle gain curve for a subtle background feel
    gain.gain.setValueAtTime(0.06, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now + 0.04)
    osc1.stop(now + 0.3)
    osc2.stop(now + 0.3)
  } catch {
    // Fallback if blocked
  }
}
