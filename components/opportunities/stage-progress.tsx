'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const stages = [
  { key: 'intake', label: 'Intake' },
  { key: 'quote', label: 'Quote' },
  { key: 'uw_review', label: 'UW Review' },
  { key: 'bind', label: 'Bind' },
]

interface StageProgressProps {
  currentStage: string
}

export function StageProgress({ currentStage }: StageProgressProps) {
  const currentIndex = stages.findIndex(s => s.key === currentStage)
  const isLost = currentStage === 'lost'

  if (isLost) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700">
          <span className="text-sm font-medium">Lost</span>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const isComplete = index < currentIndex
          const isCurrent = index === currentIndex
          const isUpcoming = index > currentIndex

          return (
            <div key={stage.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                    {
                      'bg-primary border-primary text-primary-foreground': isComplete,
                      'bg-primary border-primary text-primary-foreground': isCurrent,
                      'bg-background border-muted-foreground/30 text-muted-foreground': isUpcoming,
                    }
                  )}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn('mt-2 text-sm font-medium text-center', {
                    'text-foreground': isCurrent || isComplete,
                    'text-muted-foreground': isUpcoming,
                  })}
                >
                  {stage.label}
                </span>
              </div>

              {index < stages.length - 1 && (
                <div
                  className={cn('h-0.5 flex-1 mx-2 transition-colors', {
                    'bg-primary': isComplete,
                    'bg-muted-foreground/30': !isComplete,
                  })}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}