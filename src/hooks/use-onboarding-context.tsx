import {
	createContext,
	ReactNode,
	MutableRefObject,
	useContext,
	useEffect,
	useState,
} from 'react'

const OnboardingContext = createContext<{
	addStep: (step: Step) => void
} | null>(null)

type Step = {
	id: string
	elementRef: MutableRefObject<HTMLElement | null>
	message: string
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
	const [wasOnboarded, setWasOnboarded] = useState<boolean | null>(null)
	const [currentStep, setCurrentStep] = useState<number>(0)
	const [stepsHash, setSteps] = useState<{ [id: string]: Step }>({})
	useEffect(() => {
		setWasOnboarded(localStorage.getItem('wasOnboarded') === '1')
	}, [])

	useEffect(() => {
		const steps = Object.values(stepsHash)
		if (wasOnboarded || steps.length === 0) return
		if (currentStep === steps.length) {
			localStorage.setItem('wasOnboarded', '1')
			setWasOnboarded(true)
			const { elementRef } = steps[steps.length - 1]
			if (elementRef.current) {
				delete elementRef.current.dataset['onboardingmessage']
				elementRef.current.classList.remove('highlighted')
			}

			return
		}

		const { elementRef, message } = steps[currentStep]

		if (elementRef?.current) {
			elementRef.current.dataset['onboardingmessage'] = message
			elementRef.current.classList.add('highlighted')
		}

		// cleanup
		if (currentStep > 0) {
			const { elementRef } = steps[currentStep - 1]
			if (elementRef.current) {
				delete elementRef.current.dataset['onboardingmessage']
				elementRef.current.classList.remove('highlighted')
			}
		}
	}, [currentStep, stepsHash])

	function handleStep() {
		setCurrentStep((old) => old + 1)
	}

	function addStep(step: Step) {
		if (wasOnboarded || stepsHash[step.id]) return
		// avoid adding same element twice
		setSteps((old) => {
			return {
				...old,
				[step.id]: step,
			}
		})
	}

	return (
		<OnboardingContext.Provider value={{ addStep }}>
			{children}
			{!wasOnboarded ? (
				<div className="onboarding">
					<button onClick={handleStep}>Next</button>
				</div>
			) : null}
		</OnboardingContext.Provider>
	)
}

export default function useOnboardingContext() {
	const context = useContext(OnboardingContext)

	if (!context) {
		throw new Error(
			'useOnboardingContext should be called inside a OnboardingProvider',
		)
	}

	return context
}
