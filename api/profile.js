export default async function handler(req, res) {
  const username = "adityasengarr01";
  const token = process.env.GITHUB_TOKEN;

  const esc = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  try {
    // ==============================
    // GITHUB PROFILE
    // ==============================

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
      throw new Error("GitHub profile request failed");
    }

    const user = await profileResponse.json();

    // ==============================
    // CONTRIBUTIONS
    // ==============================

    const today = new Date();
    const fromDate = new Date(today);

    fromDate.setFullYear(today.getFullYear() - 1);

    const query = `
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

    const contributionResponse = await fetch(
      "https://api.github.com/graphql",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "github-profile-generator"
        },
        body: JSON.stringify({
          query,
          variables: {
            login: username,
            from: fromDate.toISOString(),
            to: today.toISOString()
          }
        })
      }
    );

    const contributionData = await contributionResponse.json();

    if (contributionData.errors) {
      throw new Error(
        contributionData.errors.map((e) => e.message).join(", ")
      );
    }

    const calendar =
      contributionData.data.user.contributionsCollection
        .contributionCalendar;

    const weeks = calendar.weeks || [];

    const days = weeks.flatMap(
      (week) => week.contributionDays || []
    );

    const totalContributions =
      calendar.totalContributions || 0;

    const activeDays = days.filter(
      (day) => day.contributionCount > 0
    ).length;

    const weeklyTotals = weeks.map((week) =>
      week.contributionDays.reduce(
        (sum, day) => sum + day.contributionCount,
        0
      )
    );

    const bestWeek =
      weeklyTotals.length > 0
        ? Math.max(...weeklyTotals)
        : 0;

    // ==============================
    // ACTIVITY GRAPH
    // ==============================

    const graphWidth = 620;
    const graphHeight = 120;

    const maxValue = Math.max(
      ...weeklyTotals,
      1
    );

    const points = weeklyTotals
      .map((value, index) => {
        const x =
          (index /
            Math.max(weeklyTotals.length - 1, 1)) *
          graphWidth;

        const y =
          graphHeight -
          (value / maxValue) *
            (graphHeight - 15);

        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    // ==============================
    // PORTRAIT
    // ==============================

    const photoUrl =
      "https://raw.githubusercontent.com/adityasengarr01/adityasengarr01-github-profile-generator/main/ChatGPT%20Image%20Sep%202%2C%202026%2C%2003_11_20%20PM.png";

    // ==============================
    // SVG
    // ==============================

    const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1200"
  height="1100"
  viewBox="0 0 1200 1100"
>

<defs>

  <filter id="glow">
    <feGaussianBlur
      stdDeviation="2"
      result="blur"
    />
    <feMerge>
      <feMergeNode in="blur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>

  <clipPath id="portraitClip">
    <rect
      x="70"
      y="135"
      width="430"
      height="430"
      rx="8"
    />
  </clipPath>

</defs>

<!-- ================================= -->
<!-- BACKGROUND -->
<!-- ================================= -->

<rect
  width="1200"
  height="1100"
  fill="#050505"
/>

<!-- MAIN TERMINAL -->
<rect
  x="28"
  y="28"
  width="1144"
  height="1044"
  rx="12"
  fill="#070707"
  stroke="#252525"
  stroke-width="2"
/>

<!-- ================================= -->
<!-- TERMINAL BAR -->
<!-- ================================= -->

<circle cx="58" cy="58" r="6" fill="#555"/>
<circle cx="80" cy="58" r="6" fill="#555"/>
<circle cx="102" cy="58" r="6" fill="#555"/>

<text
  x="130"
  y="64"
  fill="#666"
  font-family="monospace"
  font-size="15"
>
github.com/${esc(username)}
</text>

<!-- ================================= -->
<!-- COMMAND -->
<!-- ================================= -->

<text
  x="65"
  y="105"
  fill="#666"
  font-family="monospace"
  font-size="15"
>
$
</text>

<text
  x="85"
  y="105"
  fill="#eee"
  font-family="monospace"
  font-size="15"
>
whoami
</text>

<!-- ================================= -->
<!-- PORTRAIT -->
<!-- ================================= -->

<rect
  x="65"
  y="130"
  width="440"
  height="440"
  rx="10"
  fill="#030303"
  stroke="#202020"
/>

<image
  href="${photoUrl}"
  x="75"
  y="140"
  width="420"
  height="420"
  preserveAspectRatio="xMidYMid meet"
  clip-path="url(#portraitClip)"
/>

<!-- ================================= -->
<!-- PROFILE -->
<!-- ================================= -->

<text
  x="545"
  y="175"
  fill="#f5f5f5"
  font-family="Arial, sans-serif"
  font-size="42"
  font-weight="700"
>
${esc(user.name || "Aditya")}
</text>

<text
  x="548"
  y="207"
  fill="#666"
  font-family="monospace"
  font-size="16"
>
@${esc(username)}
</text>

<line
  x1="545"
  y1="235"
  x2="1115"
  y2="235"
  stroke="#242424"
/>

<!-- PROFILE DATA -->

<text
  x="548"
  y="275"
  fill="#666"
  font-family="monospace"
  font-size="14"
>
repositories
</text>

<text
  x="548"
  y="305"
  fill="#fff"
  font-family="monospace"
  font-size="25"
  font-weight="700"
>
${user.public_repos}
</text>

<text
  x="700"
  y="275"
  fill="#666"
  font-family="monospace"
  font-size="14"
>
followers
</text>

<text
  x="700"
  y="305"
  fill="#fff"
  font-family="monospace"
  font-size="25"
  font-weight="700"
>
${user.followers}
</text>

<text
  x="850"
  y="275"
  fill="#666"
  font-family="monospace"
  font-size="14"
>
following
</text>

<text
  x="850"
  y="305"
  fill="#fff"
  font-family="monospace"
  font-size="25"
  font-weight="700"
>
${user.following}
</text>

<!-- ABOUT -->

<text
  x="548"
  y="360"
  fill="#666"
  font-family="monospace"
  font-size="14"
>
about
</text>

<text
  x="548"
  y="390"
  fill="#eee"
  font-family="Arial, sans-serif"
  font-size="17"
>
${esc(
  user.bio ||
  "CS student | Java, C, C++ & SQL (basics) | GitHub learner"
)}
</text>

<!-- LOCATION -->

<text
  x="548"
  y="435"
  fill="#666"
  font-family="monospace"
  font-size="14"
>
location
</text>

<text
  x="548"
  y="465"
  fill="#eee"
  font-family="monospace"
  font-size="16"
>
${esc(user.location || "India")}
</text>

<!-- WEBSITE -->

<text
  x="548"
  y="510"
  fill="#666"
  font-family="monospace"
  font-size="14"
>
status
</text>

<text
  x="548"
  y="540"
  fill="#eee"
  font-family="monospace"
  font-size="16"
>
building &amp; learning
</text>

<!-- ================================= -->
<!-- CONTRIBUTIONS -->
<!-- ================================= -->

<text
  x="65"
  y="625"
  fill="#666"
  font-family="monospace"
  font-size="15"
>
$ git contributions --last-year
</text>

<text
  x="65"
  y="675"
  fill="#f5f5f5"
  font-family="Arial, sans-serif"
  font-size="31"
  font-weight="700"
>
${totalContributions} contributions in the last year
</text>

<!-- ACTIVE DAYS -->

<text
  x="65"
  y="720"
  fill="#666"
  font-family="monospace"
  font-size="14"
>
active days
</text>

<text
  x="65"
  y="750"
  fill="#fff"
  font-family="monospace"
  font-size="25"
  font-weight="700"
>
${activeDays}
</text>

<!-- BEST WEEK -->

<text
  x="210"
  y="720"
  fill="#666"
  font-family="monospace"
  font-size="14"
>
best week
</text>

<text
  x="210"
  y="750"
  fill="#fff"
  font-family="monospace"
  font-size="25"
  font-weight="700"
>
${bestWeek}
</text>

<!-- ================================= -->
<!-- ACTIVITY LINE -->
<!-- ================================= -->

<g transform="translate(470 690)">

  <polyline
    points="${points}"
    fill="none"
    stroke="#ffffff"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
    filter="url(#glow)"
  />

  <polyline
    points="${points}"
    fill="none"
    stroke="#eeeeee"
    stroke-width="1"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

</g>

<!-- ================================= -->
<!-- STACK -->
<!-- ================================= -->

<line
  x1="65"
  y1="815"
  x2="1115"
  y2="815"
  stroke="#202020"
/>

<text
  x="65"
  y="850"
  fill="#666"
  font-family="monospace"
  font-size="14"
>
stack
</text>

<text
  x="65"
  y="880"
  fill="#eee"
  font-family="monospace"
  font-size="17"
>
JavaScript · Java · C++ · HTML · CSS · Git
</text>

<!-- ================================= -->
<!-- PROJECTS -->
<!-- ================================= -->

<text
  x="65"
  y="930"
  fill="#666"
  font-family="monospace"
  font-size="14"
>
projects
</text>

<text
  x="65"
  y="960"
  fill="#eee"
  font-family="monospace"
  font-size="17"
>
github-profile-generator
</text>

<!-- ================================= -->
<!-- NOW -->
<!-- ================================= -->

<text
  x="650"
  y="930"
  fill="#666"
  font-family="monospace"
  font-size="14"
>
now
</text>

<text
  x="650"
  y="960"
  fill="#eee"
  font-family="monospace"
  font-size="17"
>
learning · building · coding
</text>

<!-- ================================= -->
<!-- FOOTER -->
<!-- ================================= -->

<text
  x="65"
  y="1025"
  fill="#444"
  font-family="monospace"
  font-size="13"
>
generated dynamically · ${new Date().getFullYear()}
</text>

</svg>
`;

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
      `Profile generator error: ${esc(error.message)}`
    );
  }
}
