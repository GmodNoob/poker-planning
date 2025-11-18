export interface TeamMember {
  id: string
  name: string
  role: string
}

export interface TeamConfig {
  team: {
    name: string
    members: TeamMember[]
    currentUserId: string
  }
}