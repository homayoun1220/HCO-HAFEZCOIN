import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import LanguageSelector from '../components/LanguageSelector'

const LANG_PICKED_KEY = 'hco_lang_picked'

export function markLanguagePicked() {
  sessionStorage.setItem(LANG_PICKED_KEY, '1')
}

export function hasPickedLanguageThisSession() {
  return sessionStorage.getItem(LANG_PICKED_KEY) === '1'
}

/** Page 1 — full-screen language selection (always shown at /). */
export default function Language() {
  const navigate = useNavigate()

  const handleSelect = () => {
    markLanguagePicked()
    navigate('/welcome', { replace: true })
  }

  return (
    <div className="fixed inset-0 z-10 flex flex-col bg-background overflow-hidden">
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-3xl"
        >
          <LanguageSelector prominent onSelect={handleSelect} />
        </motion.div>
      </main>
    </div>
  )
}
