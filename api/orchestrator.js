export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const input = req.body || {};

    // --- Call Internal Agents ---

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

    // --- VARA Deterministic Classification Engine ---

    const activity = (input.activity || "").toLowerCase();

    let varaLicenseCategory = "No Clear VARA Trigger";
    let varaRiskLevel = "Low";
    let varaExplanation =
      "No clearly regulated virtual asset activity detected under VARA framework.";
    let recommendedAction =
      "No immediate VARA licensing review required based on provided description.";

    // 1️⃣ Exchange / Brokerage
    if (
      activity.includes("exchange") ||
      activity.includes("broker") ||
      activity.includes("trading platform") ||
      activity.includes("order matching")
    ) {
      varaLicenseCategory = "Virtual Asset Exchange / Broker-Dealer";
      varaRiskLevel = "License Likely Required";
      varaExplanation =
        "Operating a virtual asset exchange or brokerage platform generally falls under regulated Virtual Asset Service Provider (VASP) activities within Dubai.";
      recommendedAction =
        "Conduct structured assessment against VARA VASP license categories and initiate pre-application review.";
    }

    // 2️⃣ Custody
    if (
      activity.includes("custody") ||
      activity.includes("wallet service") ||
      activity.includes("asset safekeeping")
    ) {
      varaLicenseCategory = "Custody Services";
      varaRiskLevel = "High";
      varaExplanation =
        "Providing custody or safekeeping of virtual assets typically requires authorization under VARA custody service classifications.";
      recommendedAction =
        "Evaluate custody-specific regulatory obligations and capital requirements under VARA.";
    }

    // 3️⃣ Staking / Yield
    if (
      activity.includes("staking") ||
      activity.includes("yield") ||
      activity.includes("rewards program")
    ) {
      varaLicenseCategory = "Staking / Yield-Generating Activity";
      varaRiskLevel = "Moderate";
      varaExplanation =
        "Staking or yield-based mechanisms may trigger regulatory review depending on structure, marketing, and risk allocation.";
      recommendedAction =
        "Perform detailed structural analysis to determine whether activity constitutes regulated virtual asset service.";
    }

    // 4️⃣ Token Issuance
    if (
      activity.includes("token issuance") ||
      activity.includes("token sale") ||
      activity.includes("ico") ||
      activity.includes("launch")
    ) {
      varaLicenseCategory = "Token Issuance / Distribution";
      varaRiskLevel = "Moderate to High";
      varaExplanation =
        "Issuance or distribution of virtual assets may require regulatory review depending on economic rights and investor exposure.";
      recommendedAction =
        "Review token model and offering structure under applicable VARA virtual asset issuance guidance.";
    }

    // 5️⃣ Advisory / Consulting
    if (
      activity.includes("advisory") ||
      activity.includes("consulting") ||
      activity.includes("research")
    ) {
      varaLicenseCategory = "Advisory Services";
      varaRiskLevel = "Low to Moderate";
      varaExplanation =
        "Pure advisory or research services without asset custody or transaction execution may fall outside core VASP licensing, subject to activity scope.";
      recommendedAction =
        "Confirm service scope does not extend into execution, custody, or asset intermediation.";
    }

    // --- Response ---

    return res.status(200).json({
      overallScore: finalScore,
      crawlerScore: crawler.score,
      tokenomicsScore: tokenomics.score,
      varaLicenseCategory,
      varaRiskLevel,
      varaExplanation,
      recommendedAction
    });

  } catch (err) {
    return res.status(500).json({
      error: "Internal system error"
    });
  }
}
