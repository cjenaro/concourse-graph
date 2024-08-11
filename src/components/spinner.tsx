export default function Spinner() {
	return (
		<svg
			className="spinner"
			viewBox="0 0 2 2"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle
				className="path"
				fill="none"
				stroke="currentColor"
				strokeWidth="0.25"
				strokeLinecap="round"
				cx="1"
				cy="1"
				r="0.9"
			/>
		</svg>
	)
}
