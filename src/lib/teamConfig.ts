import type { TeamMember } from '../types/team'
import teamConfigData from '../../team.config.json'

// Get team members from env var or config file
function getTeamNames(): string[] {
  // Check for environment variable override (comma-separated list)
  if (typeof import.meta.env.VITE_TEAM_MEMBERS === 'string' && import.meta.env.VITE_TEAM_MEMBERS) {
    return import.meta.env.VITE_TEAM_MEMBERS.split(',').map((name: string) => name.trim())
  }
  return teamConfigData as string[]
}

export function getTeamMembers(): TeamMember[] {
  const names = getTeamNames()
  return names.map((name, index) => ({
    id: String(index + 1),
    name
  }))
}