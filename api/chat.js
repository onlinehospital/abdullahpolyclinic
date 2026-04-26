
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.ANTHROPIC_API_KEY;

  try {
    const { name, age, sex, weight, symptoms, duration, pain, conditions, allergies, description } = req.body;

    // 🧠 Build a strong medical prompt
    const prompt = `
You are a professional medical AI doctor.

Patient Information:
- Name: ${name}
- Age: ${age}
- Sex: ${sex}
- Weight: ${weight} kg
- Symptoms: ${symptoms}
- Duration: ${duration}
- Pain Level: ${pain}
- Existing Conditions: ${conditions}
- Allergies: ${allergies}

Detailed Description:
${description}

Provide:
1. Possible conditions
2. Severity level (Low, Moderate, High)
3. Recommended actions
4. Medications (if needed, general only)
5. When to see a doctor

Keep it clear and professional.
`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    return res.status(200).json({
      reply: data.content?.[0]?.text || "No response from AI"
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
