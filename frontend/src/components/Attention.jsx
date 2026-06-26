import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useT } from '../i18n/LanguageContext'

function interpolatePosition(waypoints, t) {
  if (t <= waypoints[0].t) return { x: waypoints[0].x, y: waypoints[0].y }
  if (t >= waypoints[waypoints.length - 1].t) {
    const last = waypoints[waypoints.length - 1]
    return { x: last.x, y: last.y }
  }

  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i]
    const b = waypoints[i + 1]
    if (t >= a.t && t <= b.t) {
      const frac = (t - a.t) / (b.t - a.t)
      return {
        x: a.x + (b.x - a.x) * frac,
        y: a.y + (b.y - a.y) * frac,
      }
    }
  }
  const last = waypoints[waypoints.length - 1]
  return { x: last.x, y: last.y }
}

export default function Attention({ challengeData, onSubmit, disabled }) {
  const t = useT()
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)
  const startRef = useRef(null)
  const stoppedRef = useRef(false)
  const submittedRef = useRef(false)
  const disabledRef = useRef(disabled)
  const onSubmitRef = useRef(onSubmit)
  const [stopped, setStopped] = useState(false)

  const { waypoints, stop_time, canvas_size } = challengeData
  const w = canvas_size?.w || 400
  const h = canvas_size?.h || 400
  const pathEndTime = waypoints[waypoints.length - 1]?.t ?? stop_time
  // Red as soon as the dot stops moving (stop_time may exceed path end on older challenges)
  const visualStopTime = Math.min(stop_time, pathEndTime)

  useEffect(() => {
    disabledRef.current = disabled
  }, [disabled])

  useEffect(() => {
    onSubmitRef.current = onSubmit
  }, [onSubmit])

  useEffect(() => {
    startRef.current = performance.now()
    stoppedRef.current = false
    submittedRef.current = false
    setStopped(false)

    let frame
    const animate = () => {
      const elapsed = (performance.now() - startRef.current) / 1000

      if (!stoppedRef.current && elapsed >= visualStopTime) {
        stoppedRef.current = true
        setStopped(true)
      }

      const time = stoppedRef.current
        ? stop_time
        : Math.min(elapsed, visualStopTime)
      const pos = interpolatePosition(waypoints, time)

      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, w, h)
        ctx.fillStyle = '#12121a'
        ctx.fillRect(0, 0, w, h)

        ctx.strokeStyle = '#2a2a38'
        ctx.lineWidth = 1
        for (let i = 0; i < 10; i++) {
          ctx.beginPath()
          ctx.moveTo(i * w / 10, 0)
          ctx.lineTo(i * w / 10, h)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(0, i * h / 10)
          ctx.lineTo(w, i * h / 10)
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.arc(pos.x, pos.y, stoppedRef.current ? 14 : 10, 0, Math.PI * 2)
        ctx.fillStyle = stoppedRef.current ? '#ff4444' : '#00d4aa'
        ctx.fill()
        ctx.strokeStyle = stoppedRef.current ? '#ff8888' : '#00ffcc'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [waypoints, stop_time, visualStopTime, w, h])

  const submitClick = useCallback(async (clientX, clientY) => {
    if (!stoppedRef.current || disabledRef.current || submittedRef.current) return

    const target = overlayRef.current || canvasRef.current
    if (!target) return

    const rect = target.getBoundingClientRect()
    const click = {
      x: (clientX - rect.left) * (w / rect.width),
      y: (clientY - rect.top) * (h / rect.height),
    }

    submittedRef.current = true
    try {
      const accepted = await onSubmitRef.current({ click })
      if (accepted === false) {
        submittedRef.current = false
      }
    } catch {
      submittedRef.current = false
    }
  }, [w, h])

  const handlePointerDown = useCallback(
    (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()
      submitClick(e.clientX, e.clientY)
    },
    [submitClick],
  )

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-400 text-center"
      >
        {stopped ? t('attention.clickFast') : t('attention.follow')}
      </motion.p>

      <div
        ref={overlayRef}
        className={`relative rounded-xl border-2 max-w-full touch-none select-none ${
          stopped ? 'border-danger cursor-crosshair' : 'border-[#2a2a38] cursor-default'
        }`}
        style={{ width: 'min(400px, 90vw)', height: 'min(400px, 90vw)' }}
        onPointerDown={handlePointerDown}
        role={stopped ? 'button' : undefined}
        aria-label={stopped ? t('attention.clickFast') : t('attention.follow')}
      >
        <canvas
          ref={canvasRef}
          width={w}
          height={h}
          className="block w-full h-full rounded-[10px] pointer-events-none"
        />
      </div>

      {stopped && (
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-danger font-medium animate-pulse"
        >
          {t('attention.stopped')}
        </motion.span>
      )}
    </div>
  )
}
