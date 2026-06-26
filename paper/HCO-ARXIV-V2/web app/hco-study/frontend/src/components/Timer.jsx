import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const RADIUS = 54
const STROKE = 8
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function Timer({ deltaResp, onExpire, isRunning }) {
  const [remaining, setRemaining] = useState(deltaResp)
  const startRef = useRef(null)
  const expiredRef = useRef(false)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    setRemaining(deltaResp)
    expiredRef.current = false
    startRef.current = performance.now()
  }, [deltaResp, isRunning])

  useEffect(() => {
    if (!isRunning) return

    let frame
    const tick = () => {
      const elapsed = (performance.now() - startRef.current) / 1000
      const left = Math.max(0, deltaResp - elapsed)
      setRemaining(left)

      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true
        onExpireRef.current?.()
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [isRunning, deltaResp])

  const progress = remaining / deltaResp
  const offset = CIRCUMFERENCE * (1 - progress)
  const seconds = Math.ceil(remaining)

  let color = '#00d4aa'
  if (remaining <= 3) color = '#ffaa00'
  if (remaining <= 2) color = '#ff4444'

  const isPulsing = remaining <= 2 && remaining > 0

  return (
    <div className={`relative flex items-center justify-center ${isPulsing ? 'timer-pulse' : ''}`}>
      <svg width="140" height="140" className="-rotate-90">
        <circle
          cx="70"
          cy="70"
          r={RADIUS}
          fill="none"
          stroke="#2a2a38"
          strokeWidth={STROKE}
        />
        <motion.circle
          cx="70"
          cy="70"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          animate={{ stroke: color }}
          transition={{ duration: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={seconds}
          initial={{ scale: 1.2, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-3xl font-bold tabular-nums"
          style={{ color }}
        >
          {seconds}
        </motion.span>
        <span className="text-xs text-gray-500 mt-0.5">sec</span>
      </div>
    </div>
  )
}
