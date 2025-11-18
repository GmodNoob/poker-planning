import { useState, useEffect, useCallback } from 'react'

interface Vote {
  userId: string
  userName: string
  value: number | string | null
  revealed: boolean
}

interface SessionState {
  votes: Vote[]
  showResults: boolean
}

// In production, API is served from same origin. In dev, use port 3001
const API_URL = import.meta.env.DEV ? 'http://localhost:3001' : ''

export function usePlanningSession() {
  const [votes, setVotes] = useState<Vote[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  // Connexion SSE pour recevoir les mises à jour
  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/events`)

    eventSource.addEventListener('update', (event) => {
      const state: SessionState = JSON.parse(event.data)
      setVotes(state.votes)
      setShowResults(state.showResults)
    })

    eventSource.addEventListener('open', () => {
      setIsConnected(true)
      console.log('✅ Connected to SSE server')
    })

    eventSource.addEventListener('error', () => {
      setIsConnected(false)
      console.error('❌ SSE connection error')
    })

    return () => {
      eventSource.close()
      setIsConnected(false)
    }
  }, [])

  // Initialiser les votes pour un utilisateur
  const initVotes = useCallback(async (initialVotes: Vote[]) => {
    try {
      await fetch(`${API_URL}/init-votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votes: initialVotes })
      })
    } catch (error) {
      console.error('Error initializing votes:', error)
    }
  }, [])

  // Envoyer un vote
  const vote = useCallback(async (userId: string, userName: string, value: number | string) => {
    try {
      await fetch(`${API_URL}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName, value })
      })
    } catch (error) {
      console.error('Error voting:', error)
    }
  }, [])

  // Révéler les votes
  const reveal = useCallback(async () => {
    try {
      await fetch(`${API_URL}/reveal`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error revealing votes:', error)
    }
  }, [])

  // Reset la session
  const reset = useCallback(async () => {
    try {
      await fetch(`${API_URL}/reset`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error resetting session:', error)
    }
  }, [])

  return {
    votes,
    showResults,
    isConnected,
    initVotes,
    vote,
    reveal,
    reset
  }
}