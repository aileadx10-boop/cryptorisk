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
// ---- VARA GPT Legal Engine (Strict JSON Mode) ----

const openaiRes = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: "gpt-4.1-mini",
    response_format: { type: "json_object" },
    input: `
You are a UAE crypto regulatory lawyer specializing in VARA (Dubai).

Analyze the following project:

Activity: ${input.activity}
Overall Risk Score: ${finalScore}
Tokenomics Score: ${tokenomics.score}
Crawler Score: ${crawler.score}

Return ONLY valid JSON with this exact structure:

{
  "varaLicenseRisk": "Low | Moderate | High | License Likely Required",
  "legalExplanation": "Professional paragraph explaining VARA exposure.",
  "recommendedAction": "Clear next regulatory step under VARA."
}

Do not include any text outside the JSON.
`
  })
});

const openaiData = await openaiRes.json();

let varaAnalysis;

try {
  varaAnalysis = JSON.parse(openaiData.output[0].content[0].text);
} catch (error) {
  varaAnalysis = {
    varaLicenseRisk: "Analysis Error",
    legalExplanation: "Automatic legal analysis could not be generated.",
    recommendedAction: "Manual regulatory review required."
  };
}
  return res.status(200).json({
  overallScore: finalScore,
  riskCategory,
  crawler,
  tokenomics,
  varaLicenseRisk: varaAnalysis.varaLicenseRisk,
  legalExplanation: varaAnalysis.legalExplanation,
  recommendedAction: varaAnalysis.recommendedAction
});
