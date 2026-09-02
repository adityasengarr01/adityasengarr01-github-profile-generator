export default async function handler(req, res) {
  const username = "adityasengarr01";

  try {
    // GitHub profile data
    const githubResponse = await fetch(
      `https://api.github.com/users/${username}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "github-profile-generator"
        }
      }
    );

    if (!githubResponse.ok) {
      throw new Error("GitHub API failed");
    }

    const user = await githubResponse.json();

    // Your uploaded photo
    const photoUrl =
      "https://raw.githubusercontent.com/adityasengarr01/adityasengarr01-github-profile-generator/main/ChatGPT%20Image%20Sep%202%2C%202026%2C%2003_11_20%20PM.png";

    const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1200"
  height="900"
  viewBox="0 0 1200 900"
>
  <rect width="1200" height="900" fill="#050505"/>

  <!-- Top terminal line -->
  <text
    x="60"
    y="65"
    fill="#8f8f8f"
    font-family="monospace"
    font-size="18"
  >
    adityasengarr01@github:~$
  </text>

  <text
    x="310"
    y="65"
    fill="#ffffff"
    font-family="monospace"
    font-size="18"
  >
    whoami
  </text>

  <!-- Profile image -->
  <rect
    x="60"
    y="100"
    width="430"
    height="430"
    rx="8"
    fill="#111111"
  />

  <image
    href="${photoUrl}"
    x="60"
    y="100"
    width="430"
    height="430"
    preserveAspectRatio="xMidYMid slice"
  />

  <!-- Name -->
  <text
    x="540"
    y="145"
    fill="#ffffff"
    font-family="monospace"
    font-size="32"
    font-weight="bold"
  >
    Aditya Sengarr
  </text>

  <text
    x="540"
    y="180"
    fill="#777777"
    font-family="monospace"
    font-size="17"
  >
    @adityasengarr01
  </text>

  <!-- Stats -->
  <text
    x="540"
    y="240"
    fill="#ffffff"
    font-family="monospace"
    font-size="22"
  >
    repositories
  </text>

  <text
    x="820"
    y="240"
    fill="#ffffff"
    font-family="monospace"
    font-size="22"
  >
    ${user.public_repos}
  </text>

  <text
    x="540"
    y="285"
    fill="#ffffff"
    font-family="monospace"
    font-size="22"
  >
    followers
  </text>

  <text
    x="820"
    y="285"
    fill="#ffffff"
    font-family="monospace"
    font-size="22"
  >
    ${user.followers}
  </text>

  <text
    x="540"
    y="330"
    fill="#ffffff"
    font-family="monospace"
    font-size="22"
  >
    following
  </text>

  <text
    x="820"
    y="330"
    fill="#ffffff"
    font-family="monospace"
    font-size="22"
  >
    ${user.following}
  </text>

  <!-- About -->
  <text
    x="540"
    y="405"
    fill="#8f8f8f"
    font-family="monospace"
    font-size="18"
  >
    $ cat about.txt
  </text>

  <text
    x="540"
    y="440"
    fill="#ffffff"
    font-family="monospace"
    font-size="17"
  >
    developer • student • builder
  </text>

  <text
    x="540"
    y="470"
    fill="#777777"
    font-family="monospace"
    font-size="15"
  >
    building things and learning every day.
  </text>

  <!-- Stack -->
  <text
    x="60"
    y="600"
    fill="#8f8f8f"
    font-family="monospace"
    font-size="18"
  >
    $ cat stack.txt
  </text>

  <text
    x="60"
    y="640"
    fill="#ffffff"
    font-family="monospace"
    font-size="17"
  >
    Java   C++   JavaScript   HTML   CSS   Git
  </text>

  <!-- Projects -->
  <text
    x="60"
    y="700"
    fill="#8f8f8f"
    font-family="monospace"
    font-size="18"
  >
    $ ls projects/
  </text>

  <text
    x="60"
    y="740"
    fill="#ffffff"
    font-family="monospace"
    font-size="17"
  >
    DSA
  </text>

  <text
    x="180"
    y="740"
    fill="#ffffff"
    font-family="monospace"
    font-size="17"
  >
    Java-Chat-Application
  </text>

  <text
    x="60"
    y="775"
    fill="#ffffff"
    font-family="monospace"
    font-size="17"
  >
    AI-Projects
  </text>

  <text
    x="220"
    y="775"
    fill="#ffffff"
    font-family="monospace"
    font-size="17"
  >
    TSP_Project
  </text>

  <!-- Footer -->
  <text
    x="60"
    y="850"
    fill="#555555"
    font-family="monospace"
    font-size="14"
  >
    generated dynamically • github.com/adityasengarr01
  </text>

</svg>
`;

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return res.status(200).send(svg);

  } catch (error) {
    return res.status(500).send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="200">
        <rect width="100%" height="100%" fill="#050505"/>
        <text x="30" y="100"
          fill="white"
          font-family="monospace"
          font-size="20">
          profile generator error
        </text>
      </svg>
    `);
  }
}
