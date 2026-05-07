import { useState, useEffect, useRef } from 'react'

export interface TelemetryEvent {
  source: string
  phase: string
  event_type: string
  message: string
  data: Record<string, any>
  timestamp: string
}

export function useTelemetry(url: string) {
  const [events, setEvents] = useState<TelemetryEvent[]>([])
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting')
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Clear events when changing the connection (e.g. switching to replay)
    setEvents([])
    
    const connect = () => {
      const socket = new WebSocket(url)
      socketRef.current = socket

      socket.onopen = () => {
        setStatus('connected')
        console.log('Connected to Telemetry')
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const telemetryEvent: TelemetryEvent = {
            ...data,
            timestamp: new Date().toISOString()
          }
          setEvents((prev) => [...prev, telemetryEvent].slice(-100))
        } catch (err) {
          console.error('Failed to parse telemetry event', err)
          // Fallback for plain text messages
          const fallbackEvent: TelemetryEvent = {
            source: 'system',
            phase: 'unknown',
            event_type: 'log',
            message: event.data,
            data: {},
            timestamp: new Date().toISOString()
          }
          setEvents((prev) => [...prev, fallbackEvent].slice(-100))
        }
      }

      socket.onclose = () => {
        setStatus('disconnected')
        // Only reconnect automatically for live telemetry, not replay
        if (url.includes('telemetry')) {
          setTimeout(connect, 5000)
        }
      }

      socket.onerror = () => {
        socket.close()
      }
    }

    connect()

    return () => {
      if (socketRef.current) {
        socketRef.current.onclose = null
        socketRef.current.close()
      }
    }
  }, [url])

  return { events, status }
}
