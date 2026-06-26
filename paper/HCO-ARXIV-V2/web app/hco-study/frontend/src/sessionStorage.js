const SESSION_KEY = 'hco_study_session'
const ELIGIBLE_KEY = 'hco_study_eligible'

export function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    /* ignore quota errors */
  }
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function markStudyEligible() {
  try {
    localStorage.setItem(ELIGIBLE_KEY, '1')
  } catch {
    /* ignore */
  }
}

export function isStudyEligible() {
  return localStorage.getItem(ELIGIBLE_KEY) === '1'
}

export function clearStudyEligible() {
  localStorage.removeItem(ELIGIBLE_KEY)
}
