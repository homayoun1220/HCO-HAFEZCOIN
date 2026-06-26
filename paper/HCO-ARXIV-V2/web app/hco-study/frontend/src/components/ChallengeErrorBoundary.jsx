import { Component } from 'react'
import { motion } from 'framer-motion'

export default class ChallengeErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Challenge render error:', error, info)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center gap-4 text-center max-w-md mx-auto p-6">
          <p className="text-danger font-medium">Something went wrong loading this challenge.</p>
          <p className="text-sm text-gray-500">Please try again or refresh the page.</p>
          <motion.button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl bg-accent text-background font-semibold"
          >
            Retry
          </motion.button>
        </div>
      )
    }

    return this.props.children
  }
}
