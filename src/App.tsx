import { json, useLoaderData } from "react-router-dom";

function getDay(timestamp: number) {
  const formatter = new Intl.DateTimeFormat("en-US");
  const date = new Date(timestamp * 1000);

  return formatter.format(date);
}

export const loader = async () => {
  const githubData = await fetch(
    "https://api.github.com/repos/facebook/react/stats/commit_activity",
  ).then((blob) => blob.json());
  const max = Math.max.apply(
    Math,
    githubData.flatMap(({ days }) => days),
  );

  return json({
    title: "Concourse",
    githubData,
    max,
  });
};

function App() {
  const data = useLoaderData();

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.max} was the max commits in a day</p>
      {data.githubData.length > 0 ? (
        <ul>
          {data.githubData.map(({ week, total, days }) => (
            <li key={week}>
              total commits: {total} in the week of {getDay(week)}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default App;
