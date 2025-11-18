import { test } from '@playwright/test'
import { PlanningPage } from './helpers/planning-page'

test.describe('Poker Planning Session - Multi-User', () => {
  test('Complete session with 4 users voting simultaneously', async ({ browser }) => {
    // Create 4 independent browser contexts (simulates 4 users)
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

    // Reset server before starting
    await fetch('http://localhost:3001/reset', { method: 'POST' })

    // Step 1: All 4 users connect
    await page1.goto('/')
    await page2.goto('/')
    await page3.goto('/')
    await page4.goto('/')

    await user1.selectUser('Aymar')
    await user2.selectUser('Rachid')
    await user3.selectUser('Dalila')
    await user4.selectUser('Lisa')

    // Verify that all see 6 participants
    await user1.expectVoteCount(0, 6)
    await user2.expectVoteCount(0, 6)
    await user3.expectVoteCount(0, 6)
    await user4.expectVoteCount(0, 6)

    // Step 2: Aymar votes 5
    await user1.vote(5)
    await user1.waitForSync(500)

    // Verify that all others see that Aymar has voted
    await user1.expectParticipantVoted('Aymar')
    await user2.expectParticipantVoted('Aymar')
    await user3.expectParticipantVoted('Aymar')
    await user4.expectParticipantVoted('Aymar')

    await user1.expectVoteCount(1, 6)
    await user2.expectVoteCount(1, 6)

    // Step 3: Rachid votes 8
    await user2.vote(8)
    await user2.waitForSync(500)

    await user1.expectParticipantVoted('Rachid')
    await user3.expectParticipantVoted('Rachid')
    await user1.expectVoteCount(2, 6)

    // Step 4: Dalila votes 5
    await user3.vote(5)
    await user3.waitForSync(500)

    await user1.expectVoteCount(3, 6)
    await user4.expectVoteCount(3, 6)

    // Step 5: Lisa votes 13
    await user4.vote(13)
    await user4.waitForSync(500)

    // 4 out of 6 have voted
    await user1.expectVoteCount(4, 6)
    await user2.expectVoteCount(4, 6)

    // Verify that all see all votes (without values)
    await user1.expectParticipantVoted('Aymar')
    await user1.expectParticipantVoted('Rachid')
    await user1.expectParticipantVoted('Dalila')
    await user1.expectParticipantVoted('Lisa')

    // Step 6: Aymar reveals the votes
    await user1.revealVotes()
    await user1.waitForSync(500)

    // All see the revealed results
    await user1.expectRevealedVote('Aymar', 5)
    await user1.expectRevealedVote('Rachid', 8)
    await user1.expectRevealedVote('Dalila', 5)
    await user1.expectRevealedVote('Lisa', 13)

    await user2.expectRevealedVote('Aymar', 5)
    await user2.expectRevealedVote('Rachid', 8)

    await user3.expectRevealedVote('Dalila', 5)
    await user3.expectRevealedVote('Lisa', 13)

    // Verify statistics
    // Average: (5 + 8 + 5 + 13) / 4 = 7.8
    // Mode: 5 (appears 2 times)
    // Votes: 4
    await user1.expectStatistics('7.8', '5', '4')
    await user2.expectStatistics('7.8', '5', '4')

    // Step 7: Reset for new estimate
    await user1.resetSession()
    await user1.waitForSync(500)

    // All see the reset
    await user1.expectVoteCount(0, 6)
    await user2.expectVoteCount(0, 6)
    await user3.expectVoteCount(0, 6)
    await user4.expectVoteCount(0, 6)

    await user1.expectParticipantNotVoted('Aymar')
    await user2.expectParticipantNotVoted('Rachid')
    await user3.expectParticipantNotVoted('Dalila')
    await user4.expectParticipantNotVoted('Lisa')

    // Cleanup
    await context1.close()
    await context2.close()
    await context3.close()
    await context4.close()
  })

  test('Reveal before everyone has voted', async ({ browser }) => {
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

    await user1.selectUser('Aymar')
    await user2.selectUser('Rachid')

    // Only Aymar votes
    await user1.vote(8)
    await user1.waitForSync(500)

    await user1.expectVoteCount(1, 6)

    // Aymar reveals even though not everyone has voted
    await user1.revealVotes()
    await user1.waitForSync(500)

    // Revealed votes show "-" for those who haven't voted
    await user1.expectRevealedVote('Aymar', 8)
    await user1.expectRevealedVote('Rachid', '-')
    await user1.expectRevealedVote('Dalila', '-')
    await user1.expectRevealedVote('Lisa', '-')

    await user2.expectRevealedVote('Aymar', 8)

    // Cleanup
    await context1.close()
    await context2.close()
  })

  test('New user joins an ongoing session', async ({ browser }) => {
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()

    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    const user1 = new PlanningPage(page1)
    const user2 = new PlanningPage(page2)

    // Reset
    await fetch('http://localhost:3001/reset', { method: 'POST' })

    // Aymar connects and votes
    await page1.goto('/')
    await user1.selectUser('Aymar')
    await user1.vote(5)
    await user1.waitForSync(500)

    // Rachid connects afterwards
    await page2.goto('/')
    await user2.selectUser('Rachid')
    await user2.waitForSync(500)

    // Rachid sees that Aymar has already voted
    await user2.expectParticipantVoted('Aymar')
    await user2.expectVoteCount(1, 6)

    // Rachid also votes
    await user2.vote(8)
    await user2.waitForSync(500)

    // Aymar sees Rachid's vote
    await user1.expectParticipantVoted('Rachid')
    await user1.expectVoteCount(2, 6)

    // Cleanup
    await context1.close()
    await context2.close()
  })
})