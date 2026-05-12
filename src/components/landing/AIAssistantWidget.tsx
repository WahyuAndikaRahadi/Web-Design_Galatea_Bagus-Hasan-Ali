'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, Loader2, Minus, Bot } from 'lucide-react'

interface Message {
  role: 'user' | 'model'
  text: string
}

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Halo! Aku CollaBot 🤖. Ada yang bisa aku bantu seputar CollaboLab?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }))

      const res = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history })
      })

      const data = await res.json()
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'model', text: data.response }])
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'model',
        text: 'Waduh, koneksiku lagi terganggu. Coba tanya lagi ya! 🙏'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: '8%', right: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-drawer"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              width: '90vw',
              maxWidth: '340px',
              height: 'min(520px, 70vh)',
              backgroundColor: '#FFFFFF',
              border: '3px solid #000000',
              borderRight: 'none',
              boxShadow: '-6px 6px 0px #000000',
              borderRadius: '16px 0 0 16px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              marginRight: '-3px',
              position: 'absolute',
              bottom: 0,
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px',
              background: '#0047FF',
              color: '#fff',
              borderBottom: '3px solid #000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  background: '#FFE500',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #000'
                }}>
                  <Bot size={16} color="#000" />
                </div>
                <span style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 800, fontSize: '18px' }}>CollaBot</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#fff' }}
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: '#F5F0E8'
              }}
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    backgroundColor: m.role === 'user' ? '#FFE500' : '#FFFFFF',
                    color: '#000000',
                    padding: '10px 14px',
                    borderRadius: m.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                    border: '2.5px solid #000',
                    boxShadow: '3px 3px 0px #000',
                    fontSize: '13px',
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 600,
                    lineHeight: '1.5'
                  }}
                >
                  {m.text}
                </div>
              ))}
              {loading && (
                <div style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#FFFFFF',
                  padding: '10px 14px',
                  borderRadius: '12px 12px 12px 0',
                  border: '2.5px solid #000',
                  boxShadow: '3px 3px 0px #000',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Loader2 size={14} className="animate-spin" />
                  <span style={{ fontSize: '12px', fontWeight: 800 }}>Bot Mengetik...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              style={{
                padding: '12px',
                borderTop: '3px solid #000',
                display: 'flex',
                gap: '8px',
                background: '#fff'
              }}
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Tanya dong..."
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '2.5px solid #000',
                  borderRadius: '8px',
                  outline: 'none',
                  fontSize: '14px',
                  fontFamily: 'var(--font-inter)',
                  boxShadow: '2px 2px 0px #000'
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  background: '#00D37F',
                  border: '2.5px solid #000',
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer',
                  boxShadow: '2px 2px 0px #000',
                  transition: 'transform 0.1s'
                }}
              >
                <Send size={18} strokeWidth={3} />
              </button>
            </form>
          </motion.div>
        )}

        {/* Trigger Button - Always anchored to bottom-right space */}
        {!isOpen && (
          <motion.button
            key="chat-trigger"
            onClick={() => setIsOpen(true)}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            whileHover={{ x: -2 }}
            style={{
              backgroundColor: '#FFE500',
              border: '3px solid #000',
              borderRight: 'none',
              padding: '20px 8px',
              borderRadius: '12px 0 0 12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '-4px 4px 0px #000',
              zIndex: 1001,
              marginRight: '-2px',
              position: 'absolute',
              bottom: 0,
            }}
          >
            <MessageSquare size={20} strokeWidth={3} />
            <span style={{
              fontFamily: 'var(--font-space-grotesk)',
              fontWeight: 900,
              fontSize: '13px',
              writingMode: 'vertical-rl',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transform: 'rotate(180deg)',
              margin: '4px 0'
            }}>
              CollaBot
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
