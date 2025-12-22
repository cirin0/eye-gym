import { TextToSpeech } from '@capacitor-community/text-to-speech'
import { Capacitor } from '@capacitor/core'

export async function speak(text: string, rate = 1.0) {
  if (!Capacitor.isNativePlatform()) {
    return speakWeb(text, rate)
  }

  try {
    await TextToSpeech.speak({
      text,
      lang: 'uk-UA',
      rate,
      pitch: 1.0,
      volume: 1.0,
    })
  } catch (error) {
    console.error('TTS Error:', error)
    speakWeb(text, rate)
  }
}

export async function stopSpeak() {
  if (!Capacitor.isNativePlatform()) {
    window.speechSynthesis.cancel()
    return
  }

  try {
    await TextToSpeech.stop()
  } catch (error) {
    console.error('Stop TTS Error:', error)
    window.speechSynthesis.cancel()
  }
}

function speakWeb(text: string, rate: number) {
  return new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'uk-UA'
    utterance.rate = rate
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onend = () => resolve()
    utterance.onerror = () => resolve() // Не кидаємо помилку

    window.speechSynthesis.speak(utterance)
  })
}
