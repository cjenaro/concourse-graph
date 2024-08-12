import { json, LoaderFunction, Outlet, useLoaderData } from 'react-router-dom'
import { z } from 'zod'
import {
	fetchCommitActivity,
	getMonthLabels,
	GithubCommitActivitySchema,
} from '../utils'
import Graph from '../components/graph'
import { OnboardingProvider } from '../hooks/use-onboarding-context'

export type LoaderResponse = {
	githubData?: z.infer<typeof GithubCommitActivitySchema>
	monthLabels?: { label?: string; spans: number }[]
	max?: number
	error?: string
}

export function HomeErrorElement() {
	return (
		<div>
			<p>
				There was an error while loading the data needed to render the graph :/
			</p>
		</div>
	)
}

export const loader: LoaderFunction = async () => {
	const result = await fetchCommitActivity()

	if (!result.success) {
		return json<LoaderResponse>({
			error: 'There was an error with the response from github.',
		})
	}

	const max = Math.max.apply(
		Math,
		result.data.flatMap(({ days }) => days),
	)

	return json<LoaderResponse>({
		githubData: result.data,
		monthLabels: getMonthLabels(result.data),
		max,
	})
}

function Home() {
	const data = useLoaderData() as LoaderResponse

	return (
		<OnboardingProvider>
			<div className="container">
				<h1>Concourse</h1>
				{data.error ? <p>{data.error}</p> : <Graph data={data} />}
				<Outlet />
			</div>
		</OnboardingProvider>
	)
}

export default Home
