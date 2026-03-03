export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { staking, revenueShare } = req.body;

  let score = 100;
  let flags = [];

  if (staking) {
    score -= 30;
    flags.push("Staking may imply expectation of profits");
  }

  if (revenueShare) {
    score -= 40;
    flags.push("Revenue sharing increases securities risk");
  }

  return res.status(200).json({
    agent: "tokenomics",
    score,
    flags
  });
}
