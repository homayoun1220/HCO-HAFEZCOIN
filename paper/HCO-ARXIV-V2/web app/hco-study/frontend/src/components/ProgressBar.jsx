import { motion } from 'framer-motion'

const FAMILY_LABELS = ['Perceptual', 'Reasoning', 'Attention', 'Biometric']
const TRIALS_PER_SEGMENT = 5

export default function ProgressBar({ current, total, familyIndex }) {
  const segments = 4

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">
          Challenge <span className="text-accent font-semibold">{current}</span> of {total}
        </span>
        <span className="text-sm text-gray-500">
          {FAMILY_LABELS[familyIndex] || ''}
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: segments }).map((_, segIdx) => {
          const segStart = segIdx * TRIALS_PER_SEGMENT
          const segEnd = segStart + TRIALS_PER_SEGMENT
          let fill = 0
          if (current > segEnd) fill = 1
          else if (current > segStart) fill = (current - segStart) / TRIALS_PER_SEGMENT

          const isActive = familyIndex === segIdx

          return (
            <div key={segIdx} className="flex-1 h-2 rounded-full bg-[#2a2a38] overflow-hidden">
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
