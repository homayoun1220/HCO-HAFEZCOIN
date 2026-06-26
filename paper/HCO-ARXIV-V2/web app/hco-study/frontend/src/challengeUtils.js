const FAMILY_REQUIRED_FIELDS = {
  perceptual: ['original_b64', 'options'],
  reasoning: ['sequence'],
  attention: ['waypoints', 'stop_time', 'canvas_size'],
  biometric: ['phrase'],
}

export function isChallengeDataReady(family, data) {
  if (!family || !data || typeof data !== 'object') return false

  const required = FAMILY_REQUIRED_FIELDS[family]
  if (!required) return false

  return required.every((field) => {
    const value = data[field]
    if (value == null) return false
    if (Array.isArray(value)) return value.length > 0
    return true
  })
}
