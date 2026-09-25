import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import MessageItem from './MessageItem'

export default function MessageList() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    async function loadMessages() {
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setMessages(data)
      }
      setLoading(false)
    }

    loadMessages()

    // Listen for messages inserted or deleted from either device, live.
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((current) => {
            if (current.some((m) => m.id === payload.new.id)) return current
            return [...current, payload.new]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((current) => current.filter((m) => m.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  function handleLocalDelete(id) {
    setMessages((current) => current.filter((m) => m.id !== id))
  }

  if (loading) return <p className="page-loading">Loading messages...</p>
  if (error) return <p className="auth-error">{error}</p>

  if (messages.length === 0) {
    return <p className="empty-state">No messages yet. Send one below!</p>
  }

  return (
    <ul className="message-list">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} onDelete={handleLocalDelete} />
      ))}
      <div ref={bottomRef} />
    </ul>
  )
}
