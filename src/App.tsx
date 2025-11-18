import { useState } from 'react'
import PlanningSession from './components/PlanningSession'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Poker Planning
          </h1>
          <p className="text-xl text-purple-200">
            Estimation collaborative avec la suite de Fibonacci
          </p>
        </header>

        <PlanningSession />
      </div>
    </div>
  )
}

export default App