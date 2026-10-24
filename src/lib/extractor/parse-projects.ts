export type ProjectDetails = {
  name: string | null;
  description: string | null;
};

const descriptionLead = /^(?:built|created|developed|designed|implemented|engineered|launched|led|delivered|automated|improved|reduced|increased|managed|used|leveraged|applied|established|collaborated|conducted|analyzed|generated|achieved|produced|supported|facilitated|evaluated|modernized|optimized|coordinated|migrated|transformed|oversaw|executed|spearheaded|crafted|a|an|the|this|these|those|using|with|for|responsible for|focused on|worked on|resulted in)\b/i;

const humanHonorifics = /\b(?:Dr\.?|Prof\.?|Professor|Mr\.?|Mrs\.?|Ms\.?|Miss|Engr\.?|Ir\.?|Ts\.?|Doctor|Ing\.?)\b/i;
const humanRolePrefixes = /^(?:by|author|candidate|student|supervisor|advisor|mentor|team\s+member|contributor|lead\s+developer|co-developer|developer|designer|engineer|members?|researcher|presenter)\s*[:—–-]?\s*/i;

export function isHumanName(text: string, knownNames: string[] = []): boolean {
  const cleaned = text.trim().replace(/^[-*•▪◦]\s*/, '').replace(/[:|–—-]+$/, '').trim();
  if (!cleaned) return false;

  // Exact or partial match against candidate's name or known user profile name
  for (const known of knownNames) {
    if (known && known.trim().length >= 2) {
      const k = known.trim().toLowerCase();
      const c = cleaned.toLowerCase();
      if (c === k || c.includes(k) || k.includes(c)) return true;

      // Word overlap (e.g. "Yao Ting Chun" vs "Ting Chun" or "Yao")
      const kWords = k.split(/[\s,.-]+/).filter((w) => w.length >= 2);
      const cWords = c.split(/[\s,.-]+/).filter((w) => w.length >= 2);
      if (kWords.length >= 2 && cWords.length >= 2) {
        const overlap = kWords.filter((w) => cWords.includes(w));
        if (overlap.length >= 2) return true;
      }
    }
  }

  // Matches academic/professional honorifics or titles
  if (humanHonorifics.test(cleaned)) return true;

  // Starts with supervisor/author/team member prefix
  if (humanRolePrefixes.test(cleaned)) return true;

  // Check Malay / Indian patronymics
  if (/\b(?:bin|binti|bt\.?|ibni|a\/l|a\/p|s\/o|d\/o)\b/i.test(cleaned)) return true;

  // Check project/system keywords - if it has these, it is likely a project name not a human name
  const hasProjectKeywords = /\b(project|system|app|application|platform|website|web|portal|tool|dashboard|engine|bot|model|classifier|pipeline|tracker|manager|simulator|api|service|design|game|transit|hub|e-commerce|store|ai|ml|iot|smart|automated|autonomous|detection|analyzer|network|cloud|portfolio|generator|suite|scanner|interface|database|framework|extension|library|plugin|mobile|frontend|backend|full-stack|solution|algorithm|controller|robot|assistant|advisor|recognizer|viewer|converter|editor|cli|client|server|prototype|module|agent|sensor|device|monitor|optimizer)\b/i.test(cleaned);

  if (hasProjectKeywords) {
    return false;
  }

  // Words analysis: 2 to 4 words
  const words = cleaned.split(/\s+/).filter(Boolean);

  // Capitalized or ALL-CAPS words without project keywords (e.g. "Yao Ting Chun", "YAO TING CHUN", "John Doe")
  const isAllTitleOrUpper = words.length >= 2 && words.length <= 4 && words.every((w) => /^[A-Z][A-Za-z'.]*$/.test(w));
  if (isAllTitleOrUpper) {
    return true;
  }

  return false;
}

export function cleanProjectTitle(raw: string, knownNames: string[] = []): string {
  let title = raw.trim();

  // Strip prefixes like "Project Name:", "Project Title:", "Project 1:", "FYP:"
  title = title.replace(/^(?:project\s+name|project\s+title|selected\s+project|key\s+project|final\s+year\s+project|fyp|capstone\s+project|project\s+\d+|project)\s*[:—–-]\s*/i, '');

  // Strip author/supervisor parentheticals: e.g. "(by Yao Ting Chun)", "(Supervisor: Dr. Siti)"
  title = title.replace(/\s*\((?:by|supervisor|advisor|author)[^)]*\)/i, '');
  title = title.replace(/\s*\[(?:by|supervisor|advisor|author)[^\]]*\]/i, '');

  // If title has a separator like "JobTransit | React, TypeScript" or "Smart Transit App - Yao Ting Chun"
  if (/[|–—-]/.test(title)) {
    const parts = title.split(/\s+[|–—-]\s+/).map((p) => p.trim()).filter(Boolean);
    const nonHumanParts = parts.filter((p) =>
      !isHumanName(p, knownNames)
      && !/^(?:19|20)\d{2}/.test(p)
      && !/^(?:role|position|lead|developer|engineer|completed|ongoing)\b/i.test(p)
      && !/^(?:typescript|javascript|react|python|node|fastapi|three\.js|docker|sql|aws|c\+\+|java)\b/i.test(p)
    );
    if (nonHumanParts.length > 0) {
      title = nonHumanParts[0]; // The main project name is the first non-human non-tech part
    }
  }

  // Strip trailing tech stack without separator e.g. "JobTransit Engine TypeScript, React, Firestore"
  title = title.replace(/\s+(?:TypeScript|JavaScript|React|Python|Node\.js|Express|FastAPI|Three\.js|Firestore|PostgreSQL|Docker)(?:,\s*[A-Za-z0-9._\s-]+)+$/i, '').trim();

  // Also strip trailing human name if separated by colon
  const colonMatch = title.match(/^(.+?)\s*:\s*(.+)$/);
  if (colonMatch) {
    if (isHumanName(colonMatch[1], knownNames)) {
      title = colonMatch[2];
    } else if (isHumanName(colonMatch[2], knownNames)) {
      title = colonMatch[1];
    }
  }

  title = title.replace(/^[\s:|–—-]+|[\s|–—-]+$/g, '').replace(/\s+/g, ' ').trim();

  // If the entire cleaned title is a human name, discard it
  if (isHumanName(title, knownNames)) {
    return '';
  }

  return title;
}

function cleanProjectLine(line: string): { text: string; isBullet: boolean } {
  const trimmed = line.trim();
  const isBullet = /^(?:[-*•▪◦]|\d+[.)])\s+/.test(trimmed);
  return {
    text: trimmed.replace(/^(?:[-*•▪◦]|\d+[.)])\s+/, '').trim(),
    isBullet,
  };
}

export function isDescription(text: string): boolean {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return descriptionLead.test(text)
    || wordCount >= 8
    || /[.!?]$/.test(text)
    || text.length > 100;
}

function isTitleCandidate(text: string, allowLongTitle = false, knownNames: string[] = []): boolean {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (isHumanName(text, knownNames)) return false;
  if (humanRolePrefixes.test(text)) return false;

  return text.length <= (allowLongTitle ? 120 : 90)
    && wordCount <= (allowLongTitle ? 14 : 10)
    && !descriptionLead.test(text)
    && !/[.!?]$/.test(text);
}

function splitInlineEntry(text: string, knownNames: string[] = []): { name: string; description: string } | null {
  const match = text.match(/^(.{2,70}?)(?:\s*:\s+|\s+[|–—-]\s+)(.{2,})$/u);
  if (!match) return null;

  const left = match[1].trim();
  const right = match[2].trim();

  // If left side is a person's name (e.g. "Candidate Name | Project Title: Transit App")
  if (isHumanName(left, knownNames)) {
    const cleanedRightTitle = cleanProjectTitle(right, knownNames);
    if (isTitleCandidate(cleanedRightTitle, true, knownNames)) {
      return { name: cleanedRightTitle, description: '' };
    }
    return null;
  }

  const cleanedLeftTitle = cleanProjectTitle(left, knownNames);
  if (!isTitleCandidate(cleanedLeftTitle, true, knownNames)) return null;

  return { name: cleanedLeftTitle, description: right };
}

export function extractProjectDetails(text: string, knownNames: string[] = []): ProjectDetails[] {
  const lines = text.split(/\r?\n/).map(cleanProjectLine).filter((line) => line.text);
  if (!lines.length) return [];

  const projects: ProjectDetails[] = [];
  let current: { name: string | null; description: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    const description = current.description.join('\n').trim();
    let name = current.name ? cleanProjectTitle(current.name, knownNames) : null;

    // Guard: Project name MUST NEVER be a human name
    if (name && isHumanName(name, knownNames)) {
      name = null;
    }

    // If name is still missing, try to extract a concise project title from description
    if (!name && description) {
      const explicitTitleMatch = description.match(/(?:project\s+(?:name|title)|title)\s*[:—–-]\s*([^\n,.]+)/i);
      if (explicitTitleMatch && !isHumanName(explicitTitleMatch[1], knownNames)) {
        name = cleanProjectTitle(explicitTitleMatch[1], knownNames);
      } else {
        const actionMatch = description.match(/\b(?:built|developed|created|designed|implemented|engineered)\s+(?:a|an|the)?\s*([A-Za-z0-9\s'-]{4,45}?)(?=\s+(?:using|with|for|in|to|that|\.|\n|$))/i);
        if (actionMatch && !isHumanName(actionMatch[1], knownNames) && actionMatch[1].split(/\s+/).length <= 6) {
          name = cleanProjectTitle(actionMatch[1], knownNames);
        }
      }
    }

    if (name || description) {
      projects.push({
        name: name || 'Portfolio Project',
        description: description || null,
      });
    }
  };

  for (const line of lines) {
    // Ignore lines that merely describe authors or supervisors or personal names
    if (humanRolePrefixes.test(line.text) || isHumanName(line.text, knownNames)) {
      if (current) current.description.push(line.text);
      continue;
    }

    const inline = splitInlineEntry(line.text, knownNames);
    if (inline) {
      flush();
      current = { name: inline.name, description: inline.description ? [inline.description] : [] };
      continue;
    }

    if (!current) {
      current = isTitleCandidate(line.text, true, knownNames)
        ? { name: cleanProjectTitle(line.text, knownNames), description: [] }
        : { name: null, description: [line.text] };
      continue;
    }

    if (!current.name && isTitleCandidate(line.text, false, knownNames) && current.description.length === 0) {
      current.name = cleanProjectTitle(line.text, knownNames);
      continue;
    }

    if (isTitleCandidate(line.text, false, knownNames) && current.name && current.description.length > 0) {
      flush();
      current = { name: cleanProjectTitle(line.text, knownNames), description: [] };
      continue;
    }

    if (!current.name && isTitleCandidate(line.text, false, knownNames) && line.isBullet && current.description.length > 0) {
      flush();
      current = { name: cleanProjectTitle(line.text, knownNames), description: [] };
      continue;
    }

    current.description.push(line.text);
  }

  flush();
  return projects;
}
