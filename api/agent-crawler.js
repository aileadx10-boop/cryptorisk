export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { website, whitepaper } = req.body;

  let score = 100;
  let flags = [];

  if (!website) {
    score -= 20;
    flags.push("Missing website");
  }

  if (!whitepaper) {
    score -= 30;
    flags.push("Missing whitepaper");
  }

  return res.status(200).json({
    agent: "crawler",
    score,
    flags
  });
}
