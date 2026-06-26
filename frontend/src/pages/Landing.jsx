import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageBar from '../components/LanguageBar'

export default function Landing({ setProlificPid, setStudyId }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { t, hasSelectedLanguage } = useLanguage()

  const prolificPid = params.get('PROLIFIC_PID') || params.get('prolific_pid') || ''
  const studyId = params.get('STUDY_ID') || params.get('study_id') || ''

  const handleStart = () => {
    if (!hasSelectedLanguage) return
    setProlificPid(prolificPid)
    setStudyId(studyId)
    navigate('/consent')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      {hasSelectedLanguage && <LanguageBar />}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl w-full text-center"
      >
        {/* Language selection — always shown first */}
        <LanguageBar prominent />

        {hasSelectedLanguage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center"
            >
              <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {t('landing.title')}
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed mb-4">
              {t('landing.desc1')}
            </p>
            <p className="text-gray-500 mb-10">
              {t('landing.desc2')}
            </p>

            <motion.button
              onClick={handleStart}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 rounded-xl bg-accent text-background font-semibold text-lg shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-shadow"
            >
              {t('landing.start')}
            </motion.button>

            {prolificPid && (
              <p className="mt-6 text-xs text-gray-600">{t('landing.participantDetected')}</p>
            )}
          </motion.div>
        )}

        {!hasSelectedLanguage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500 mt-2"
          >
            {t('lang.chooseSub')}
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}
