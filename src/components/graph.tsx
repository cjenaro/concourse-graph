import { CSSProperties, useRef, useState } from 'react'
import { LoaderResponse } from '../routes/home'
import { getCommitsLevel, getDay } from '../utils'
import { Link } from 'react-router-dom'

type GraphProps = { data: LoaderResponse }

function getActiveClassName(levels: number, day: number, activeLevel?: number) {
	if (activeLevel === undefined) return
	return activeLevel !== getCommitsLevel(levels, day) ? 'disabled' : 'active'
}

export default function Graph({ data }: GraphProps) {
	const [activeLevel, setActiveLevel] = useState<number | undefined>()
	const ref = useRef<HTMLDivElement>(null)
	const filtersRef = useRef(null)
	const levels = Math.floor((data?.max ?? 0) / 4)

	function handleLevelFilter(level?: number) {
		return () => {
			setActiveLevel(level)
		}
	}

	return (
		<>
			<p className="description">
				There were a maximum of {data.max} contributions in any single day, navigate
				to each day's commits by clicking on the graph
			</p>
			<div ref={ref} className="graph">
				<div className="graph-scrollable">
					<div className="graph-content">
						<div className="months">
							{data.monthLabels?.map(({ label, spans }, idx) => (
								<span
									key={`${idx}${label}`}
									style={{ '--span': spans } as CSSProperties}
								>
									{spans > 1 ? label : ''}
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
											<Link
												key={`${week}-${idx}`}
												to={`/${week}/${idx}`}
												className={`cell tooltip level-${getCommitsLevel(levels, day)} ${getActiveClassName(levels, day, activeLevel)}`}
												data-tooltip={`${day === 0 ? 'No' : day} contributions on ${getDay(week, idx)}`}
											>
												<span className="sr-only">
													{day === 0 ? 'No' : day} contributions on{' '}
													{getDay(week, idx)}, fetch all commits for this day.
												</span>
											</Link>
										))}
									</li>
								))}
							</ul>
						) : null}
						<p className="comparison" ref={filtersRef}>
							{activeLevel !== undefined ? (
								<button
									onClick={handleLevelFilter(undefined)}
									className={`cell`}
								>
									<span>&times;</span>
									<span className="sr-only">Remove filter</span>
								</button>
							) : null}
							Less
							<button
								onClick={handleLevelFilter(0)}
								className={`cell level-0 ${activeLevel === 0 ? 'active' : ''}`}
							>
								<span className="sr-only">Filter by level 0</span>
							</button>
							<button
								onClick={handleLevelFilter(1)}
								className={`cell level-1 ${activeLevel === 1 ? 'active' : ''}`}
							>
								<span className="sr-only">Filter by level 1</span>
							</button>
							<button
								onClick={handleLevelFilter(2)}
								className={`cell level-2 ${activeLevel === 2 ? 'active' : ''}`}
							>
								<span className="sr-only">Filter by level 2</span>
							</button>
							<button
								onClick={handleLevelFilter(3)}
								className={`cell level-3 ${activeLevel === 3 ? 'active' : ''}`}
							>
								<span className="sr-only">Filter by level 3</span>
							</button>
							<button
								onClick={handleLevelFilter(4)}
								className={`cell level-4 ${activeLevel === 4 ? 'active' : ''}`}
							>
								<span className="sr-only">Filter by level 4</span>
							</button>
							More
						</p>
					</div>
				</div>
			</div>
		</>
	)
}
