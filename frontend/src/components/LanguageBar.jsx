import LanguageSelector from './LanguageSelector'

export default function LanguageBar({ prominent = false }) {
  if (prominent) {
    return <LanguageSelector prominent />
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <LanguageSelector />
    </div>
  )
}
