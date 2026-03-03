export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { activity } = req.body;

  let score = 100;
  let flags = [];

  if (activity && activity.toLowerCase().includes("staking")) {
    score -= 40;
    flags.push("Staking model may trigger securities analysis (Howey risk)");
  }

  if (activity && activity.toLowerCase().includes("revenue")) {
    score -= 30;
    flags.push("Revenue sharing increases likelihood of investment contract classification");
  }

  return res.status(200).json({
    agent: "tokenomics",
    score,
    flags
  });
}
