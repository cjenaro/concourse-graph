import { json, LoaderFunction, useLoaderData } from 'react-router-dom'
import { z } from 'zod'

const GithubCommitActivitySchema = z.array(
	z.object({
		total: z.number(),
		days: z.array(z.number()).length(7),
		week: z.number(),
	}),
)

function getDay(timestamp: number) {
	const formatter = new Intl.DateTimeFormat('en-US')
	const date = new Date(timestamp * 1000)

	return formatter.format(date)
}

type LoaderResponse = {
	githubData?: z.infer<typeof GithubCommitActivitySchema>
	max?: number
	title?: string
	error?: string
}

export const loader: LoaderFunction = async () => {
	const githubData = await fetch(
		'https://api.github.com/repos/facebook/react/stats/commit_activity',
	).then((blob) => blob.json())
	const result = GithubCommitActivitySchema.safeParse(githubData)

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
		title: 'Concourse',
		githubData: result.data,
		max,
	})
}

function getCommitsLevel(levelGap: number, dayCommits: number) {
	let level = 0
	if (dayCommits < 1) return level

	if (dayCommits < levelGap) {
		level = 1
	} else if (dayCommits < levelGap * 2) {
		level = 2
	} else if (dayCommits < levelGap * 3) {
		level = 3
	} else {
		level = 4
	}

	return level
}

function App() {
	const data = useLoaderData() as LoaderResponse

	const levels = Math.floor((data?.max ?? 0) / 4)
	return (
		<div className="container">
			{data.error ? (
				<p>{data.error}</p>
			) : (
				<>
					<h1>{data.title}</h1>
					<p>{data.max} was the max commits in a day</p>
          <div className="graph">

					{!!data?.githubData?.length ? (
						<ul className="weeks">
							<li>
								<span className='day-cell' />
								<span className='day-cell'>Mon</span>
								<span className='day-cell' />
								<span className='day-cell'>Wed</span>
								<span className='day-cell' />
								<span className='day-cell'>Fri</span>
								<span className='day-cell' />
							</li>
							{data.githubData.map(({ week, days }) => (
								<li key={week}>
									{days.map((day, idx) => (
										<span
											key={`${week}-${idx}`}
											className={`cell level-${getCommitsLevel(levels, day)}`}
										/>
									))}
								</li>
							))}
						</ul>
					) : null}
          <p className='comparison'>
            Less<span className="cell level-5"></span><span className="cell level-1"></span><span className="cell level-2"></span><span className="cell level-3"></span><span className="cell level-4"></span>More
          </p>
          </div>
				</>
			)}
		</div>
	)
}

export default App
