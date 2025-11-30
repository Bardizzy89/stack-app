interface ProgressIndicatorProps {
  currentStep: 1 | 2 | 3
  stepName: string
}

const STEPS = [
  { number: 1, name: 'Business Profile' },
  { number: 2, name: 'Current Stack' },
  { number: 3, name: 'Results' },
]

export function ProgressIndicator({ currentStep, stepName }: ProgressIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {STEPS.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                  ${
                    step.number === currentStep
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white scale-110 shadow-lg'
                      : step.number < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }
                `}
              >
                {step.number < currentStep ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <div
                className={`
                  mt-2 text-xs font-medium whitespace-nowrap
                  ${step.number === currentStep ? 'text-slate-900' : 'text-slate-500'}
                `}
              >
                {step.name}
              </div>
            </div>

            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <div
                className={`
                  h-0.5 w-16 mx-2 transition-all
                  ${step.number < currentStep ? 'bg-green-500' : 'bg-slate-200'}
                `}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Label */}
      <div className="text-center mt-6">
        <p className="text-sm text-slate-600">
          Step {currentStep} of {STEPS.length}
        </p>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">{stepName}</h2>
      </div>
    </div>
  )
}
