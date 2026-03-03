export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { company, country, activity } = req.body;

  const document = `
CRYPTO COMPLIANCE PACKAGE

Company: ${company}
Country: ${country}
Activity: ${activity}

-------------------------
DISCLAIMER
The information provided by ${company} does not constitute financial advice.

-------------------------
RISK DISCLOSURE
Cryptocurrency markets are volatile and involve significant risk.

-------------------------
TERMS OF USE
By accessing the services of ${company}, you agree to the following terms.
`;

  res.status(200).json({ document });
}
