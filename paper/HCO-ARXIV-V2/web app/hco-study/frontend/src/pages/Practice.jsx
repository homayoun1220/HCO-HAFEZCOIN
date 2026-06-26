import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Perceptual from '../components/Perceptual'
import Reasoning from '../components/Reasoning'
import Attention from '../components/Attention'
import Biometric from '../components/Biometric'
import { practiceChallenge } from '../practiceDemo'
import { markStudyEligible } from '../sessionStorage'

const FAMILIES = ['perceptual', 'reasoning', 'attention', 'biometric']
const LABELS = {
  perceptual: 'Perceptual Matching',
  reasoning: 'Number Sequence',
  attention: 'Dot Tracking',
  biometric: 'Phrase Repetition',
}

export default function Practice() {
  const navigate = useNavigate()
  const [familyIdx, setFamilyIdx] = useState(0)
  const [done, setDone] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const family = FAMILIES[familyIdx]
  const challengeData = useMemo(() => practiceChallenge(family), [family, familyIdx])

  const handleSubmit = useCallback(() => {
    setFeedback('practice')
    setTimeout(() => {
      setFeedback(null)
      if (familyIdx + 1 >= FAMILIES.length) {
        setDone(true)
      } else {
        setFamilyIdx((i) => i + 1)
      }
    }, 800)
  }, [familyIdx])

  const renderChallenge = () => {
    const props = { challengeData, onSubmit: handleSubmit, disabled: !!feedback }
    switch (family) {
      case 'perceptual':
        return <Perceptual {...props} />
      case 'reasoning':
        return <Reasoning {...props} />
      case 'attention':
        return <Attention {...props} />
      case 'biometric':
        return <Biometric {...props} />
      default:
        return null
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="text-5xl mb-6">🎯</div>
          <h2 className="text-2xl font-bold mb-4">Practice complete!</h2>
          <p className="text-gray-400 mb-8">
            You&apos;ve tried all four challenge types. Now the real study begins — 20 timed challenges await.
          </p>
          <motion.button
            onClick={() => {
              markStudyEligible()
              navigate('/study')
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-10 py-4 rounded-xl bg-accent text-background font-semibold text-lg"
          >
            Begin Real Study
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mb-8 px-4 py-3 rounded-xl bg-accent/10 border border-accent/30 text-center"
      >
        <span className="text-accent font-medium">
          Practice Round {familyIdx + 1}/4 — {LABELS[family]}
        </span>
        <p className="text-sm text-gray-400 mt-1">This round is not recorded</p>
      </motion.div>

      <div className="flex-1 flex items-center justify-center w-full relative">
        {renderChallenge()}

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 pointer-events-none"
            >
              <span className="text-6xl">👍</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
