import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Reasoning({ challengeData, onSubmit, disabled }) {
  const [answer, setAnswer] = useState('')

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!answer.trim() || disabled) return
    onSubmit({ answer: answer.trim() })
  }

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-center gap-3 text-3xl md:text-4xl font-bold"
      >
        {challengeData.sequence.map((num, idx) => (
          <span key={idx} className="flex items-center gap-3">
            <span className="text-white bg-card px-4 py-2 rounded-lg border border-[#2a2a38]">
              {num}
            </span>
            {idx < challengeData.sequence.length - 1 && (
              <span className="text-accent">→</span>
            )}
          </span>
        ))}
        <span className="text-accent">→</span>
        <span className="text-accent/60 text-5xl">?</span>
      </motion.div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-md">
        <input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={disabled}
          placeholder="Your answer"
          className="flex-1 w-full px-5 py-4 rounded-xl bg-card border border-[#2a2a38] text-white text-xl text-center focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-60"
          autoFocus
        />
        <motion.button
          type="submit"
          disabled={!answer.trim() || disabled}
          whileHover={{ scale: !disabled && answer.trim() ? 1.02 : 1 }}
          whileTap={{ scale: !disabled && answer.trim() ? 0.98 : 1 }}
          className="px-8 py-4 rounded-xl bg-accent text-background font-semibold disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Submit
        </motion.button>
      </form>
    </div>
  )
}
