import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Perceptual from '../components/Perceptual'
import Reasoning from '../components/Reasoning'
import Attention from '../components/Attention'
import Biometric from '../components/Biometric'
import LanguageBar from '../components/LanguageBar'
import { practiceChallenge } from '../practiceDemo'
import { markStudyEligible } from '../sessionStorage'
import { useT } from '../i18n/LanguageContext'

const FAMILIES = ['perceptual', 'reasoning', 'attention', 'biometric']

export default function Practice() {
  const navigate = useNavigate()
  const t = useT()
  const [familyIdx, setFamilyIdx] = useState(0)
  const [done, setDone] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const family = FAMILIES[familyIdx]
  const challengeData = useMemo(() => practiceChallenge(family), [family, familyIdx])
  const familyLabel = t(`families.${family}`)

  const goToStudy = useCallback(() => {
    markStudyEligible()
    navigate('/study')
  }, [navigate])

  const handleSubmit = useCallback(async () => {
    setFeedback('practice')
    setTimeout(() => {
      setFeedback(null)
      if (familyIdx + 1 >= FAMILIES.length) {
        setDone(true)
      } else {
        setFamilyIdx((i) => i + 1)
      }
    }, 800)
    return true
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
        <LanguageBar />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="text-5xl mb-6">✨</div>
          <h2 className="text-2xl font-bold mb-4">{t('practice.completeTitle')}</h2>
          <p className="text-gray-400 mb-8">{t('practice.completeDesc')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              onClick={goToStudy}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 rounded-xl bg-accent text-background font-semibold text-lg"
            >
              {t('practice.beginStudy')}
            </motion.button>
            <motion.button
              onClick={() => navigate('/guide')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl border border-[#2a2a38] text-gray-400 hover:text-white"
            >
              {t('practice.backGuide')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8">
      <LanguageBar />

      <div className="w-full max-w-4xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <motion.button
          type="button"
          onClick={() => navigate('/guide')}
          whileHover={{ scale: 1.02 }}
          className="text-sm text-gray-500 hover:text-accent transition-colors"
        >
          ← {t('practice.backGuide')}
        </motion.button>
        <motion.button
          type="button"
          onClick={goToStudy}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="text-sm px-5 py-2 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 transition-colors"
        >
          {t('practice.skipToStudy')}
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mb-8 px-4 py-4 rounded-xl bg-accent/10 border border-accent/30 text-center"
      >
        <span className="inline-block text-xs uppercase tracking-wider text-accent/80 mb-1">
          {t('practice.optionalBadge')}
        </span>
        <p className="text-accent font-medium">
          {t('practice.round', { n: familyIdx + 1, family: familyLabel })}
        </p>
        <p className="text-sm text-gray-400 mt-1">{t('practice.notRecorded')}</p>
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
