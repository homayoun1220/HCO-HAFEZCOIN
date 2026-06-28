import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useT } from '../i18n/LanguageContext'

function micAvailable() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return false
  }
  if (window.isSecureContext) return true
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1'
}

export default function Biometric({ challengeData, onSubmit, disabled, onExpire }) {
  const t = useT()
  const [recording, setRecording] = useState(false)
  const [waveform, setWaveform] = useState([])
  const [micError, setMicError] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const analyserRef = useRef(null)
  const animRef = useRef(null)
  const submittedRef = useRef(false)
  const streamRef = useRef(null)
  const audioCtxRef = useRef(null)
  const onSubmitRef = useRef(onSubmit)

  onSubmitRef.current = onSubmit

  const cleanupRecording = useCallback(() => {
    cancelAnimationFrame(animRef.current)
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    mediaRecorderRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    setRecording(false)
  }, [])

  const submitAudio = useCallback(async () => {
    if (submittedRef.current || disabled) return
    submittedRef.current = true

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }

    await new Promise((r) => setTimeout(r, 200))

    cleanupRecording()

    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    if (!blob.size) {
      onSubmitRef.current({ audio_b64: '' })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const b64 = reader.result.split(',')[1] || ''
      onSubmitRef.current({ audio_b64: b64 })
    }
    reader.readAsDataURL(blob)
  }, [cleanupRecording, disabled])

  const startRecording = useCallback(async () => {
    submittedRef.current = false
    chunksRef.current = []
    setMicError(null)
    cleanupRecording()

    if (!micAvailable()) {
      setMicError(t('biometric.needHttps'))
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioCtx = new AudioContext()
      audioCtxRef.current = audioCtx
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
    } catch (err) {
      console.error('Microphone access failed', err)
      cleanupRecording()
      setMicError(t('biometric.micDenied'))
    }
  }, [cleanupRecording, t])

  useEffect(() => {
    startRecording()
    return () => cleanupRecording()
  }, [challengeData.phrase, startRecording, cleanupRecording])

  useEffect(() => {
    if (onExpire) {
      const handler = () => submitAudio()
      window.__biometricExpire = handler
      return () => { delete window.__biometricExpire }
    }
  }, [onExpire, submitAudio])

  if (micError) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto text-center px-4">
        <p className="text-2xl md:text-3xl font-semibold text-white leading-relaxed">
          &ldquo;{challengeData.phrase}&rdquo;
        </p>
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-5 py-4 text-danger text-sm leading-relaxed">
          {micError}
        </div>
        {micAvailable() && (
          <motion.button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 rounded-xl bg-accent text-background font-semibold disabled:opacity-40"
          >
            {t('biometric.micRetry')}
          </motion.button>
        )}
      </div>
    )
  }

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
        disabled={disabled || submittedRef.current || !recording}
        whileHover={{ scale: !disabled ? 1.02 : 1 }}
        whileTap={{ scale: !disabled ? 0.98 : 1 }}
        className="px-8 py-3 rounded-xl bg-accent text-background font-semibold disabled:opacity-40"
      >
        {t('biometric.submit')}
      </motion.button>
    </div>
  )
}
