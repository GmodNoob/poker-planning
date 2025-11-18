import type { TeamConfig } from '../types/team'
import teamConfigData from '../../team.config.json'

export function getTeamConfig(): TeamConfig {
  return teamConfigData as TeamConfig
}

export function getCurrentUser() {
  const config = getTeamConfig()
  const currentUserId = config.team.currentUserId
  return config.team.members.find(member => member.id === currentUserId)
}

export function getTeamMembers() {
  const config = getTeamConfig()
  return config.team.members
}

export function getTeamName() {
  const config = getTeamConfig()
  return config.team.name
}