export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const input = req.body;

  const crawlerRes = await fetch(
    "https://cryptorisk-omega.vercel.app/api/agent-crawler",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    }
  );

  const tokenomicsRes = await fetch(
    "https://cryptorisk-omega.vercel.app/api/agent-tokenomics",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    }
  );

  const crawler = await crawlerRes.json();
  const tokenomics = await tokenomicsRes.json();

  const finalScore = Math.round(
    (crawler.score + tokenomics.score) / 2
  );

  // ---- NEW: Risk Classification Engine ----

  let riskCategory = "Low";

  const activity = (input.activity || "").toLowerCase();

  if (
    activity.includes("staking") ||
    activity.includes("yield") ||
    activity.includes("revenue") ||
    activity.includes("profit") ||
    activity.includes("token sale") ||
    activity.includes("dao")
  ) {
    riskCategory = "High – Securities Analysis Required";
  }

  if (finalScore < 40) {
    riskCategory = "Very High – Likely Securities / Regulatory Exposure";
  }

  return res.status(200).json({
    overallScore: finalScore,
    riskCategory,
    crawler,
    tokenomics
  });
}
