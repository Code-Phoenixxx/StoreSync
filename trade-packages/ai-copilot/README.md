# 🤖 StoreSync AI Copilot & Conversational Chatbot

A high-performance, plug-and-play **AI Store Advisor & Conversational Chatbot** tailored for retail shops and kirana stores.

---

## ✨ Features Included
- **Live Store Intelligence**: Analyzes real-time inventory, today's sales revenue, customer Khata credit, and supplier list.
- **Dual-Engine Architecture**:
  - **Online Cloud LLM**: Seamless Google Gemini 1.5 Flash integration via `VITE_GEMINI_API_KEY`.
  - **Fast Offline Semantic Engine**: 100% functional without internet or API key using built-in retail heuristics.
- **⚡ Suggestion Chips**: 1-click prompts for *Low Stock Items*, *Today's Revenue*, *Highest Khata Debt*, and *Top Margins*.
- **Real-Time Store Pulse**: Live revenue counter, low-stock alerts, and proactive inventory warnings widget.
- **Persistent Chat History**: Stores conversations in `localStorage` with a clear chat button.
- **8 Indian Languages**: English, Hindi, Bengali, Telugu, Tamil, Marathi, Gujarati, Kannada.

---

## 🔌 2-Minute Quick Integration

### 1. Copy Files
Copy the `AICopilotModule.tsx` and `types.ts` into your project:
```
src/modules/copilot/
  ├── AICopilotModule.tsx
```

### 2. Import and Use in Any React Component
```tsx
import AICopilotModule from "./modules/copilot/AICopilotModule"

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <AICopilotModule lang="en" />
    </div>
  )
}
```

### 3. Dependencies
- React 18 / 19
- Tailwind CSS (v3 or v4)
- (Optional) `VITE_GEMINI_API_KEY` in `.env` for cloud Gemini AI.
