
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST requests only"
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model =
    process.env.GEMINI_MODEL || "gemini-3.8-flash";

  if (!apiKey) {
    return res.status(500).json({
      error: "Gemini API key is not configured."
    });
  }

  const { message } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      error: "Please send a message."
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: `You are KronAI, a friendly and highly
knowledgeable Mobile Legends: Bang Bang coach.

Your personality is confident, witty, helpful,
and casual. Talk like a teammate.

Answer MLBB questions about heroes, skills,
builds, counters, rotations, drafting, and strategy.
Explain your reasoning clearly.
Never invent patch notes or claim unverified
builds are the current meta.
If you are unsure, say so.

You are an AI assistant, not a conscious being.`
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: message }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "AI request failed."
      });
    }

    const answer =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "I couldn't generate a response.";

    return res.status(200).json({ answer });

  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong connecting to the AI."
    });
  }
};
