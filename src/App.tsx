import { json, LoaderFunction, useLoaderData } from 'react-router-dom'
import { z } from 'zod'

const GithubCommitActivitySchema = z.array(
	z.object({
		total: z.number(),
		days: z.array(z.number()).length(7),
		week: z.number(),
	}),
)

function getDay(timestamp: number, idx: number) {
	const formatter = new Intl.DateTimeFormat('UTC', {
		month: 'long',
		timeZone: 'UTC',
	})
	const date = new Date(timestamp * 1000 + idx * 24 * 60 * 60 * 1000)
	let suffix = 'st'
	const dayString = date.getUTCDate().toString()
	const lastDigit = Number(dayString[dayString.length - 1])
	if (lastDigit > 3 || lastDigit === 0) {
		suffix = 'th'
	} else if (lastDigit > 2) {
		suffix = 'rd'
	} else if (lastDigit > 1) {
		suffix = 'nd'
	}

	return formatter.format(date) + ' ' + dayString + suffix
}

type LoaderResponse = {
	githubData?: z.infer<typeof GithubCommitActivitySchema>
	monthLabels?: { label?: string; spans: number }[]
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

	const monthLabels: { label?: string; spans: number }[] = []
	let lastMonth
	let spans = 0

	for (let { week } of result.data) {
		const dateAtWeek = new Date(week * 1000)
		const month = getMonthLabel(dateAtWeek)

		// for the 1st  time
		if (!lastMonth) {
			lastMonth = month
		}

		if (month !== lastMonth) {
			monthLabels.push({ label: lastMonth, spans })
			spans = 0
		}

		lastMonth = month
		spans++
	}

	monthLabels.push({ label: lastMonth, spans })

	return json<LoaderResponse>({
		title: 'Concourse',
		githubData: result.data,
		monthLabels,
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

function getMonthLabel(date: Date) {
	const formatter = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		timeZone: 'UTC',
	})

	return formatter.format(date)
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
						<div className="months">
							{data.monthLabels?.map(({ label, spans }, idx) => (
								<span key={`${idx}${label}`} style={{ '--span': spans }}>
									{label}
								</span>
							))}
						</div>
						{!!data?.githubData?.length ? (
							<ul className="weeks">
								<li>
									<span className="day-cell" />
									<span className="day-cell">Mon</span>
									<span className="day-cell" />
									<span className="day-cell">Wed</span>
									<span className="day-cell" />
									<span className="day-cell">Fri</span>
									<span className="day-cell" />
								</li>
								{data.githubData.map(({ week, days }) => (
									<li key={week}>
										{days.map((day, idx) => (
											<span
												key={`${week}-${idx}`}
												className={`cell tooltip level-${getCommitsLevel(levels, day)}`}
												data-tooltip={`${day === 0 ? 'No' : day} contributions on ${getDay(week, idx)}`}
											/>
										))}
									</li>
								))}
							</ul>
						) : null}
						<p className="comparison">
							Less<span className="cell level-5"></span>
							<span className="cell level-1"></span>
							<span className="cell level-2"></span>
							<span className="cell level-3"></span>
							<span className="cell level-4"></span>More
						</p>
					</div>
				</>
			)}
		</div>
	)
}

export default App
