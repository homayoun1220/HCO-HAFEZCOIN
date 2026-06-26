import { motion } from 'framer-motion'
import { LANGUAGES, useLanguage } from '../i18n/LanguageContext'

export default function LanguageSelector({ prominent = false }) {
  const { lang, setLang, t } = useLanguage()

  if (prominent) {
    return (
      <div className="w-full max-w-2xl mx-auto mb-10">
        <div className="text-center mb-8">
          <span className="inline-block text-5xl mb-4" role="img" aria-hidden>🌐</span>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
            {t('lang.choose')}
          </h2>
          <p className="text-gray-400 text-base md:text-lg">{t('lang.chooseSub')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Object.values(LANGUAGES).map(({ code, label, flag }) => {
            const selected = lang === code
            return (
              <motion.button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.97 }}
                className={`flex flex-col items-center justify-center gap-5 p-10 md:p-12 rounded-2xl border-2 transition-all duration-300 min-h-[220px] ${
                  selected
                    ? 'border-accent bg-accent/15 shadow-xl shadow-accent/25 ring-2 ring-accent/40'
                    : 'border-[#2a2a38] bg-card hover:border-accent/50 hover:bg-accent/5'
                }`}
              >
                <span className="text-8xl md:text-9xl leading-none select-none" role="img" aria-hidden>
                  {flag}
                </span>
                <span className={`text-xl md:text-2xl font-bold ${selected ? 'text-accent' : 'text-white'}`}>
                  {label}
                </span>
                {selected && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-sm text-accent font-medium"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {Object.values(LANGUAGES).map(({ code, flag, label }) => (
        <motion.button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          title={label}
          aria-label={label}
          className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl text-2xl md:text-3xl border-2 transition-all ${
            lang === code
              ? 'border-accent bg-accent/20 shadow-lg shadow-accent/20'
              : 'border-[#2a2a38] bg-card/80 hover:border-accent/40'
          }`}
        >
          {flag}
        </motion.button>
      ))}
    </div>
  )
}
