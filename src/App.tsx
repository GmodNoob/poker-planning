import PlanningSession from './components/PlanningSession'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-4">
        <header className="text-center mb-4">
          <h1 className="text-2xl font-bold text-white mb-1">
            Poker Planning
          </h1>
          <p className="text-sm text-purple-200">
            Collaborative estimation with the Fibonacci sequence
          </p>
        </header>

        <PlanningSession />
      </div>
    </div>
  )
}

export default App