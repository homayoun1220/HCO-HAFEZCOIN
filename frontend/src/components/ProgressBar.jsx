import { motion } from 'framer-motion'
import { useT } from '../i18n/LanguageContext'

const TRIALS_PER_SEGMENT = 5

export default function ProgressBar({ current, total, familyKey, familyIndex }) {
  const t = useT()
  const segments = 4
  const segIdx = familyIndex ?? Math.floor((current - 1) / TRIALS_PER_SEGMENT)

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">
          {t('progress.challenge')}{' '}
          <span className="text-accent font-semibold">{current}</span>{' '}
          {t('progress.of')} {total}
        </span>
        <span className="text-sm text-gray-500">
          {familyKey ? t(`families.${familyKey}`) : ''}
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: segments }).map((_, idx) => {
          const segStart = idx * TRIALS_PER_SEGMENT
          const segEnd = segStart + TRIALS_PER_SEGMENT
          let fill = 0
          if (current > segEnd) fill = 1
          else if (current > segStart) fill = (current - segStart) / TRIALS_PER_SEGMENT

          const isActive = segIdx === idx

          return (
            <div key={idx} className="flex-1 h-2 rounded-full bg-[#2a2a38] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor: isActive ? '#00d4aa' : '#00d4aa88',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${fill * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
