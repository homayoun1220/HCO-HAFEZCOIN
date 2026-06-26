import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Consent() {
  const navigate = useNavigate()
  const [agreed, setAgreed] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-card rounded-2xl border border-[#2a2a38] p-8 md:p-10"
      >
        <h1 className="text-2xl font-bold mb-6">Informed Consent</h1>

        <div className="text-gray-400 space-y-4 text-sm leading-relaxed max-h-96 overflow-y-auto pr-2">
          <p>
            You are invited to participate in a research study investigating human performance
            on real-time interactive challenges. This study is conducted by academic researchers
            and has been reviewed according to institutional ethical guidelines.
          </p>
          <p><strong className="text-gray-300">Purpose:</strong> We aim to measure how quickly and accurately
            people can complete various cognitive and perceptual tasks under time pressure.</p>
          <p><strong className="text-gray-300">Procedure:</strong> You will complete 20 timed challenges
            across four categories, preceded by a brief practice session. Your responses and reaction
            times will be recorded. The session takes approximately 15–20 minutes.</p>
          <p><strong className="text-gray-300">Risks:</strong> There are no anticipated risks beyond
            those encountered in everyday computer use. You may stop at any time without penalty.</p>
          <p><strong className="text-gray-300">Benefits:</strong> There is no direct benefit to you,
            but your participation contributes to scientific knowledge about human-computer interaction
            and security research.</p>
          <p><strong className="text-gray-300">Confidentiality:</strong> Your data will be stored
            anonymously using a randomly generated identifier. No personally identifying information
            will be collected beyond your Prolific ID, which is used only for compensation.</p>
          <p><strong className="text-gray-300">Voluntary participation:</strong> Your participation
            is entirely voluntary. You may withdraw at any time by closing the browser window.</p>
          <p><strong className="text-gray-300">Contact:</strong> If you have questions about this study,
            please contact the research team through Prolific messaging.</p>
        </div>

        <label className="flex items-start gap-3 mt-8 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-[#2a2a38] bg-background accent-accent cursor-pointer"
          />
          <span className="text-gray-300 group-hover:text-white transition-colors">
            I have read and understood the above information, and I agree to participate in this study.
          </span>
        </label>

        <motion.button
          onClick={() => navigate('/practice')}
          disabled={!agreed}
          whileHover={{ scale: agreed ? 1.02 : 1 }}
          whileTap={{ scale: agreed ? 0.98 : 1 }}
          className="mt-6 w-full py-4 rounded-xl bg-accent text-background font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </motion.button>
      </motion.div>
    </div>
  )
}
