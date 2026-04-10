export async function POST(req) {
  const { process: devProcess, teamType, predictability, aiUsage, oversight } = await req.json()

  if (!devProcess?.trim()) {
    return Response.json({ error: 'Process description required' }, { status: 400 })
  }

  const prompt = `You are an AI-DLC (AI-Driven Development Lifecycle) expert from AWS. Analyze this team's dev process and return ONLY valid JSON, no markdown, no explanation.

Team: ${teamType}, predictability: ${predictability}, AI usage: ${aiUsage}, human oversight: ${oversight}
Process description: "${devProcess}"

Return this exact JSON structure:
{
  "score": <integer 0-100>,
  "level": "<Reactive | Aware | Structured | Adaptive | AI-Native>",
  "summary": "<2 sentences, specific to their situation>",
  "stages": [
    {"name": "Workspace Detection", "status": "skip|required|critical", "note": "<8 words max>"},
    {"name": "Requirements Analysis", "status": "skip|required|critical", "note": "<8 words max>"},
    {"name": "Functional Design", "status": "skip|required|critical", "note": "<8 words max>"},
    {"name": "Architecture", "status": "skip|required|critical", "note": "<8 words max>"},
    {"name": "Construction", "status": "skip|required|critical", "note": "<8 words max>"},
    {"name": "Testing", "status": "skip|required|critical", "note": "<8 words max>"}
  ],
  "roadmap": [
    {"title": "<action title>", "desc": "<specific 1-sentence action>", "timeline": "<e.g. Week 1-2>"},
    {"title": "<action title>", "desc": "<specific 1-sentence action>", "timeline": "<e.g. Week 3-4>"},
    {"title": "<action title>", "desc": "<specific 1-sentence action>", "timeline": "<e.g. Month 2>"},
    {"title": "<action title>", "desc": "<specific 1-sentence action>", "timeline": "<e.g. Month 3>"}
  ],
  "expected_gain": "<e.g. 3-5x velocity, 80%+ predictability>"
}`

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  })

  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content || ''
  const clean = raw.replace(/```json|```/g, '').trim()
  const result = JSON.parse(clean)

  // Append to audit log
  const auditEntry = {
    timestamp: new Date().toISOString(),
    teamType,
    predictability,
    aiUsage,
    oversight,
    processSnippet: devProcess.substring(0, 120),
    score: result.score,
    level: result.level,
    expectedGain: result.expected_gain
  }

  return Response.json({ result, audit: auditEntry })
}
