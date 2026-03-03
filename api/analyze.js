export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { company, country, activity } = req.body;

  const prompt = `
You are a senior crypto regulatory lawyer.

Generate a professional crypto compliance package including:
1. Disclaimer
2. Risk Disclosure
3. Terms of Use

Company: ${company}
Country: ${country}
Activity: ${activity}

Make it detailed and legally structured.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    const data = await response.json();

    // Safe extraction
    const text =
      data.output_text ||
      (data.output &&
        data.output[0] &&
        data.output[0].content &&
        data.output[0].content[0] &&
        data.output[0].content[0].text) ||
      "No response generated.";

    res.status(200).json({ document: text });

  } catch (error) {
    res.status(500).json({ error: "OpenAI request failed" });
  }
}
