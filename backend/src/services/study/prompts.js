export function answerPrompt(context, question) {
  return `You are Leet Prep's AI study assistant.
Answer using only the retrieved study material context.

Context:
${context}

Question:
${question}

Rules:
- Give a direct answer first.
- Keep the explanation structured and concise.
- Do not invent facts outside the context.
- If the context is insufficient, say what is missing.
- End with a short "Key takeaway" line.`;
}

export function summaryPrompt(context, topic) {
  return `You are Leet Prep's AI study assistant.
Create clean revision notes using only the provided context.

Topic:
${topic}

Context:
${context}

Rules:
- Use headings and bullet points.
- Focus on revision-friendly notes.
- Do not add outside facts.
- Include definitions, key ideas, and likely points to remember.
- If the context is thin, say that the uploaded material is insufficient.`;
}

export function quizPrompt(context, topic, count) {
  return `You are Leet Prep's AI study assistant.
Generate exactly ${count} multiple choice questions using only the provided context.

Topic:
${topic}

Context:
${context}

Return strict JSON in this shape:
{
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "answerIndex": 0,
      "explanation": ""
    }
  ]
}

Rules:
- Exactly ${count} questions.
- Four options per question.
- Explanations must be grounded in context.
- No markdown fences.
- No external knowledge.`;
}
