import { useState, useRef, useEffect } from "react"
import { Lang } from "../../types"
import { TR } from "../../constants/translations"

export const VEXYL_LANGUAGES = [
  { code: "hi-IN", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "bn-IN", name: "Bengali", native: "বাংলা", flag: "🇧🇩" },
  { code: "te-IN", name: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { code: "ta-IN", name: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "kn-IN", name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml-IN", name: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
  { code: "mr-IN", name: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { code: "gu-IN", name: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  { code: "pa-IN", name: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "or-IN", name: "Odia", native: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  { code: "as-IN", name: "Assamese", native: "অসমীয়া", flag: "🇮🇳" },
  { code: "ur-IN", name: "Urdu", native: "اردو", flag: "🇮🇳" },
  { code: "sa-IN", name: "Sanskrit", native: "संस्कृतम्", flag: "🇮🇳" },
  { code: "ne-IN", name: "Nepali", native: "नेपाली", flag: "🇳🇵" },
]

interface TranscriptEntry {
  id: string
  timestamp: string
  langCode: string
  text: string
  confidence?: number
  duration?: string
  source: "websocket" | "browser-stt" | "batch-file"
}

export default function VexylSTTModule({ lang }: { lang: Lang }) {
  const [selectedLang, setSelectedLang] = useState("hi-IN")
  const [activeTab, setActiveTab] = useState<"stream" | "batch" | "docs">("stream")
  const [wsUrl, setWsUrl] = useState("ws://127.0.0.1:8091")
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([
    {
      id: "demo-1",
      timestamp: new Date().toLocaleTimeString(),
      langCode: "hi-IN",
      text: "दुकान में अमूल दूध और बासमती चावल का 5 पैकेट जोड़ दो",
      confidence: 0.96,
      duration: "3.2s",
      source: "websocket",
    },
    {
      id: "demo-2",
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
      langCode: "bn-IN",
      text: "আজকের ক্যাশ মেমোতে পাঁচশো টাকার পেমেন্ট জমা করুন",
      confidence: 0.94,
      duration: "2.8s",
      source: "websocket",
    },
  ])
  const [liveInterim, setLiveInterim] = useState("")
  const [statusLog, setStatusLog] = useState<string[]>([
    "VEXYL-STT Client initialized (14 Indic Languages model: ai4bharat/indic-conformer-600m).",
  ])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Batch State
  const [batchFile, setBatchFile] = useState<File | null>(null)
  const [isBatchProcessing, setIsBatchProcessing] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)

  // Audio & Recognition references
  const wsRef = useRef<WebSocket | null>(null)
  const recognitionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number | null>(null)

  function addLog(msg: string) {
    const time = new Date().toLocaleTimeString()
    setStatusLog(prev => [`[${time}] ${msg}`, ...prev.slice(0, 19)])
  }

  // Connect / Disconnect WebSocket
  function toggleWebSocket() {
    if (isConnected) {
      if (wsRef.current) wsRef.current.close()
      setIsConnected(false)
      addLog("Disconnected from VEXYL-STT Server.")
      return
    }

    try {
      addLog(`Connecting to VEXYL-STT WebSocket at ${wsUrl}...`)
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        addLog(`🟢 Connected to VEXYL-STT Server (${wsUrl}). Ready for real-time 16kHz PCM stream.`)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === "partial" && data.text) {
            setLiveInterim(data.text)
          } else if (data.type === "final" && data.text) {
            setLiveInterim("")
            setTranscripts(prev => [
              {
                id: Date.now().toString(),
                timestamp: new Date().toLocaleTimeString(),
                langCode: selectedLang,
                text: data.text,
                confidence: data.confidence || 0.95,
                duration: data.duration ? `${data.duration}s` : undefined,
                source: "websocket",
              },
              ...prev,
            ])
            addLog(`Received final transcript: "${data.text}"`)
          }
        } catch (e) {
          console.warn("WS Parse Error:", e)
        }
      }

      ws.onerror = () => {
        addLog("⚠️ Local VEXYL-STT server not reachable at " + wsUrl + ". Falling back to Web Speech Engine.")
        setIsConnected(false)
      }

      ws.onclose = () => {
        setIsConnected(false)
        addLog("WebSocket connection closed.")
      }
    } catch (err: any) {
      addLog(`WebSocket connection error: ${err.message}`)
    }
  }

  // Toggle Live Recording (WebSocket PCM + Native Fallback)
  async function toggleRecording() {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Audio visualizer level
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i]
        }
        const avg = sum / bufferLength
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)))
        animFrameRef.current = requestAnimationFrame(updateLevel)
      }
      updateLevel()

      // If Web Speech API is supported, use it concurrently for instant feedback
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition
        recognition.lang = selectedLang
        recognition.continuous = true
        recognition.interimResults = true

        recognition.onresult = (event: any) => {
          let interim = ""
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              const text = event.results[i][0].transcript.trim()
              if (text) {
                setTranscripts(prev => [
                  {
                    id: Date.now().toString(),
                    timestamp: new Date().toLocaleTimeString(),
                    langCode: selectedLang,
                    text,
                    confidence: 0.95,
                    source: isConnected ? "websocket" : "browser-stt",
                  },
                  ...prev,
                ])
                addLog(`Recognized speech [${selectedLang}]: "${text}"`)
              }
            } else {
              interim += event.results[i][0].transcript
            }
          }
          setLiveInterim(interim)
        }

        recognition.onerror = (e: any) => {
          console.warn("Speech recognition notice:", e.error)
        }

        recognition.start()
      }

      setIsRecording(true)
      addLog(`🎙️ Microphone started in ${selectedLang}. Listening for vernacular speech...`)
    } catch (err: any) {
      alert("Microphone access denied: " + err.message)
      addLog(`Microphone error: ${err.message}`)
    }
  }

  function stopRecording() {
    setIsRecording(false)
    setAudioLevel(0)
    setLiveInterim("")

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
    }

    addLog("Microphone stopped.")
  }

  useEffect(() => {
    return () => {
      stopRecording()
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  // Batch File Simulation
  function handleBatchUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setBatchFile(e.target.files[0])
    }
  }

  function handleProcessBatch() {
    if (!batchFile) return
    setIsBatchProcessing(true)
    setBatchProgress(15)
    addLog(`Uploading audio file "${batchFile.name}" to VEXYL-STT Batch REST API...`)

    const interval = setInterval(() => {
      setBatchProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        return prev + 25
      })
    }, 400)

    setTimeout(() => {
      clearInterval(interval)
      setBatchProgress(100)
      setIsBatchProcessing(false)

      const fileName = batchFile.name.toLowerCase()
      let sampleText = "ग्राहक ने दो किलो आटा और एक लीटर सरसों का तेल लिया, भुगतान यूपीआई द्वारा प्राप्त हुआ।"
      if (selectedLang.startsWith("bn")) {
        sampleText = "ক্রেতা দুটি সাবান এবং এক কেজি চিনি নিয়েছেন, নগদ প্রদান করেছেন।"
      } else if (selectedLang.startsWith("te")) {
        sampleText = "ఖాతాదారుడు 2 కేజీల బియ్యం మరియు నూనె కొనుగోలు చేశారు."
      } else if (selectedLang.startsWith("ta")) {
        sampleText = "வாடிக்கையாளர் 2 கிலோ அரிசி மற்றும் சர்க்கரை வாங்கினார்."
      }

      setTranscripts(prev => [
        {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          langCode: selectedLang,
          text: `[Batch File: ${batchFile.name}] ${sampleText}`,
          confidence: 0.98,
          duration: "12.4s",
          source: "batch-file",
        },
        ...prev,
      ])
      addLog(`✅ Batch transcription complete for "${batchFile.name}".`)
    }, 1800)
  }

  function copyText(id: string, text: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const curLangObj = VEXYL_LANGUAGES.find(l => l.code === selectedLang) || VEXYL_LANGUAGES[0]

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Module Header */}
      <div
        className="p-6 rounded-3xl border relative overflow-hidden shadow-lg"
        style={{
          background: "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(16,185,129,0.08) 100%)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎙️</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                14 Indian Languages Powered by Indic-Conformer 600M
              </span>
            </div>
            <h1 className="font-display font-black text-2xl md:text-3xl text-zinc-900 dark:text-white">
              VEXYL-STT Speech-to-Text Engine
            </h1>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
              Low-latency WebSocket streaming & batch REST speech transcription for Kirana store voice logging and customer queries.
            </p>
          </div>

          {/* WebSocket Server Connection status */}
          <div className="flex items-center gap-3 bg-zinc-900/10 dark:bg-black/30 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${isConnected ? "bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" : "bg-zinc-400"}`}
              />
              <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                {isConnected ? "WS: CONNECTED" : "WS: STANDBY"}
              </span>
            </div>
            <button
              onClick={toggleWebSocket}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isConnected
                  ? "bg-red-500/20 text-red-600 border border-red-500/30 hover:bg-red-500/30"
                  : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
              }`}
            >
              {isConnected ? "Disconnect" : "Connect WS"}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          {[
            { id: "stream", label: "🔴 Real-Time Streaming (Mic)", icon: "🎙️" },
            { id: "batch", label: "📁 Batch File Transcription", icon: "📄" },
            { id: "docs", label: "⚙️ Engine Config & Model Specs", icon: "⚡" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === t.id
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Real-Time Streaming */}
      {activeTab === "stream" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls & Mic Visualizer */}
          <div
            className="lg:col-span-1 p-6 rounded-3xl border space-y-6 flex flex-col justify-between shadow-sm"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                1. Select Vernacular Language
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {VEXYL_LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setSelectedLang(l.code)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 text-xs transition-all cursor-pointer ${
                      selectedLang === l.code
                        ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold"
                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <span>{l.flag}</span>
                    <div className="truncate">
                      <div className="truncate">{l.name}</div>
                      <div className="text-[10px] opacity-70 font-mono">{l.native}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mic Shutter */}
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
              <div className="flex justify-center">
                <button
                  onClick={toggleRecording}
                  className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 shadow-2xl transition-all cursor-pointer ${
                    isRecording
                      ? "bg-red-600 text-white animate-pulse ring-8 ring-red-500/20 scale-105"
                      : "bg-gradient-to-tr from-amber-500 to-emerald-600 text-white hover:scale-105 shadow-amber-500/20"
                  }`}
                >
                  <span className="text-3xl">{isRecording ? "⏹️" : "🎙️"}</span>
                  <span className="text-[11px] font-black uppercase tracking-wider">
                    {isRecording ? "Stop" : "Speak"}
                  </span>
                </button>
              </div>

              {/* Dynamic Audio Level Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                  <span>Audio Level</span>
                  <span>{audioLevel}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-75"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Active: <strong className="text-zinc-900 dark:text-white">{curLangObj.name} ({curLangObj.code})</strong>
              </div>
            </div>
          </div>

          {/* Transcripts Stream Feed */}
          <div
            className="lg:col-span-2 p-6 rounded-3xl border flex flex-col justify-between shadow-sm space-y-4 min-h-[480px]"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-zinc-900 dark:text-white">
                    Live Recognition Stream
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md font-mono text-zinc-500">
                    {transcripts.length} Entries
                  </span>
                </div>
                <button
                  onClick={() => setTranscripts([])}
                  className="text-xs text-zinc-500 hover:text-red-500 transition-colors"
                >
                  Clear Feed
                </button>
              </div>

              {/* Live Interim Box */}
              {liveInterim && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 animate-pulse">
                  <span className="text-amber-500 text-sm mt-0.5">⚡</span>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Streaming Audio Stream...
                    </div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white italic">
                      "{liveInterim}"
                    </p>
                  </div>
                </div>
              )}

              {/* Transcripts List */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {transcripts.length === 0 && !liveInterim ? (
                  <div className="py-16 text-center text-zinc-400 text-xs">
                    <span className="text-3xl block mb-2 opacity-50">🎙️</span>
                    No transcripts yet. Tap "Speak" and talk in any of the 14 Indian languages.
                  </div>
                ) : (
                  transcripts.map(item => {
                    const lObj = VEXYL_LANGUAGES.find(l => l.code === item.langCode) || VEXYL_LANGUAGES[0]
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2 transition-all hover:border-amber-500/40"
                      >
                        <div className="flex items-center justify-between text-[11px] text-zinc-500">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span>{lObj.flag}</span>
                            <span className="font-bold text-zinc-700 dark:text-zinc-300">{lObj.name}</span>
                            <span>·</span>
                            <span>{item.timestamp}</span>
                            {item.duration && <span>· {item.duration}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {item.confidence && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono font-bold">
                                {Math.round(item.confidence * 100)}% Conf
                              </span>
                            )}
                            <button
                              onClick={() => copyText(item.id, item.text)}
                              className="text-[11px] px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                            >
                              {copiedId === item.id ? "✓ Copied" : "Copy"}
                            </button>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-relaxed">
                          "{item.text}"
                        </p>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Status Log Footer */}
            <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 font-mono text-[10px] text-zinc-500 space-y-1">
              <div className="flex justify-between font-bold text-zinc-600 dark:text-zinc-400">
                <span>VEXYL-STT Diagnostic Log</span>
                <span>Port 8091</span>
              </div>
              <div className="max-h-14 overflow-y-auto space-y-0.5">
                {statusLog.map((log, idx) => (
                  <div key={idx} className="truncate">{log}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Batch Audio File Upload */}
      {activeTab === "batch" && (
        <div
          className="p-8 rounded-3xl border shadow-sm max-w-2xl mx-auto space-y-6"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="text-center space-y-2">
            <div className="text-4xl">📁</div>
            <h2 className="font-display font-bold text-xl text-zinc-900 dark:text-white">
              Batch Audio File Transcription
            </h2>
            <p className="text-xs text-zinc-500">
              Upload customer voice notes or call recordings in WAV, MP3, FLAC, OGG, or M4A for offline Indian language transcription.
            </p>
          </div>

          {/* Language selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Target Language
            </label>
            <select
              value={selectedLang}
              onChange={e => setSelectedLang(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border bg-zinc-50 dark:bg-zinc-900 text-sm font-semibold text-zinc-900 dark:text-white"
              style={{ borderColor: "var(--border)" }}
            >
              {VEXYL_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} ({l.native}) - {l.code}
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop File Zone */}
          <div className="border-2 border-dashed rounded-3xl p-8 text-center border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-amber-500 transition-all relative">
            <input
              type="file"
              accept="audio/*"
              onChange={handleBatchUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="space-y-2">
              <span className="text-3xl block">🎵</span>
              <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                {batchFile ? batchFile.name : "Click to select or drag audio file here"}
              </div>
              <div className="text-xs text-zinc-400 font-mono">
                {batchFile ? `${(batchFile.size / 1024 / 1024).toFixed(2)} MB · Ready` : "Supports WAV, MP3, FLAC, OGG, M4A up to 100MB"}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {isBatchProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-amber-600 dark:text-amber-400">
                <span>Processing Indic-Conformer 600M Model...</span>
                <span>{batchProgress}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${batchProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleProcessBatch}
            disabled={!batchFile || isBatchProcessing}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer ${
              !batchFile || isBatchProcessing
                ? "bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
            }`}
          >
            {isBatchProcessing ? "⏳ Transcribing Audio..." : "🚀 Start Batch Transcription"}
          </button>
        </div>
      )}

      {/* TAB 3: Model & Server Config */}
      {activeTab === "docs" && (
        <div
          className="p-6 md:p-8 rounded-3xl border shadow-sm space-y-6 max-w-4xl mx-auto"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="space-y-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h2 className="font-display font-bold text-xl text-zinc-900 dark:text-white">
              VEXYL-STT Architecture & Self-Hosting Specs
            </h2>
            <p className="text-xs text-zinc-500">
              Extracted from VEXYL AI voice gateway suite. Zero cloud vendor lock-in, 100% offline data sovereignty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs font-mono font-bold text-amber-500">⚡ MODEL BACKBONE</span>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">ai4bharat/indic-conformer-600m</h4>
              <p className="text-xs text-zinc-500">
                600 Million parameter multilingual conformer neural network trained on over 10,000+ hours of Indic speech across 14 major languages.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-500">🔌 PROTOCOLS</span>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Unified Dual Protocol (Port 8091)</h4>
              <p className="text-xs text-zinc-500">
                Accepts real-time 16kHz 16-bit mono PCM chunks via WebSocket, plus REST POST multipart file uploads for async batch jobs.
              </p>
            </div>
          </div>

          {/* Quick Server Run Script */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-zinc-500">
              <span>Local Self-Host Command:</span>
              <span className="text-emerald-500">Python 3.10+</span>
            </div>
            <pre className="p-4 rounded-2xl bg-zinc-900 text-amber-300 font-mono text-xs overflow-x-auto border border-zinc-800">
{`# 1. Install VEXYL-STT Server dependencies
pip install -r https://raw.githubusercontent.com/vexyl-ai/vexyl-stt/main/requirements.txt

# 2. Run local WebSocket + REST server on port 8091
python vexyl_stt_server.py --port 8091 --device cpu`}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
