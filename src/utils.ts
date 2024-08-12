import { redirect } from 'react-router-dom'
import { z } from 'zod'

export const GithubCommitActivitySchema = z.array(
	z.object({
		total: z.number(),
		days: z.array(z.number()).length(7),
		week: z.number(),
	}),
)

export const GithubCommitActivitySingleDaySchema = z.array(
	z.object({
		url: z.string().url(),
		sha: z.string(),
		html_url: z.string().url(),
		commit: z.object({
			url: z.string().url(),
			author: z.object({
				name: z.string(),
				email: z.string(),
				date: z.string(),
			}),
			message: z.string(),
			comment_count: z.number(),
		}),
		author: z.object({
			avatar_url: z.string().url(),
			gists_url: z.string(),
			html_url: z.string().url(),
			id: z.number(),
			login: z.string(),
			starred_url: z.string(),
			name: z.string().optional(),
			email: z.string().optional(),
			starred_at: z.string().optional(),
		}),
		stats: z
			.object({
				additions: z.number(),
				deletions: z.number(),
				total: z.number(),
			})
			.optional(),
	}),
)

export function getDay(timestamp: number, idx: number) {
	const formatter = new Intl.DateTimeFormat('UTC', {
		month: 'long',
		timeZone: 'UTC',
	})
	const date = new Date(timestamp * 1000 + idx * 24 * 60 * 60 * 1000)
	let suffix = 'st'
	const dayString = date.getUTCDate().toString()
	const lastDigit = Number(dayString[dayString.length - 1])
	if (
		lastDigit > 3 ||
		lastDigit === 0 ||
		(Number(dayString) < 20 && Number(dayString) > 10)
	) {
		suffix = 'th'
	} else if (lastDigit > 2) {
		suffix = 'rd'
	} else if (lastDigit > 1) {
		suffix = 'nd'
	}

	return formatter.format(date) + ' ' + dayString + suffix
}

export async function fetchSingleDayCommits(
	week: number,
	day: number,
	repo = 'facebook/react',
) {
	if (!REPOSITORIES.includes(repo)) {
		throw new Error('Pick one of the allowed repositories.')
	}

	const url = `https://api.github.com/repos/${repo}/commits`
	const params = new URLSearchParams()
	const since = new Date(week * 1000 + day * 24 * 60 * 60 * 1000)
	const until = new Date(week * 1000 + (day + 1) * 24 * 60 * 60 * 1000)
	params.set('since', since.toISOString())
	params.set('until', until.toISOString())

	const response = await fetch(url + '?' + params.toString()).then((blob) =>
		blob.json(),
	)

	const { success, data } =
		GithubCommitActivitySingleDaySchema.safeParse(response)

	if (!success) {
		throw redirect('/')
	}

	return data
}

export function getCommitsLevel(levelGap: number, dayCommits: number) {
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

export function getMonthLabel(date: Date) {
	const formatter = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		timeZone: 'UTC',
	})

	return formatter.format(date)
}

export function getMonthLabels(
	data: z.infer<typeof GithubCommitActivitySchema>,
) {
	const monthLabels: { label?: string; spans: number }[] = []
	let lastMonth
	let spans = 0

	for (let { week } of data) {
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

	return monthLabels
}

export const REPOSITORIES = [
	'facebook/react',
	'angular/angular',
	'emberjs/ember.js',
	'vercel/next.js',
	'nuxt/nuxt',
	'flutter/flutter',
	'django/django',
	'rails/rails',
]

export async function fetchCommitActivity(repo = 'facebook/react') {
	if (!REPOSITORIES.includes(repo)) {
		throw new Error('Pick one of the allowed repositories.')
	}
	const githubData = await fetch(
		`https://api.github.com/repos/${repo}/stats/commit_activity`,
	).then((blob) => blob.json())
	const result = GithubCommitActivitySchema.safeParse(githubData)

	return result
}
