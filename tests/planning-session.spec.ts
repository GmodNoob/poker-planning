import { test, expect } from '@playwright/test'
import { PlanningPage } from './helpers/planning-page'

test.describe('Poker Planning Session - Multi-User', () => {
  test('Session complète avec 4 utilisateurs votant simultanément', async ({ browser }) => {
    // Créer 4 contextes de navigation indépendants (simule 4 utilisateurs)
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    const context3 = await browser.newContext()
    const context4 = await browser.newContext()

    const page1 = await context1.newPage()
    const page2 = await context2.newPage()
    const page3 = await context3.newPage()
    const page4 = await context4.newPage()

    const user1 = new PlanningPage(page1)
    const user2 = new PlanningPage(page2)
    const user3 = new PlanningPage(page3)
    const user4 = new PlanningPage(page4)

    // Reset du serveur avant de commencer
    await fetch('http://localhost:3001/reset', { method: 'POST' })

    // Étape 1: Les 4 utilisateurs se connectent
    await page1.goto('/')
    await page2.goto('/')
    await page3.goto('/')
    await page4.goto('/')

    await user1.selectUser('John Doe')
    await user2.selectUser('Jane Smith')
    await user3.selectUser('Bob Wilson')
    await user4.selectUser('Alice Brown')

    // Vérifier que tous voient les 4 participants
    await user1.expectVoteCount(0, 4)
    await user2.expectVoteCount(0, 4)
    await user3.expectVoteCount(0, 4)
    await user4.expectVoteCount(0, 4)

    // Étape 2: John vote 5
    await user1.vote(5)
    await user1.waitForSync(500)

    // Vérifier que tous les autres voient que John a voté
    await user1.expectParticipantVoted('John Doe')
    await user2.expectParticipantVoted('John Doe')
    await user3.expectParticipantVoted('John Doe')
    await user4.expectParticipantVoted('John Doe')

    await user1.expectVoteCount(1, 4)
    await user2.expectVoteCount(1, 4)

    // Étape 3: Jane vote 8
    await user2.vote(8)
    await user2.waitForSync(500)

    await user1.expectParticipantVoted('Jane Smith')
    await user3.expectParticipantVoted('Jane Smith')
    await user1.expectVoteCount(2, 4)

    // Étape 4: Bob vote 5
    await user3.vote(5)
    await user3.waitForSync(500)

    await user1.expectVoteCount(3, 4)
    await user4.expectVoteCount(3, 4)

    // Étape 5: Alice vote 13
    await user4.vote(13)
    await user4.waitForSync(500)

    // Tous ont voté
    await user1.expectVoteCount(4, 4)
    await user2.expectVoteCount(4, 4)

    // Vérifier que tous voient tous les votes (sans les valeurs)
    await user1.expectParticipantVoted('John Doe')
    await user1.expectParticipantVoted('Jane Smith')
    await user1.expectParticipantVoted('Bob Wilson')
    await user1.expectParticipantVoted('Alice Brown')

    // Étape 6: John révèle les votes
    await user1.revealVotes()
    await user1.waitForSync(500)

    // Tous voient les résultats révélés
    await user1.expectRevealedVote('John Doe', 5)
    await user1.expectRevealedVote('Jane Smith', 8)
    await user1.expectRevealedVote('Bob Wilson', 5)
    await user1.expectRevealedVote('Alice Brown', 13)

    await user2.expectRevealedVote('John Doe', 5)
    await user2.expectRevealedVote('Jane Smith', 8)

    await user3.expectRevealedVote('Bob Wilson', 5)
    await user3.expectRevealedVote('Alice Brown', 13)

    // Vérifier les statistiques
    // Moyenne: (5 + 8 + 5 + 13) / 4 = 7.8
    // Mode: 5 (apparaît 2 fois)
    // Votes: 4
    await user1.expectStatistics('7.8', '5', '4')
    await user2.expectStatistics('7.8', '5', '4')

    // Étape 7: Reset pour nouvelle estimation
    await user1.resetSession()
    await user1.waitForSync(500)

    // Tous voient le reset
    await user1.expectVoteCount(0, 4)
    await user2.expectVoteCount(0, 4)
    await user3.expectVoteCount(0, 4)
    await user4.expectVoteCount(0, 4)

    await user1.expectParticipantNotVoted('John Doe')
    await user2.expectParticipantNotVoted('Jane Smith')
    await user3.expectParticipantNotVoted('Bob Wilson')
    await user4.expectParticipantNotVoted('Alice Brown')

    // Cleanup
    await context1.close()
    await context2.close()
    await context3.close()
    await context4.close()
  })

  test('Révélation avant que tous aient voté', async ({ browser }) => {
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()

    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    const user1 = new PlanningPage(page1)
    const user2 = new PlanningPage(page2)

    // Reset
    await fetch('http://localhost:3001/reset', { method: 'POST' })

    await page1.goto('/')
    await page2.goto('/')

    await user1.selectUser('John Doe')
    await user2.selectUser('Jane Smith')

    // Seulement John vote
    await user1.vote(8)
    await user1.waitForSync(500)

    await user1.expectVoteCount(1, 4)

    // John révèle même si tout le monde n'a pas voté
    await user1.revealVotes()
    await user1.waitForSync(500)

    // Les votes révélés montrent "-" pour ceux qui n'ont pas voté
    await user1.expectRevealedVote('John Doe', 8)
    await user1.expectRevealedVote('Jane Smith', '-')
    await user1.expectRevealedVote('Bob Wilson', '-')
    await user1.expectRevealedVote('Alice Brown', '-')

    await user2.expectRevealedVote('John Doe', 8)

    // Cleanup
    await context1.close()
    await context2.close()
  })

  test('Nouveau utilisateur rejoint une session en cours', async ({ browser }) => {
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()

    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    const user1 = new PlanningPage(page1)
    const user2 = new PlanningPage(page2)

    // Reset
    await fetch('http://localhost:3001/reset', { method: 'POST' })

    // John se connecte et vote
    await page1.goto('/')
    await user1.selectUser('John Doe')
    await user1.vote(5)
    await user1.waitForSync(500)

    // Jane se connecte après
    await page2.goto('/')
    await user2.selectUser('Jane Smith')
    await user2.waitForSync(500)

    // Jane voit que John a déjà voté
    await user2.expectParticipantVoted('John Doe')
    await user2.expectVoteCount(1, 4)

    // Jane vote aussi
    await user2.vote(8)
    await user2.waitForSync(500)

    // John voit le vote de Jane
    await user1.expectParticipantVoted('Jane Smith')
    await user1.expectVoteCount(2, 4)

    // Cleanup
    await context1.close()
    await context2.close()
  })
})