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

  return res.status(200).json({
    overallScore: finalScore,
    crawler,
    tokenomics
  });
}
