import { useNavigation } from 'react-router-dom'
import Spinner from './spinner'
import { z } from 'zod'
import { GithubCommitActivitySingleDaySchema } from '../utils'
import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export default function CommitMessage({
	commit,
}: {
	commit: z.infer<typeof GithubCommitActivitySingleDaySchema>[number]
}) {
    const [expanded, setExpanded] = useState(false)
	const { sha, html_url, author, commit: c } = commit
    const pRef = useRef(null)

    function toggle() { 
        setExpanded(o => !o)
    }

    useGSAP(() => {
        if (!pRef.current) return;

        gsap.to(pRef.current, {
            height: expanded ? 'auto' : '2ch',
            duration: 0.3
        })
    }, [expanded])

	const navigation = useNavigation()
	return (
		<li key={sha} className="commit">
			<a href={html_url} aria-disabled={navigation.state !== 'idle'}>
				{sha.substring(0, 6)}
				{navigation.state === 'loading' ? <Spinner /> : null}
			</a>
			<img
				width={20}
				height={20}
				src={author.avatar_url}
				alt="Author profile picture."
			/>
			<span>{c.author.name}</span>
			<a href={author.html_url}>{author.login}</a>
			<p ref={pRef}>{c.message}</p>
            <button onClick={toggle}>show {expanded ? 'less' : 'more'}</button>
		</li>
	)
}
