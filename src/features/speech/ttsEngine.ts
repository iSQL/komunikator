const PREFERRED_LOCALE = "en-US"

const findSerbianVoice = (): SpeechSynthesisVoice | null => {
  const voices = speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang === PREFERRED_LOCALE) ??
    voices.find((v) => v.lang.startsWith("sr")) ??
    null
  )
}

export const speakText = (text: string, rate = 1.0, pitch = 1.0): Promise<void> => {
  return new Promise((resolve, reject) => {
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = PREFERRED_LOCALE
    utterance.rate = rate
    utterance.pitch = pitch
    const voice = findSerbianVoice()
    if (voice) {
      utterance.voice = voice
    }
    utterance.onend = () => resolve()
    utterance.onerror = (e) => reject(e)
    speechSynthesis.speak(utterance)
  })
}
