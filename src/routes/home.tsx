import {
	json,
	LoaderFunction,
	Outlet,
	useFetcher,
	useLoaderData,
	useSearchParams,
} from 'react-router-dom'
import { z } from 'zod'
import {
	fetchCommitActivity,
	getMonthLabels,
	GithubCommitActivitySchema,
	REPOSITORIES,
} from '../utils'
import Graph from '../components/graph'
import { OnboardingProvider } from '../hooks/use-onboarding-context'
import { useAnimatedDayText } from '../hooks/use-animated-day-text'

export type LoaderResponse = {
	githubData?: z.infer<typeof GithubCommitActivitySchema>
	monthLabels?: { label?: string; spans: number }[]
	max?: number
	error?: string
	repo?: string | null
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

export const loader: LoaderFunction = async ({ request }) => {
	const params = new URL(request.url).searchParams
	const repo = params.get('repo')
	const result = await fetchCommitActivity(repo ? repo : undefined)

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
		repo,
	})
}

function Home() {
	const data = useLoaderData() as LoaderResponse
	const title = useAnimatedDayText()
	const [params] = useSearchParams()
	const fetcher = useFetcher({ key: 'search' })

	return (
		<OnboardingProvider>
			<div className="container">
				<h1>Concourse</h1>
				<fetcher.Form method="get" className="search">
					<select
						onChange={(e) => fetcher.load(`/?repo=${e.target.value}`)}
						name="repo"
						defaultValue={params.get('repo') || undefined}
					>
						{REPOSITORIES.map((repo) => (
							<option value={repo} key={repo}>
								{repo}
							</option>
						))}
					</select>
				</fetcher.Form>
				{data.error ? (
					<p>{data.error}</p>
				) : (
					<Graph data={fetcher.data || data} />
				)}
				{title ? title : null}
				<Outlet />
			</div>
		</OnboardingProvider>
	)
}

export default Home
