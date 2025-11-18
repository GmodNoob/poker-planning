import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { streamSSE } from 'hono/streaming'
import { serve } from '@hono/node-server'

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

// État partagé de la session
let sessionState: SessionState = {
  votes: [],
  showResults: false
}

// Liste des clients connectés pour SSE
const clients = new Set<(data: SessionState) => void>()

// Fonction pour notifier tous les clients
function broadcast(state: SessionState) {
  clients.forEach(sendUpdate => sendUpdate(state))
}

const app = new Hono()

// CORS pour permettre les requêtes depuis le frontend
app.use('/*', cors())

// Endpoint SSE pour recevoir les mises à jour en temps réel
app.get('/events', (c) => {
  return streamSSE(c, async (stream) => {
    // Fonction pour envoyer les mises à jour à ce client
    const sendUpdate = (data: SessionState) => {
      stream.writeSSE({
        data: JSON.stringify(data),
        event: 'update'
      })
    }

    // Ajouter ce client à la liste
    clients.add(sendUpdate)

    // Envoyer l'état actuel immédiatement
    await stream.writeSSE({
      data: JSON.stringify(sessionState),
      event: 'update'
    })

    // Garder la connexion ouverte
    stream.onAbort(() => {
      clients.delete(sendUpdate)
    })

    // Envoyer un ping toutes les 30 secondes pour garder la connexion vivante
    while (true) {
      await stream.sleep(30000)
      await stream.writeSSE({
        data: 'ping',
        event: 'ping'
      })
    }
  })
})

// Endpoint pour voter
app.post('/vote', async (c) => {
  const { userId, userName, value } = await c.req.json()

  // Chercher si l'utilisateur existe déjà
  const existingVote = sessionState.votes.find(v => v.userId === userId)

  if (existingVote) {
    existingVote.value = value
  } else {
    sessionState.votes.push({
      userId,
      userName,
      value,
      revealed: sessionState.showResults
    })
  }

  broadcast(sessionState)
  return c.json({ success: true })
})

// Endpoint pour initialiser les votes
app.post('/init-votes', async (c) => {
  const { votes } = await c.req.json<{ votes: Vote[] }>()

  // Fusionner avec les votes existants
  votes.forEach(newVote => {
    const existing = sessionState.votes.find(v => v.userId === newVote.userId)
    if (!existing) {
      sessionState.votes.push(newVote)
    }
  })

  broadcast(sessionState)
  return c.json({ success: true })
})

// Endpoint pour révéler les votes
app.post('/reveal', async (c) => {
  sessionState.showResults = true
  sessionState.votes = sessionState.votes.map(vote => ({
    ...vote,
    revealed: true
  }))

  broadcast(sessionState)
  return c.json({ success: true })
})

// Endpoint pour reset
app.post('/reset', async (c) => {
  sessionState.showResults = false
  sessionState.votes = sessionState.votes.map(vote => ({
    ...vote,
    value: null,
    revealed: false
  }))

  broadcast(sessionState)
  return c.json({ success: true })
})

// Endpoint pour obtenir l'état actuel
app.get('/state', (c) => {
  return c.json(sessionState)
})

const port = 3001
console.log(`🚀 Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})