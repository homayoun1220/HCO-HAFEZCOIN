import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage, LANG_STORAGE_KEY } from '../i18n/LanguageContext'
import LanguageBar from '../components/LanguageBar'
import { hasPickedLanguageThisSession } from './Language'

/** Page 2 — study intro (only after language pick on /). */
export default function Welcome({ setProlificPid, setStudyId }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { t } = useLanguage()

  const prolificPid = params.get('PROLIFIC_PID') || params.get('prolific_pid') || ''
  const studyId = params.get('STUDY_ID') || params.get('study_id') || ''

  useEffect(() => {
    const storedLang = localStorage.getItem(LANG_STORAGE_KEY)
    if (!hasPickedLanguageThisSession() || (storedLang !== 'en' && storedLang !== 'es')) {
      navigate('/', { replace: true })
    }
  }, [navigate])

  if (!hasPickedLanguageThisSession()) {
    return null
  }

  const handleStart = () => {
    setProlificPid(prolificPid)
    setStudyId(studyId)
    navigate('/consent')
  }

  return (
    <div className="fixed inset-0 z-10 flex flex-col bg-background overflow-hidden">
      <LanguageBar />

      <main className="flex-1 flex items-center justify-center px-6 min-h-0">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl text-center"
        >
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {t('landing.title')}
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed mb-4">{t('landing.desc1')}</p>
          <p className="text-gray-500 mb-10">{t('landing.desc2')}</p>

          <motion.button
            type="button"
            onClick={handleStart}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-10 py-4 rounded-xl bg-accent text-background font-semibold text-lg shadow-lg shadow-accent/20"
          >
            {t('landing.start')}
          </motion.button>

          {prolificPid && (
            <p className="mt-6 text-xs text-gray-600">{t('landing.participantDetected')}</p>
          )}
        </motion.div>
      </main>
    </div>
  )
}
