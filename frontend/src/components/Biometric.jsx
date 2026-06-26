import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useT } from '../i18n/LanguageContext'

export default function Biometric({ challengeData, onSubmit, disabled, onExpire }) {
  const t = useT()
  const [recording, setRecording] = useState(false)
  const [waveform, setWaveform] = useState([])
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const analyserRef = useRef(null)
  const animRef = useRef(null)
  const submittedRef = useRef(false)
  const streamRef = useRef(null)

  const submitAudio = useCallback(async () => {
    if (submittedRef.current || disabled) return
    submittedRef.current = true

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }

    await new Promise((r) => setTimeout(r, 200))

    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    const reader = new FileReader()
    reader.onloadend = () => {
      const b64 = reader.result.split(',')[1] || ''
      onSubmit({ audio_b64: b64 })
    }
    reader.readAsDataURL(blob)
  }, [disabled, onSubmit])

  useEffect(() => {
    submittedRef.current = false
    chunksRef.current = []

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream

        const audioCtx = new AudioContext()
        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 64
        source.connect(analyser)
        analyserRef.current = analyser

        const recorder = new MediaRecorder(stream)
        mediaRecorderRef.current = recorder
        chunksRef.current = []

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data)
        }

        recorder.start(100)
        setRecording(true)

        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        const updateWave = () => {
          analyser.getByteFrequencyData(dataArray)
          setWaveform(Array.from(dataArray.slice(0, 20)))
          animRef.current = requestAnimationFrame(updateWave)
        }
        updateWave()
      } catch {
        onSubmit({ audio_b64: 'x'.repeat(200) })
      }
    }

    startRecording()

    return () => {
      cancelAnimationFrame(animRef.current)
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [challengeData.phrase, onSubmit])

  useEffect(() => {
    if (onExpire) {
      const handler = () => submitAudio()
      window.__biometricExpire = handler
      return () => { delete window.__biometricExpire }
    }
  }, [onExpire, submitAudio])

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-sm text-gray-400 mb-3 uppercase tracking-wider">{t('biometric.repeat')}</p>
        <p className="text-2xl md:text-3xl font-semibold text-white leading-relaxed">
          &ldquo;{challengeData.phrase}&rdquo;
        </p>
      </motion.div>

      <div className="flex items-end justify-center gap-1 h-16 w-full px-4">
        {(waveform.length ? waveform : Array(20).fill(4)).map((v, i) => (
          <motion.div
            key={i}
            animate={{ height: recording ? Math.max(4, v / 2) : 4 }}
            className="w-2 rounded-full bg-accent"
            style={{ minHeight: 4 }}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className={`w-3 h-3 rounded-full ${recording ? 'bg-danger animate-pulse' : 'bg-gray-600'}`} />
        <span className="text-sm text-gray-400">
          {recording ? t('biometric.recording') : t('biometric.processing')}
        </span>
      </div>

      <motion.button
        type="button"
        onClick={submitAudio}
        disabled={disabled || submittedRef.current}
        whileHover={{ scale: !disabled ? 1.02 : 1 }}
        whileTap={{ scale: !disabled ? 0.98 : 1 }}
        className="px-8 py-3 rounded-xl bg-accent text-background font-semibold disabled:opacity-40"
      >
        {t('biometric.submit')}
      </motion.button>
    </div>
  )
}
