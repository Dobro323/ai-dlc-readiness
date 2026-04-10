export async function POST(req) {
  try {
    const { process: devProcess, teamType, predictability, aiUsage, oversight } = await req.json()

    if (!devProcess?.trim()) {
      return Response.json({ error: 'Process description required' }, { status: 400 })
    }

    const prompt = `You are an expert in the AWS AI-DLC (AI-Driven Development Lifecycle) methodology. Analyze the team's dev process and return a JSON assessment. Be specific and reference details from their description.

INPUT:
- Team size: ${teamType}
- Sprint predictability: ${predictability}
- AI tools currently used: ${aiUsage}
- Human oversight level: ${oversight}
- Process description: "${devProcess}"

SCORING RULES:
- Score 0-20: Reactive (no AI methodology, chaotic process)
- Score 21-40: Aware (knows AI exists, ad-hoc usage)
- Score 41-60: Structured (some process, inconsistent AI usage)
- Score 61-80: Adaptive (structured AI usage, some checkpoints)
- Score 81-100: AI-Native (full AI-DLC adoption, continuous improvement)

Base the score strictly on their described process. Reference specific problems they mentioned.

For each stage, set status based on their actual situation:
- "critical": they have a major gap here that's causing pain
- "required": they need this but it's not urgent
- "skip": they already handle this well

For roadmap, include specific metrics. Example: "Reduce ticket carryover from 40% to under 15% by implementing AI-DLC Requirements Analysis stage."

Return ONLY this JSON with no markdown, no explanation:
{
  "score": <integer 0-100 based on rules above>,
  "level": "<Reactive|Aware|Structured|Adaptive|AI-Native>",
  "summary": "<2 sentences referencing their specific situation>",
  "stages": [
    {"name": "Workspace Detection", "status": "<critical|required|skip>", "note": "<specific to their situation, max 10 words>"},
    {"name": "Requirements Analysis", "status": "<critical|required|skip>", "note": "<specific to their situation, max 10 words>"},
    {"name": "Functional Design", "status": "<critical|required|skip>", "note": "<specific to their situation, max 10 words>"},
    {"name": "Architecture", "status": "<critical|required|skip>", "note": "<specific to their situation, max 10 words>"},
    {"name": "Construction", "status": "<critical|required|skip>", "note": "<specific to their situation, max 10 words>"},
    {"name": "Testing", "status": "<critical|required|skip>", "note": "<specific to their situation, max 10 words>"}
  ],
  "roadmap": [
    {"title": "<specific action>", "desc": "<one sentence with measurable outcome>", "timeline": "Week 1-2"},
    {"title": "<specific action>", "desc": "<one sentence with measurable outcome>", "timeline": "Week 3-4"},
    {"title": "<specific action>", "desc": "<one sentence with measurable outcome>", "timeline": "Month 2"},
    {"title": "<specific action>", "desc": "<one sentence with measurable outcome>", "timeline": "Month 3"}
  ],
  "expected_gain": "<specific prediction, e.g. 'Reduce incidents 40%, improve sprint predictability from 60% to 85%'>"
}`

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      return Response.json({ error: `Groq error ${groqRes.status}: ${errText}` }, { status: 500 })
    }

    const data = await groqRes.json()
    const raw = data.choices?.[0]?.message?.content || ''

    if (!raw) {
      return Response.json({ error: 'Empty response', debug: JSON.stringify(data) }, { status: 500 })
    }

    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    const auditEntry = {
      timestamp: new Date().toISOString(),
      teamType, predictability, aiUsage, oversight,
      processSnippet: devProcess.substring(0, 120),
      score: result.score,
      level: result.level,
      expectedGain: result.expected_gain,
    }

    return Response.json({ result, audit: auditEntry })

  } catch (e) {
    return Response.json({ error: e.message || 'Unknown error' }, { status: 500 })
  }
}
