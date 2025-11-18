import { Page, expect } from '@playwright/test'

export class PlanningPage {
  constructor(private page: Page) {}

  // Sélectionner un utilisateur
  async selectUser(userName: string) {
    await this.page.getByRole('button', { name: userName }).click()
    await expect(this.page.getByText('Choisissez votre estimation')).toBeVisible()
  }

  // Voter avec une valeur spécifique
  async vote(value: string | number) {
    const cardButton = this.page.getByLabel(value.toString(), { exact: true })
    await cardButton.click()

    // Attendre que la carte soit sélectionnée (optionnel, peut causer des timeouts)
    await this.page.waitForTimeout(300)
  }

  // Vérifier qu'un participant a voté
  async expectParticipantVoted(userName: string) {
    const participantCard = this.page.locator(`div:has-text("${userName}")`).first()
    await expect(participantCard).toContainText('✓')
  }

  // Vérifier qu'un participant n'a pas voté
  async expectParticipantNotVoted(userName: string) {
    const participantCard = this.page.locator(`div:has-text("${userName}")`).first()
    await expect(participantCard).toContainText('?')
  }

  // Révéler les votes
  async revealVotes() {
    await this.page.getByRole('button', { name: /Révéler les votes/ }).click()
  }

  // Vérifier le résultat d'un vote révélé
  async expectRevealedVote(userName: string, value: string | number) {
    const participantCard = this.page.locator(`div:has-text("${userName}")`).first()
    await expect(participantCard).toContainText(value.toString())
  }

  // Vérifier les statistiques
  async expectStatistics(average: string, mode: string, votes: string) {
    await expect(this.page.getByText('Résultats')).toBeVisible()

    const avgSection = this.page.locator('div:has-text("Moyenne")').first()
    await expect(avgSection).toContainText(average)

    const modeSection = this.page.locator('div:has-text("Mode")').first()
    await expect(modeSection).toContainText(mode)

    const votesSection = this.page.locator('div:has-text("Votes")').nth(1)
    await expect(votesSection).toContainText(votes)
  }

  // Nouvelle estimation
  async resetSession() {
    await this.page.getByRole('button', { name: 'Nouvelle estimation' }).click()
    await expect(this.page.getByText('Choisissez votre estimation')).toBeVisible()
  }

  // Vérifier le nombre de votes
  async expectVoteCount(voted: number, total: number) {
    await expect(this.page.getByText(`Participants (${voted}/${total})`)).toBeVisible()
  }

  // Attendre la synchronisation SSE
  async waitForSync(timeoutMs: number = 1000) {
    await this.page.waitForTimeout(timeoutMs)
  }
}