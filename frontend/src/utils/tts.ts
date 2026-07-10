/**
 * Client-side Text-to-Speech (TTS) speaker for Spanish language exercises
 */
export const speakSpanish = (text: string) => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    // Cancel any currently playing speech to avoid overlapping
    window.speechSynthesis.cancel();
    
    // Clean up text if it contains blanks or brackets (e.g., Yo ___ pan -> Yo pan)
    const cleanedText = text.replace(/___/g, "").replace(/ {2,}/g, " ").trim();
    if (!cleanedText) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = "es-ES"; // Spanish locale
    utterance.rate = 0.95;    // Natural learning speed

    window.speechSynthesis.speak(utterance);
  }
};
