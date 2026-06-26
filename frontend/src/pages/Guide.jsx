import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useT } from '../i18n/LanguageContext'
import LanguageBar from '../components/LanguageBar'
import { markStudyEligible } from '../sessionStorage'

const CHALLENGE_TYPES = [
  { key: 'perceptual', icon: '👁️', color: 'from-violet-500/20 to-violet-500/5', border: 'border-violet-500/30' },
  { key: 'reasoning', icon: '🔢', color: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/30' },
  { key: 'attention', icon: '🎯', color: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/30' },
  { key: 'biometric', icon: '🎤', color: 'from-rose-500/20 to-rose-500/5', border: 'border-rose-500/30' },
]

const TIPS = ['timer', 'microphone', 'focus', 'optional']

export default function Guide() {
  const navigate = useNavigate()
  const t = useT()

  const startStudy = () => {
    markStudyEligible()
    navigate('/study')
  }

  return (
    <div className="min-h-screen px-4 py-10 md:px-8">
      <LanguageBar />

      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-accent bg-accent/10 border border-accent/30 mb-5">
            {t('guide.badge')}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('guide.title')}</h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
            {t('guide.subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10"
        >
          {CHALLENGE_TYPES.map(({ key, icon, color, border }, idx) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.06 }}
              className={`rounded-2xl border ${border} bg-gradient-to-br ${color} p-6`}
            >
              <div className="flex items-start gap-4">
                <span className="text-5xl leading-none select-none" role="img" aria-hidden>
                  {icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-white">{t(`families.${key}`)}</h3>
                    <span className="text-xs font-mono text-accent/80 bg-accent/10 px-2 py-0.5 rounded-md shrink-0">
                      {t(`guide.time.${key}`)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {t(`guide.desc.${key}`)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-[#2a2a38] bg-card/60 p-6 md:p-8 mb-10"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            {t('guide.tipsTitle')}
          </h2>
          <ul className="space-y-3">
            {TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-3 text-gray-400 text-sm leading-relaxed">
                <span className="text-accent mt-0.5 shrink-0">✦</span>
                <span>{t(`guide.tips.${tip}`)}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center"
        >
          <motion.button
            type="button"
            onClick={startStudy}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 sm:flex-none px-10 py-4 rounded-xl bg-accent text-background font-semibold text-lg shadow-lg shadow-accent/25"
          >
            {t('guide.startStudy')}
          </motion.button>

          <motion.button
            type="button"
            onClick={() => navigate('/practice')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 sm:flex-none px-10 py-4 rounded-xl border-2 border-[#2a2a38] text-gray-300 font-medium hover:border-accent/40 hover:text-white transition-colors"
          >
            {t('guide.tryDemo')}
          </motion.button>
        </motion.div>

        <p className="text-center text-xs text-gray-600 mt-6">{t('guide.demoNote')}</p>
      </div>
    </div>
  )
}
