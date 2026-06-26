import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useT } from '../i18n/LanguageContext'
import LanguageBar from '../components/LanguageBar'

export default function Consent() {
  const navigate = useNavigate()
  const t = useT()
  const [agreed, setAgreed] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <LanguageBar />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-card rounded-2xl border border-[#2a2a38] p-8 md:p-10"
      >
        <h1 className="text-2xl font-bold mb-6">{t('consent.title')}</h1>

        <div className="text-gray-400 space-y-4 text-sm leading-relaxed max-h-96 overflow-y-auto pr-2">
          <p>{t('consent.intro')}</p>
          <p>
            <strong className="text-gray-300">{t('consent.purposeLabel')}</strong>{' '}
            {t('consent.purpose')}
          </p>
          <p>
            <strong className="text-gray-300">{t('consent.procedureLabel')}</strong>{' '}
            {t('consent.procedure')}
          </p>
          <p>
            <strong className="text-gray-300">{t('consent.risksLabel')}</strong>{' '}
            {t('consent.risks')}
          </p>
          <p>
            <strong className="text-gray-300">{t('consent.benefitsLabel')}</strong>{' '}
            {t('consent.benefits')}
          </p>
          <p>
            <strong className="text-gray-300">{t('consent.confidentialityLabel')}</strong>{' '}
            {t('consent.confidentiality')}
          </p>
          <p>
            <strong className="text-gray-300">{t('consent.voluntaryLabel')}</strong>{' '}
            {t('consent.voluntary')}
          </p>
          <p>
            <strong className="text-gray-300">{t('consent.contactLabel')}</strong>{' '}
            {t('consent.contact')}
          </p>
        </div>

        <label className="flex items-start gap-3 mt-8 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-[#2a2a38] bg-background accent-accent cursor-pointer"
          />
          <span className="text-gray-300 group-hover:text-white transition-colors">
            {t('consent.agree')}
          </span>
        </label>

        <motion.button
          onClick={() => navigate('/guide')}
          disabled={!agreed}
          whileHover={{ scale: agreed ? 1.02 : 1 }}
          whileTap={{ scale: agreed ? 0.98 : 1 }}
          className="mt-6 w-full py-4 rounded-xl bg-accent text-background font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('consent.continue')}
        </motion.button>
      </motion.div>
    </div>
  )
}
