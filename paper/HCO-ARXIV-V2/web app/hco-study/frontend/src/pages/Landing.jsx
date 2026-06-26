import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Landing({ setProlificPid, setStudyId }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const prolificPid = params.get('PROLIFIC_PID') || params.get('prolific_pid') || ''
  const studyId = params.get('STUDY_ID') || params.get('study_id') || ''

  const handleStart = () => {
    setProlificPid(prolificPid)
    setStudyId(studyId)
    navigate('/consent')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl w-full text-center"
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
          Real-Time Challenge Study
        </h1>

        <p className="text-gray-400 text-lg leading-relaxed mb-4">
          You will complete a series of quick interactive challenges that test perception,
          reasoning, attention, and speech.
        </p>
        <p className="text-gray-500 mb-10">
          The study takes about 15–20 minutes. Please use a quiet environment with a working microphone.
        </p>

        <motion.button
          onClick={handleStart}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-10 py-4 rounded-xl bg-accent text-background font-semibold text-lg shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-shadow"
        >
          Start Study
        </motion.button>

        {prolificPid && (
          <p className="mt-6 text-xs text-gray-600">Participant ID detected</p>
        )}
      </motion.div>
    </div>
  )
}
