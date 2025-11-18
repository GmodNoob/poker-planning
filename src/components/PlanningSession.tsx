import { useState, useEffect } from 'react'
import PlanningCard from './PlanningCard'
import { getTeamMembers } from '../lib/teamConfig'
import { usePlanningSession } from '../hooks/usePlanningSession'
import type { TeamMember } from '../types/team'

// Valeurs de la suite de Fibonacci pour le poker planning
const FIBONACCI_VALUES = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'] as const

export default function PlanningSession() {
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null)
  const [selectedValue, setSelectedValue] = useState<number | string | null>(null)

  const teamMembers = getTeamMembers()
  const { votes, showResults, initVotes, vote, reveal, reset } = usePlanningSession()

  // Initialiser les votes quand un utilisateur est sélectionné
  const handleUserSelect = (user: TeamMember) => {
    setCurrentUser(user)
    const initialVotes = teamMembers.map(member => ({
      userId: member.id,
      userName: member.name,
      value: null,
      revealed: false,
    }))
    initVotes(initialVotes)
  }

  const handleVote = (value: number | string) => {
    if (!currentUser) return
    setSelectedValue(value)
    vote(currentUser.id, currentUser.name, value)
  }

  const handleReveal = () => {
    reveal()
  }

  const handleReset = () => {
    setSelectedValue(null)
    reset()
  }

  // Synchroniser selectedValue avec les votes reçus
  useEffect(() => {
    if (currentUser) {
      const myVote = votes.find(v => v.userId === currentUser.id)
      if (myVote?.value !== selectedValue) {
        setSelectedValue(myVote?.value ?? null)
      }
    }
  }, [votes, currentUser])

  const votedCount = votes.filter(vote => vote.value !== null).length

  // Calcul des statistiques
  const numericVotes = votes
    .map(v => v.value)
    .filter((v): v is number => typeof v === 'number' && v !== 0)

  const average = numericVotes.length > 0
    ? (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(1)
    : 'N/A'

  const mode = numericVotes.length > 0
    ? numericVotes.sort((a, b) =>
        numericVotes.filter(v => v === a).length - numericVotes.filter(v => v === b).length
      ).pop()
    : 'N/A'

  // Écran de sélection d'utilisateur
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Qui êtes-vous ?
          </h2>
          <p className="text-purple-200 text-center mb-8">
            Sélectionnez votre nom pour commencer la session de poker planning
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => handleUserSelect(member)}
                className="p-6 rounded-xl bg-white/20 hover:bg-white/30 border-2 border-purple-300/30 hover:border-purple-400 transition-all transform hover:scale-105 hover:shadow-xl"
              >
                <div className="text-xl font-bold text-white mb-2">
                  {member.name}
                </div>
                <div className="text-purple-200 text-sm">
                  {member.role}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Section des participants */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4">
          Participants ({votedCount}/{votes.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {votes.map((vote) => (
            <div
              key={vote.userId}
              className={`
                p-4 rounded-lg transition-all
                ${vote.value !== null
                  ? 'bg-green-500/30 border-2 border-green-400'
                  : 'bg-white/5 border-2 border-purple-300/30'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium truncate">
                  {vote.userName}
                  {vote.userId === currentUser?.id && ' (vous)'}
                </span>
                <div className="ml-2">
                  {showResults ? (
                    <span className="text-2xl font-bold text-white">
                      {vote.value ?? '-'}
                    </span>
                  ) : (
                    <span className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${vote.value !== null ? 'bg-green-400' : 'bg-gray-400'}
                    `}>
                      {vote.value !== null ? '✓' : '?'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques (visible après révélation) */}
      {showResults && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">Résultats</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-purple-200 text-sm mb-1">Moyenne</div>
              <div className="text-3xl font-bold text-white">{average}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-purple-200 text-sm mb-1">Mode</div>
              <div className="text-3xl font-bold text-white">{mode}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-purple-200 text-sm mb-1">Votes</div>
              <div className="text-3xl font-bold text-white">{numericVotes.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Cartes de vote */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Choisissez votre estimation
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {FIBONACCI_VALUES.map((value) => (
            <PlanningCard
              key={value}
              value={value}
              isSelected={selectedValue === value}
              onSelect={() => handleVote(value)}
            />
          ))}
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-center gap-4">
        {!showResults ? (
          <button
            onClick={handleReveal}
            className="px-8 py-4 rounded-lg font-bold text-lg transition-all transform bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
          >
            Révéler les votes {votedCount > 0 && `(${votedCount}/${votes.length})`}
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="px-8 py-4 rounded-lg font-bold text-lg transition-all transform bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
          >
            Nouvelle estimation
          </button>
        )}
      </div>
    </div>
  )
}