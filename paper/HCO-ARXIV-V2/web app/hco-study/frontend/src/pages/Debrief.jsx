import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { completeSession } from '../api'

export default function Debrief({
  sessionId,
  score,
  setScore,
  setCompletionCode,
  completionCode,
}) {
  useEffect(() => {
    if (sessionId && !completionCode) {
      completeSession(sessionId)
        .then(({ data }) => {
          setCompletionCode(data.completion_code)
          if (data.score) {
            setScore({ passed: data.score.passed, total: data.score.total })
          }
        })
        .catch(console.error)
    }
  }, [sessionId, completionCode, setCompletionCode, setScore])

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-8 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center"
        >
          <span className="text-4xl">🎉</span>
        </motion.div>

        <h1 className="text-3xl font-bold mb-4">Thank you!</h1>
        <p className="text-gray-400 text-lg mb-8">
          You completed the study. Your responses help us understand how humans
          perform under real-time pressure.
        </p>

        {score && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-[#2a2a38] p-6 mb-8"
          >
            <p className="text-gray-400 text-sm mb-2">Your score</p>
            <p className="text-4xl font-bold text-accent">
              {score.passed}<span className="text-gray-500 text-2xl">/{score.total}</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">challenges passed</p>
          </motion.div>
        )}

        {completionCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-card rounded-xl border border-accent/30 p-6 mb-8"
          >
            <p className="text-gray-400 text-sm mb-2">Prolific completion code</p>
            <p className="text-xl font-mono font-bold text-accent tracking-wider">
              {completionCode}
            </p>
            <p className="text-xs text-gray-500 mt-3">
              Copy this code and paste it into Prolific to receive your payment.
            </p>
          </motion.div>
        )}

        <div className="text-sm text-gray-500 leading-relaxed">
          <p>
            This research investigates human-completable challenges for security systems.
            Your anonymized data will be used solely for academic publication.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
