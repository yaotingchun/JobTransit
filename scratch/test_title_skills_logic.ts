// Test category classification for "Title: Noun1, Noun2"

export function classifySkillTitle(rawTitle: string): 'technical' | 'ai' | 'tool' | 'soft' | 'other' {
  const t = rawTitle.toLowerCase().trim();

  // 1. Technical Skills
  if (
    /^(?:technical\s*skills?|core\s*technical|programming\s*languages?|languages?|coding|web\s*tech(?:nologies)?|frontend|front[\s-]?end|backend|back[\s-]?end|databases?|rdbms|nosql|frameworks(?:\s*(?:and|&)\s*libraries)?|libraries|architecture|system\s*design)$/i.test(t)
    || /\b(?:programming\s+languages?|databases?)\b/i.test(t)
  ) {
    return 'technical';
  }

  // 2. AI / ML Skills
  if (
    /\b(?:ai|ml|artificial\s*intelligence|machine\s*learning|deep\s*learning|data\s*science|nlp|computer\s*vision|generative\s*ai|llms?|neural\s*networks?)\b/i.test(t)
  ) {
    return 'ai';
  }

  // 3. Tools & Technologies (shown in website)
  if (
    /\b(?:tools\s*(?:and|&)\s*tech(?:nologies)?|frameworks\s*(?:and|&)\s*tools|tools\s*(?:and|&)\s*frameworks|developer\s*tools|devops|cloud(?:\s*(?:and|&)\s*devops)?|platforms?|ci[\s/-]?cd|infrastructure)\b/i.test(t)
    || /^(?:tools|technologies|software\s*tools|tech\s*stack|developer\s*tools)$/i.test(t)
  ) {
    return 'tool';
  }

  // 4. Soft Skills
  if (
    /\b(?:soft\s*skills?|interpersonal(?:\s*skills?)?|personal\s*skills?|core\s*competencies|key\s*competencies|strengths|personal\s*attributes|leadership|management\s*skills?|communication)\b/i.test(t)
  ) {
    return 'soft';
  }

  // 5. Title is not one of the categories shown on the website (e.g. "Methodologies", "Operating Systems", "Concepts", "Others")
  return 'other';
}

const testLines = [
  '- Frameworks & Tools: React, Next.js',
  '- Methodologies: Agile/Scrum, Kanban',
  '• Technical Skills: Python, SQL, C++',
  'Languages: TypeScript, Rust',
  '- AI/ML: PyTorch, TensorFlow, LangChain',
  '- Cloud & DevOps: AWS, Docker, Kubernetes',
  '- Soft Skills: Leadership, Problem Solving',
  '- Operating Systems: Linux, Ubuntu, macOS',
  '- Agile Methodologies: Scrum, Sprint Planning',
];

console.log('\n--- SKILL LINE COLON PARSING TEST ---');
for (const line of testLines) {
  const stripped = line.replace(/^[\s-*•▪◦\d.)]+/, '').trim();
  const colonMatch = stripped.match(/^([^:—–]+)[:—–]\s*(.+)$/);
  if (colonMatch) {
    const title = colonMatch[1].trim();
    const nouns = colonMatch[2].split(/[,;|•\n]+/).map((s) => s.trim()).filter(Boolean);
    const category = classifySkillTitle(title);
    console.log(`Line: "${line}"`);
    console.log(`  Title: "${title}" => Category: [${category}]`);
    console.log(`  Nouns:`, nouns);
  }
}
