import { useEffect, useState } from 'react'

/*
  One clock for a hero scene. Each step of the loop is a fixed length;
  the scene keys its animated layer on `step`, so every step remounts it
  and the CSS keyframes play again from zero. No per-frame React work.

  The clock only runs while the window is on screen and the tab is
  visible (`running` also pauses the CSS keyframes through a class), and
  never when `enabled` is false (reduced motion: the scene shows its
  finished state instead).
*/
export default function useLoop(ref, { count, ms, enabled }) {
  const [step, setStep] = useState(0)
  const [onScreen, setOnScreen] = useState(true)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [ref])

  useEffect(() => {
    const sync = () => setVisible(!document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  const running = enabled && onScreen && visible

  useEffect(() => {
    if (!running) return undefined
    const id = window.setInterval(() => setStep((s) => s + 1), ms)
    return () => window.clearInterval(id)
  }, [running, ms])

  return { step, index: ((step % count) + count) % count, running }
}
