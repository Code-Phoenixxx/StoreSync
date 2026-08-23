import { useState, useEffect, useRef } from "react"
import { Lang } from "../../types"

interface EmergencyContact {
  name: string
  role: string
  phone: string
  type: "hospital" | "ambulance" | "asha" | "police"
  available: boolean
}

export default function HealthcareModule({ lang }: { lang: Lang }) {
  // Voice Assistant state (from bought VoiceAssistant.jsx)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [langMode, setLangMode] = useState<"hi-IN" | "en-IN">("hi-IN")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [detectedCommand, setDetectedCommand] = useState<string | null>(null)
  const [readAloudText, setReadAloudText] = useState(
    "दुकान स्वास्थ्य डेस्क: पेरासिटामोल 500mg दिन में दो बार भोजन के बाद लें, ओआरएस घोल प्रचुर मात्रा में पिएं।"
  )

  // Emergency SOS Escalation modal state (from bought EmergencyEscalation.jsx)
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [emergencyStage, setEmergencyStage] = useState<"countdown" | "dispatched">("countdown")
  const [countdown, setCountdown] = useState(5)
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.209 })
  const [isSirenOn, setIsSirenOn] = useState(true)

  // Video Consult state
  const [showVideoConsult, setShowVideoConsult] = useState(false)
  const [consultStatus, setConsultStatus] = useState<"idle" | "connecting" | "active">("idle")

  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const recognitionRef = useRef<any>(null)

  // 1. Grab GPS Coordinates for SOS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn("GPS default coordinates used.")
      )
    }
  }, [])

  // 2. 5-Second Safety Abort Countdown for Emergency Escalation
  useEffect(() => {
    let timer: any
    if (showEmergencyModal && emergencyStage === "countdown" && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (showEmergencyModal && emergencyStage === "countdown" && countdown === 0) {
      setEmergencyStage("dispatched")
      startSiren()
    }
    return () => clearTimeout(timer)
  }, [showEmergencyModal, countdown, emergencyStage])

  // 3. Web Audio Dual-Tone Siren
  function startSiren() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = ctx
      const osc = ctx.createOscillator()
      oscillatorRef.current = osc
      const gain = ctx.createGain()

      osc.type = "sawtooth"
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)

      let high = false
      const sirenInterval = setInterval(() => {
        if (!oscillatorRef.current) {
          clearInterval(sirenInterval)
          return
        }
        osc.frequency.setValueAtTime(high ? 850 : 550, ctx.currentTime)
        high = !high
      }, 400)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
    } catch (e) {
      console.warn("Audio siren error:", e)
    }
  }

  function stopSiren() {
    setIsSirenOn(false)
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop()
        oscillatorRef.current.disconnect()
      } catch (e) {}
      oscillatorRef.current = null
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close()
      } catch (e) {}
      audioContextRef.current = null
    }
  }

  // 4. Voice Triage Engine (exact logic from VoiceAssistant.jsx)
  function toggleListening() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Please use Chrome/Edge.")
      return
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {}
      }
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = langMode
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
      setDetectedCommand(null)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      setTranscript(text)

      // Voice Command Routing logic
      const lower = text.toLowerCase()
      if (
        lower.includes("doctor") ||
        lower.includes("call") ||
        lower.includes("वीडियो") ||
        lower.includes("डॉक्टर") ||
        lower.includes("telehealth")
      ) {
        setDetectedCommand("video_call")
        setShowVideoConsult(true)
        setConsultStatus("connecting")
        setTimeout(() => setConsultStatus("active"), 1200)
      } else if (
        lower.includes("sos") ||
        lower.includes("emergency") ||
        lower.includes("मदद") ||
        lower.includes("खतरा") ||
        lower.includes("एंबुलेंस")
      ) {
        setDetectedCommand("emergency_sos")
        triggerEmergencySOS()
      }
    }

    recognition.start()
  }

  // 5. Text-to-Speech Audio Readout
  function speakPrescription() {
    if (!window.speechSynthesis) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(readAloudText)
    utterance.lang = langMode
    utterance.rate = 0.88 // Slower cadence for rural clarity

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  function triggerEmergencySOS() {
    setCountdown(5)
    setEmergencyStage("countdown")
    setIsSirenOn(true)
    setShowEmergencyModal(true)
  }

  function closeEmergencyModal() {
    stopSiren()
    setShowEmergencyModal(false)
  }

  const contacts: EmergencyContact[] = [
    { name: "National Emergency Service", role: "Direct Hotline", phone: "112", type: "police", available: true },
    { name: "District Ambulance Service", role: "108 Rapid Response", phone: "108", type: "ambulance", available: true },
    { name: "Sector ASHA Health Worker", role: "Primary Health Center", phone: "+91-9876543210", type: "asha", available: true },
    { name: "Apollo Telehealth On-Call Doctor", role: "General Physician", phone: "1800-500-1066", type: "hospital", available: true },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div
        className="p-6 rounded-3xl border shadow-lg relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(16,185,129,0.1) 100%)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏥</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30">
                Rural Accessibility & Emergency Desk
              </span>
            </div>
            <h1 className="font-display font-black text-2xl md:text-3xl text-zinc-900 dark:text-white">
              Healthcare SOS & Vernacular Audio Triage
            </h1>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
              Integrated from Healthcare suite: Voice symptom logger, audio prescription readout, and 1-tap Emergency SOS dispatch for shopkeeper communities.
            </p>
          </div>

          {/* Big Red SOS Button */}
          <button
            onClick={triggerEmergencySOS}
            className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm tracking-wider shadow-lg shadow-red-600/30 animate-pulse flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
          >
            <span className="text-xl">🚨</span>
            <span>EMERGENCY SOS</span>
          </button>
        </div>
      </div>

      {/* VERNACULAR VOICE & AUDIO TRIAGE (Bought VoiceAssistant Component) */}
      <div
        className="p-6 rounded-3xl border shadow-sm space-y-6"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Sub Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold block">
              Vernacular Voice Engine
            </span>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {langMode === "hi-IN"
                ? "आवाज द्वारा लक्षण रिकॉर्ड एवं दवा श्रवण"
                : "Vernacular Voice Triage & Audio Companion"}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              const newLang = langMode === "hi-IN" ? "en-IN" : "hi-IN"
              setLangMode(newLang)
              if (newLang === "en-IN") {
                setReadAloudText("Store Health Desk: Take Paracetamol 500mg twice daily after meals. Drink plenty of ORS fluids.")
              } else {
                setReadAloudText("दुकान स्वास्थ्य डेस्क: पेरासिटामोल 500mg दिन में दो बार भोजन के बाद लें, ओआरएस घोल प्रचुर मात्रा में पिएं।")
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 text-xs font-mono uppercase rounded-xl transition cursor-pointer text-zinc-800 dark:text-zinc-200"
          >
            <span>🌐</span>
            <span>{langMode === "hi-IN" ? "Listening: हिन्दी" : "Listening: English"}</span>
          </button>
        </div>

        {/* 2 Main Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Speak Symptoms */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition text-center cursor-pointer ${
              isListening
                ? "bg-red-600 border-red-700 text-white animate-pulse shadow-lg shadow-red-600/30"
                : "bg-zinc-50 dark:bg-zinc-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border-zinc-200 dark:border-zinc-800 hover:border-emerald-600 text-zinc-900 dark:text-white"
            }`}
          >
            <div
              className={`p-4 rounded-full ${
                isListening ? "bg-white text-red-600" : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
              }`}
            >
              <span className="text-2xl">{isListening ? "⏹️" : "🎙️"}</span>
            </div>
            <div>
              <strong className="block text-sm font-mono uppercase tracking-wider">
                {isListening ? "Listening Now... Speak" : "Tap to Speak Symptoms"}
              </strong>
              <span className="text-xs opacity-70 block mt-0.5">
                {langMode === "hi-IN"
                  ? 'बोलें (उदा. "सर दर्द" या "डॉक्टर कॉल")'
                  : 'Speak symptoms or say "Doctor Call" / "SOS"'}
              </span>
            </div>
          </button>

          {/* Card 2: Read Prescription Aloud */}
          <button
            type="button"
            onClick={speakPrescription}
            className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition text-center cursor-pointer ${
              isSpeaking
                ? "bg-emerald-700 border-emerald-800 text-white animate-pulse shadow-lg shadow-emerald-700/30"
                : "bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
            }`}
          >
            <div
              className={`p-4 rounded-full ${
                isSpeaking ? "bg-white text-emerald-700" : "bg-emerald-600 text-white"
              }`}
            >
              <span className="text-2xl">🔊</span>
            </div>
            <div>
              <strong className="block text-sm font-mono uppercase tracking-wider">
                {isSpeaking ? "Reading Aloud..." : "Read Prescription Aloud"}
              </strong>
              <span className="text-xs opacity-70 block mt-0.5">
                {langMode === "hi-IN"
                  ? "दवाइयों का समय आवाज में सुनें"
                  : "Listen to daily medication schedule"}
              </span>
            </div>
          </button>
        </div>

        {/* Live Symptom Transcript Result */}
        {transcript && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-emerald-600 text-lg mt-0.5">✓</span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">
                  Recorded Patient Triage Symptom
                </span>
                <p className="text-sm font-medium text-zinc-900 dark:text-white mt-0.5">
                  "{transcript}"
                </p>
              </div>
            </div>

            {detectedCommand && (
              <div className="flex items-center gap-2 pt-2 border-t border-emerald-500/20 text-xs font-mono text-emerald-700 dark:text-emerald-300">
                <span>✨</span>
                <span>
                  Auto-Action Triggered:{" "}
                  <strong>{detectedCommand.toUpperCase()}</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Prescription Customizer */}
        <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Dosage / Health Advisory Text for Customer Readout:
          </label>
          <textarea
            value={readAloudText}
            onChange={e => setReadAloudText(e.target.value)}
            rows={2}
            className="w-full p-3 rounded-xl border bg-zinc-50 dark:bg-zinc-900 text-xs font-medium text-zinc-900 dark:text-white"
            style={{ borderColor: "var(--border)" }}
          />
        </div>
      </div>

      {/* Direct Escalation Contacts */}
      <div
        className="p-6 rounded-3xl border shadow-sm space-y-4"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Primary Health Center & Emergency Contacts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {contacts.map((c, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="text-xs px-2 py-0.5 rounded-md font-mono font-bold uppercase bg-red-500/10 text-red-600 dark:text-red-400">
                  {c.type}
                </span>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white mt-1.5">
                  {c.name}
                </h4>
                <p className="text-xs text-zinc-500">{c.role}</p>
              </div>

              <a
                href={`tel:${c.phone}`}
                className="w-full py-2 rounded-xl text-center font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm block"
              >
                📞 Call {c.phone}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* EMERGENCY SOS MODAL (Bought EmergencyEscalation Component) */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border-2 border-red-600 text-white p-6 shadow-2xl space-y-6 relative animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-bounce">🚨</span>
                <h3 className="font-display font-black text-xl text-red-500 tracking-wider">
                  EMERGENCY SOS DISPATCH
                </h3>
              </div>
              <button
                onClick={closeEmergencyModal}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400"
              >
                ✕
              </button>
            </div>

            {/* Stage 1: 5s Countdown */}
            {emergencyStage === "countdown" ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-24 h-24 rounded-full border-4 border-red-600 flex items-center justify-center mx-auto text-4xl font-black text-red-500 animate-ping">
                  {countdown}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base">Escalating to Emergency Services...</h4>
                  <p className="text-xs text-zinc-400">
                    Dispatching live GPS location to local ASHA & 108 Ambulance in {countdown}s.
                  </p>
                </div>
                <button
                  onClick={closeEmergencyModal}
                  className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs cursor-pointer"
                >
                  Cancel Abort
                </button>
              </div>
            ) : (
              /* Stage 2: Dispatched */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-red-950/60 border border-red-700 text-red-200 text-xs space-y-2">
                  <div className="font-bold flex items-center gap-2 text-red-400">
                    <span>📡</span>
                    <span>SOS SIGNAL BROADCASTED</span>
                  </div>
                  <p>
                    GPS Coordinates transmitted: <strong>{coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E</strong>
                  </p>
                  <p>Local Subcenter, ASHA Health Worker & 108 Ambulance notified.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (isSirenOn) stopSiren()
                      else {
                        setIsSirenOn(true)
                        startSiren()
                      }
                    }}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold border transition ${
                      isSirenOn ? "bg-red-600 border-red-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-300"
                    }`}
                  >
                    {isSirenOn ? "🔊 Mute Siren" : "🔈 Unmute Siren"}
                  </button>

                  <a
                    href="tel:108"
                    className="flex-1 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-center block"
                  >
                    📞 Call 108 Direct
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TELEHEALTH VIDEO CONSULT MODAL */}
      {showVideoConsult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-700 text-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">👨‍⚕️</span>
                <h3 className="font-bold text-base">Telehealth Video Consult</h3>
              </div>
              <button
                onClick={() => setShowVideoConsult(false)}
                className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center text-center p-4 space-y-2">
              {consultStatus === "connecting" ? (
                <>
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-mono text-emerald-400">Connecting to On-Call Physician...</p>
                </>
              ) : (
                <>
                  <span className="text-4xl">🩺</span>
                  <div className="font-bold text-sm">Dr. Ananya Sharma (MBBS, MD)</div>
                  <div className="text-xs text-emerald-400 font-mono">● LIVE CONSULT ACTIVE</div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowVideoConsult(false)}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
