export default async function handler(req, res) {
  const username = "adityasengarr01";
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    res.status(500).send("GITHUB_TOKEN is missing");
    return;
  }

  const esc = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  try {
    // --------------------------------------------------
    // 1. GET BASIC GITHUB PROFILE DATA
    // --------------------------------------------------

    const profileResponse = await fetch(
      `https://api.github.com/users/${username}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "github-profile-generator"
        }
      }
    );

    if (!profileResponse.ok) {
      throw new Error("GitHub profile API failed");
    }

    const user = await profileResponse.json();

    // --------------------------------------------------
    // 2. GET CONTRIBUTION DATA USING GITHUB GRAPHQL
    // --------------------------------------------------

    const today = new Date();
    const oneYearAgo = new Date(today);

    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const from = oneYearAgo.toISOString();
    const to = today.toISOString();

    const graphqlQuery = `
      query($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `;

    const graphqlResponse = await fetch(
      "https://api.github.com/graphql",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "github-profile-generator"
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: {
            login: username,
            from,
            to
          }
        })
      }
    );

    if (!graphqlResponse.ok) {
      throw new Error("GitHub GraphQL request failed");
    }

    const graphqlData = await graphqlResponse.json();

    if (graphqlData.errors) {
      throw new Error(
        graphqlData.errors.map((e) => e.message).join(", ")
      );
    }

    const calendar =
      graphqlData.data.user.contributionsCollection.contributionCalendar;

    // --------------------------------------------------
    // 3. PROCESS CONTRIBUTION DATA
    // --------------------------------------------------

    const weeks = calendar.weeks || [];

    const contributionDays = weeks.flatMap(
      (week) => week.contributionDays || []
    );

    const totalContributions = calendar.totalContributions || 0;

    const activeDays = contributionDays.filter(
      (day) => day.contributionCount > 0
    ).length;

    const weeklyTotals = weeks.map((week) =>
      (week.contributionDays || []).reduce(
        (sum, day) => sum + day.contributionCount,
        0
      )
    );

    const bestWeek =
      weeklyTotals.length > 0
        ? Math.max(...weeklyTotals)
        : 0;

    // --------------------------------------------------
    // 4. CREATE SMALL ACTIVITY GRAPH
    // --------------------------------------------------

    const graphWidth = 520;
    const graphHeight = 120;

    const maxWeeklyContribution =
      Math.max(...weeklyTotals, 1);

    const graphPoints = weeklyTotals
      .map((value, index) => {
        const x =
          (index / Math.max(weeklyTotals.length - 1, 1)) *
          graphWidth;

        const y =
          graphHeight -
          (value / maxWeeklyContribution) *
            (graphHeight - 12);

        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    // --------------------------------------------------
    // 5. YOUR PORTRAIT
    // --------------------------------------------------

    const photoUrl =
      "https://raw.githubusercontent.com/adityasengarr01/adityasengarr01-github-profile-generator/main/ChatGPT%20Image%20Sep%202%2C%202026%2C%2003_11_20%20PM.png";

    // --------------------------------------------------
    // 6. SVG
    // --------------------------------------------------

    const svg = `
<svg
  width="1200"
  height="1050"
  viewBox="0 0 1200 1050"
  xmlns="http://www.w3.org/2000/svg"
>

  <defs>

    <linearGradient
      id="terminalGradient"
      x1="0"
      y1="0"
      x2="1"
      y2="1"
    >
      <stop offset="0%" stop-color="#111111"/>
      <stop offset="100%" stop-color="#050505"/>
    </linearGradient>

    <filter id="softGlow">
      <feGaussianBlur
        stdDeviation="3"
        result="blur"
      />

      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

  </defs>

  <!-- BACKGROUND -->

  <rect
    width="1200"
    height="1050"
    fill="#050505"
  />

  <rect
    x="30"
    y="30"
    width="1140"
    height="990"
    rx="18"
    fill="url(#terminalGradient)"
    stroke="#242424"
    stroke-width="2"
  />

  <!-- TERMINAL HEADER -->

  <circle
    cx="65"
    cy="65"
    r="8"
    fill="#555"
  />

  <circle
    cx="90"
    cy="65"
    r="8"
    fill="#555"
  />

  <circle
    cx="115"
    cy="65"
    r="8"
    fill="#555"
  />

  <text
    x="150"
    y="72"
    fill="#777"
    font-size="18"
    font-family="monospace"
  >
    github-profile
  </text>

  <!-- COMMAND -->

  <text
    x="65"
    y="125"
    fill="#777"
    font-size="18"
    font-family="monospace"
  >
    $
  </text>

  <text
    x="88"
    y="125"
    fill="#f1f1f1"
    font-size="18"
    font-family="monospace"
  >
    whoami
  </text>

  <!-- PORTRAIT -->

  <rect
    x="65"
    y="155"
    width="430"
    height="430"
    rx="12"
    fill="#090909"
    stroke="#252525"
  />

  <image
    href="${photoUrl}"
    x="75"
    y="165"
    width="410"
    height="410"
    preserveAspectRatio="xMidYMid meet"
  />

  <!-- NAME -->

  <text
    x="535"
    y="195"
    fill="#f5f5f5"
    font-size="38"
    font-weight="700"
    font-family="Arial, sans-serif"
  >
    ${esc(user.name || username)}
  </text>

  <text
    x="535"
    y="230"
    fill="#777"
    font-size="20"
    font-family="monospace"
  >
    @${esc(username)}
  </text>

  <line
    x1="535"
    y1="255"
    x2="1110"
    y2="255"
    stroke="#292929"
  />

  <!-- PROFILE STATS -->

  <text
    x="535"
    y="300"
    fill="#777"
    font-size="16"
    font-family="monospace"
  >
    repositories
  </text>

  <text
    x="535"
    y="330"
    fill="#ffffff"
    font-size="28"
    font-weight="700"
    font-family="monospace"
  >
    ${user.public_repos}
  </text>


  <text
    x="700"
    y="300"
    fill="#777"
    font-size="16"
    font-family="monospace"
  >
    followers
  </text>

  <text
    x="700"
    y="330"
    fill="#ffffff"
    font-size="28"
    font-weight="700"
    font-family="monospace"
  >
    ${user.followers}
  </text>


  <text
    x="865"
    y="300"
    fill="#777"
    font-size="16"
    font-family="monospace"
  >
    following
  </text>

  <text
    x="865"
    y="330"
    fill="#ffffff"
    font-size="28"
    font-weight="700"
    font-family="monospace"
  >
    ${user.following}
  </text>

  <!-- BIO -->

  <text
    x="535"
    y="390"
    fill="#777"
    font-size="16"
    font-family="monospace"
  >
    about
  </text>

  <text
    x="535"
    y="420"
    fill="#eeeeee"
    font-size="18"
    font-family="Arial, sans-serif"
  >
    ${esc(
      user.bio ||
      "Developer • Student • Building things on the internet"
    )}
  </text>

  <!-- CONTRIBUTION SECTION -->

  <text
    x="65"
    y="640"
    fill="#777"
    font-size="17"
    font-family="monospace"
  >
    $ git contributions --last-year
  </text>

  <text
    x="65"
    y="685"
    fill="#f5f5f5"
    font-size="30"
    font-weight="700"
    font-family="Arial, sans-serif"
  >
    ${totalContributions} contributions in the last year
  </text>

  <!-- ACTIVE DAYS -->

  <text
    x="65"
    y="730"
    fill="#777"
    font-size="16"
    font-family="monospace"
  >
    active days
  </text>

  <text
    x="65"
    y="760"
    fill="#ffffff"
    font-size="27"
    font-weight="700"
    font-family="monospace"
  >
    ${activeDays}
  </text>

  <!-- BEST WEEK -->

  <text
    x="220"
    y="730"
    fill="#777"
    font-size="16"
    font-family="monospace"
  >
    best week
  </text>

  <text
    x="220"
    y="760"
    fill="#ffffff"
    font-size="27"
    font-weight="700"
    font-family="monospace"
  >
    ${bestWeek}
  </text>

  <!-- GRAPH -->

  <g
    transform="translate(500 705)"
  >

    <polyline
      points="${graphPoints}"
      fill="none"
      stroke="#eeeeee"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
      filter="url(#softGlow)"
    />

    <polyline
      points="${graphPoints}"
      fill="none"
      stroke="#ffffff"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

  </g>

  <!-- STACK -->

  <text
    x="65"
    y="835"
    fill="#777"
    font-size="16"
    font-family="monospace"
  >
    stack
  </text>

  <text
    x="65"
    y="865"
    fill="#eeeeee"
    font-size="19"
    font-family="monospace"
  >
    JavaScript • Java • C++ • HTML • CSS • Git
  </text>

  <!-- PROJECTS -->

  <text
    x="65"
    y="915"
    fill="#777"
    font-size="16"
    font-family="monospace"
  >
    projects
  </text>

  <text
    x="65"
    y="945"
    fill="#eeeeee"
    font-size="18"
    font-family="monospace"
  >
    github-profile-generator
  </text>

  <!-- FOOTER -->

  <text
    x="65"
    y="985"
    fill="#555"
    font-size="14"
    font-family="monospace"
  >
    generated dynamically • ${new Date().getFullYear()}
  </text>

</svg>
`;

    // --------------------------------------------------
    // 7. RETURN SVG
    // --------------------------------------------------

    res.setHeader(
      "Content-Type",
      "image/svg+xml; charset=utf-8"
    );

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    res.status(200).send(svg);

  } catch (error) {

    console.error(error);

    res.status(500).send(
      `GitHub profile generator error: ${esc(error.message)}`
    );
  }
}
