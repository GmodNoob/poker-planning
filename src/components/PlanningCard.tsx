import { useState } from 'react'

interface PlanningCardProps {
  value: number | string
  isSelected: boolean
  onSelect: () => void
}

export default function PlanningCard({ value, isSelected, onSelect }: PlanningCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      aria-label={value.toString()}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative w-24 h-36 rounded-xl shadow-lg transition-all duration-300 transform
        ${isSelected
          ? 'bg-gradient-to-br from-purple-500 to-pink-500 scale-110 -translate-y-2 shadow-2xl ring-4 ring-purple-300'
          : 'bg-white hover:scale-105 hover:-translate-y-1'
        }
        ${isHovered && !isSelected ? 'shadow-xl' : ''}
      `}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`
          text-4xl font-bold
          ${isSelected ? 'text-white' : 'text-slate-800'}
        `}>
          {value}
        </span>
      </div>

      {/* Petit coin décoratif en haut à gauche */}
      <div className={`
        absolute top-2 left-2 text-sm font-semibold
        ${isSelected ? 'text-white/70' : 'text-slate-400'}
      `}>
        {value}
      </div>

      {/* Petit coin décoratif en bas à droite (inversé) */}
      <div className={`
        absolute bottom-2 right-2 text-sm font-semibold rotate-180
        ${isSelected ? 'text-white/70' : 'text-slate-400'}
      `}>
        {value}
      </div>

      {/* Effet de brillance quand sélectionné */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-xl" />
      )}
    </button>
  )
}