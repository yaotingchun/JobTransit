import { classifyResumeSections } from './classify-sections.ts';
import { extractProjectDetails, cleanProjectTitle, isHumanName } from './parse-projects.ts';
import { detectAllSkillsInDocument } from './skills-catalog.ts';

export type EmploymentStatus = 'student' | 'employed' | 'unemployed' | 'freelancer' | 'career_changer' | '';
export type EducationLevel = 'diploma' | 'bachelor' | 'master' | 'phd' | 'certificate' | 'other' | '';
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type WorkExperience = {
  job_title: string;
  company_name: string;
  employment_start_date: string;
  employment_end_date: string | null;
  job_responsibilities: string[];
  achievements: string[];
  skills_used: string[];
};

export type Certification = {
  name: string;
  issuing_organisation: string;
  date: string;
};

export type Project = {
  project_name: string;
  project_description: string;
  project_technologies: string[];
  project_role: string;
  project_outcomes: string[];
  portfolio_url: string | null;
};

export type StructuredResume = {
  personal_information: {
    full_name: string;
    email: string;
    phone_number: string;
    current_job_title: string;
    current_employment_status: EmploymentStatus;
    years_of_experience: number | '';
    industry: string;
    location: string;
    github_url?: string;
    linkedin_url?: string;
    portfolio_url?: string;
  };
  education: {
    education_level: EducationLevel;
    field_of_study: string;
    institution_name: string;
    graduation_year: number | '';
    academic_achievements: string[];
    relevant_coursework: string[];
  };
  skills: {
    technical_skills: string[];
    soft_skills: string[];
    ai_skills: string[];
    tools_and_technologies: string[];
    other_skills: string[];
    skill_proficiency: Record<string, ProficiencyLevel>;
    skill_evidence: Record<string, string>;
    certifications: Certification[];
    languages: Array<{ language: string; proficiency: string }>;
  };
  work_experience: WorkExperience[];
  projects: Project[];
  career_preferences: {
    target_job_roles: string[];
    preferred_industries: string[];
    preferred_work_location: string[];
    preferred_work_mode: 'on-site' | 'hybrid' | 'remote' | '';
    career_goals: string;
  };
};

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Marketing', 'Retail',
  'Manufacturing', 'Government', 'Nonprofit', 'Hospitality', 'Construction',
  'Telecommunications', 'Insurance', 'Logistics', 'Media',
];

const languageNames = [
  'English', 'Malay', 'Bahasa Melayu', 'Mandarin', 'Chinese', 'Cantonese',
  'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Hindi', 'Arabic',
  'Portuguese', 'Italian', 'Russian', 'Dutch', 'Thai', 'Vietnamese',
  'Indonesian', 'Filipino', 'Tagalog', 'Tamil', 'Urdu', 'Bengali', 'Swedish',
];

const monthNames = 'Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?';
const dateAtom = `(?:(?:${monthNames})\\s*,?\\s*)?(?:19|20)\\d{2}(?:\\s*[-/]\\s*(?:0?[1-9]|1[0-2]))?`;
const dateRangePattern = new RegExp(`(${dateAtom})\\s*(?:-|–|—|to|through)\\s*(present|current|now|${dateAtom})`, 'i');

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanValue(value: string): string {
  return value
    .replace(/^[\s:|–—-]+|[\s|–—-]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractLabeledValue(text: string, labels: string[]): string {
  const labelPattern = labels.map(escapeRegExp).join('|');
  const match = text.match(new RegExp(`(?:^|\\n)\\s*(?:${labelPattern})\\s*[:—-]\\s*([^\\n]+)`, 'i'));
  return match ? cleanValue(match[1]) : '';
}

function extractList(value: string): string[] {
  return [...new Set(
    value
      .split(/[,;|•\n]+/)
      .map((item) => cleanValue(item.replace(/^[-*▪◦]\s*/, '')))
      .filter(Boolean),
  )];
}

function normalizedStatus(value: string): EmploymentStatus {
  const normalized = value.toLowerCase().replace(/[\s-]+/g, '_');
  return ['student', 'employed', 'unemployed', 'freelancer', 'career_changer'].includes(normalized)
    ? normalized as EmploymentStatus
    : '';
}

function normalizeDate(value: string): string {
  const year = value.match(/(?:19|20)\d{2}/)?.[0] ?? '';
  if (!year) return '';

  const numericMonth = value.match(/(?:19|20)\d{2}\s*[-/]\s*(0?[1-9]|1[0-2])/)?.[1];
  if (numericMonth) return `${year}-${numericMonth.padStart(2, '0')}`;

  const monthWord = value.match(new RegExp(`\\b(${monthNames})\\b`, 'i'))?.[1]?.slice(0, 3).toLowerCase();
  const monthMap: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  };
  return monthWord ? `${year}-${monthMap[monthWord]}` : year;
}

function dateRangeIn(value: string): { start: string; end: string | null; ongoing: boolean } | null {
  const match = value.match(dateRangePattern);
  if (!match) return null;
  const ongoing = /^(present|current|now)$/i.test(match[2]);
  return {
    start: normalizeDate(match[1]),
    end: ongoing ? null : normalizeDate(match[2]),
    ongoing,
  };
}

function toMonthIndex(value: string, isEnd = false): number | null {
  const match = value.match(/^((?:19|20)\d{2})(?:-(\d{2}))?$/);
  if (!match) return null;
  return Number(match[1]) * 12 + Number(match[2] ?? (isEnd ? '12' : '01')) - 1;
}

function calculateExperienceYears(workText: string): number | '' {
  const ranges: Array<{ start: number; end: number }> = [];
  for (const line of workText.split(/\r?\n/)) {
    const range = dateRangeIn(line);
    if (!range?.start) continue;
    const start = toMonthIndex(range.start);
    const end = range.ongoing
      ? new Date().getFullYear() * 12 + new Date().getMonth()
      : range.end ? toMonthIndex(range.end, true) : null;
    if (start !== null && end !== null && end >= start) ranges.push({ start, end });
  }
  if (!ranges.length) return '';

  ranges.sort((a, b) => a.start - b.start);
  const merged: Array<{ start: number; end: number }> = [];
  for (const range of ranges) {
    const previous = merged.at(-1);
    if (previous && range.start <= previous.end + 1) previous.end = Math.max(previous.end, range.end);
    else merged.push({ ...range });
  }
  const months = merged.reduce((total, range) => total + range.end - range.start + 1, 0);
  return Math.round((months / 12) * 10) / 10;
}

function splitLines(text: string): string[] {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function findTerms(text: string, terms: string[]): string[] {
  const lower = text.toLowerCase();
  return terms.filter((term) => {
    const escaped = escapeRegExp(term.toLowerCase());
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(lower);
  });
}

function extractSkills(skillsText: string, fullDocumentText: string = ''): StructuredResume['skills'] {
  const detected = detectAllSkillsInDocument(fullDocumentText, skillsText);
  return {
    technical_skills: detected.technical_skills,
    soft_skills: detected.soft_skills,
    ai_skills: detected.ai_skills,
    tools_and_technologies: detected.tools_and_technologies,
    other_skills: detected.other_skills,
    skill_proficiency: detected.skill_proficiency,
    skill_evidence: detected.skill_evidence,
    certifications: [],
    languages: [],
  };
}

function extractCertifications(text: string): Certification[] {
  return splitLines(text).map((sourceLine) => {
    const line = sourceLine.replace(/^[-*•▪◦]\s*/, '');
    const date = line.match(new RegExp(`(?:${monthNames})?\\s*(?:19|20)\\d{2}`, 'i'))?.[0] ?? '';
    const issuerMatch = line.match(/(?:issued by|issuing organization|issuing organisation|issuer|offered by|from|by)\s+([^,;|]+?)(?=\s*(?:[,;|]|$))/i);
    const pieces = line.split(/\s+[|–—]\s+/).map(cleanValue).filter(Boolean);
    const name = cleanValue(
      issuerMatch
        ? line.slice(0, issuerMatch.index)
        : pieces[0]?.replace(new RegExp(`\\(?${escapeRegExp(date)}\\)?`, 'i'), '') ?? line,
    );
    const issuingOrganisation = issuerMatch
      ? cleanValue(issuerMatch[1])
      : pieces.length > 1 ? cleanValue(pieces[1].replace(new RegExp(escapeRegExp(date), 'i'), '')) : '';
    return { name, issuing_organisation: issuingOrganisation, date: cleanValue(date) };
  }).filter((item) => item.name);
}

function extractLanguages(text: string): Array<{ language: string; proficiency: string }> {
  const output = new Map<string, string>();
  const proficiencyPattern = /\b(native|fluent|bilingual|professional|conversational|intermediate|advanced|basic|beginner|limited working proficiency)\b/i;

  for (const line of splitLines(text)) {
    const matchedLanguages = findTerms(line, languageNames);
    for (const language of matchedLanguages) {
      const start = line.toLowerCase().indexOf(language.toLowerCase()) + language.length;
      const nextLanguage = matchedLanguages
        .map((other) => line.toLowerCase().indexOf(other.toLowerCase()))
        .filter((index) => index >= start)
        .sort((a, b) => a - b)[0] ?? line.length;
      const proficiency = line.slice(start, nextLanguage).match(proficiencyPattern)?.[1] ?? '';
      output.set(language, proficiency);
    }
    if (!matchedLanguages.length) {
      const match = line.match(/^\s*[-*•]?\s*([A-Za-z][A-Za-z ]{1,30})\s*(?:[:(|—–-])\s*(native|fluent|bilingual|professional|conversational|intermediate|advanced|basic|beginner)\b/i);
      if (match) output.set(cleanValue(match[1]), match[2]);
    }
  }

  return [...output].map(([language, proficiency]) => ({ language, proficiency }));
}

function extractAcademicAchievements(text: string): string[] {
  const achievements = new Set<string>();

  // 1. CGPA / GPA (short term: e.g. "CGPA 3.85")
  const gpaMatch = text.match(/\b(?:c\.?g\.?p\.?a\.?|g\.?p\.?a\.?)\s*[:—–-]?\s*([0-4]\.\d{1,2}(?:\s*\/\s*[0-4]\.\d{1,2})?|\d{1,2}(?:\.\d{1,2})?%?)/i);
  if (gpaMatch) {
    const val = gpaMatch[1].trim();
    achievements.add(val.includes('/') ? `CGPA ${val.split('/')[0].trim()}` : `CGPA ${val}`);
  }

  // WAM
  const wamMatch = text.match(/\bwam\s*[:—–-]?\s*(\d{2}(?:\.\d{1,2})?%?)/i);
  if (wamMatch) {
    achievements.add(`WAM ${wamMatch[1]}`);
  }

  // 2. Degree Classification & Honours
  if (/\bfirst\s+class\s+(?:honou?rs?|degree)\b|\b1st\s+class\s+honou?rs?\b/i.test(text)) {
    achievements.add('First Class Honours');
  } else if (/\b(?:upper\s+second\s+class|second\s+class\s+upper|2nd\s+class\s+upper|second\s+class\s+\(upper\s+division\))\b/i.test(text)) {
    achievements.add('Second Class Upper');
  } else if (/\b(?:second\s+class\s+lower|lower\s+second\s+class|2nd\s+class\s+lower)\b/i.test(text)) {
    achievements.add('Second Class Lower');
  } else if (/\bfirst\s+class\b/i.test(text)) {
    achievements.add('First Class');
  }

  // 3. Dean's List / Anugerah Dekan
  if (/dean'?s\s+list|\banugerah\s+dekan\b/i.test(text)) {
    const semesters = text.match(/(?:dean'?s\s+list|anugerah\s+dekan)[^\n,.]*?(\d+)\s+semesters?/i);
    achievements.add(semesters ? `Dean's List (${semesters[1]} Semesters)` : "Dean's List");
  } else if (/dean'?s\s+(?:honou?r\s+roll|award)/i.test(text)) {
    achievements.add("Dean's Honour Roll");
  }

  if (/president'?s\s+list/i.test(text)) achievements.add("President's List");
  if (/provost'?s\s+list/i.test(text)) achievements.add("Provost's List");

  // 4. Distinction / Merit
  if (/\bhigh\s+distinction\b/i.test(text)) {
    achievements.add('High Distinction');
  } else if (/\b(?:with\s+)?distinction\b/i.test(text)) {
    achievements.add('Distinction');
  } else if (/\bwith\s+merit\b/i.test(text)) {
    achievements.add('Merit');
  }

  // 5. Latin Honors
  if (/\bsumma\s+cum\s+laude\b/i.test(text)) achievements.add('Summa Cum Laude');
  else if (/\bmagna\s+cum\s+laude\b/i.test(text)) achievements.add('Magna Cum Laude');
  else if (/\bcum\s+laude\b/i.test(text)) achievements.add('Cum Laude');

  // 6. Specific Prestigious Awards (UTM / Malaysian & Global)
  if (/chancellor'?s\s+(?:gold\s+medal|medal)|\bpingat\s+emas\s+canselor\b/i.test(text)) {
    achievements.add("Chancellor's Gold Medal");
  } else if (/chancellor'?s\s+award|\banugerah\s+canselor\b/i.test(text)) {
    achievements.add("Chancellor's Award");
  }

  if (/vice[- ]chancellor'?s\s+award|\banugerah\s+naib\s+canselor\b|\bpiala\s+naib\s+canselor\b/i.test(text)) {
    achievements.add("Vice-Chancellor's Award");
  }

  if (/academic\s+excellence\s+award|\banugerah\s+kecemerlangan\s+akademik\b/i.test(text)) {
    achievements.add('Academic Excellence Award');
  }

  if (/best\s+student\s+award|\banugerah\s+pelajar\s+terbaik\b/i.test(text)) {
    achievements.add('Best Student Award');
  }

  if (/\bvaledictorian\b/i.test(text)) achievements.add('Valedictorian');
  if (/\bsalutatorian\b/i.test(text)) achievements.add('Salutatorian');

  if (/best\s+(?:final\s+year\s+project|fyp|capstone)\b/i.test(text)) {
    achievements.add('Best Capstone Project');
  }

  if (/\bbook\s+prize\b/i.test(text)) {
    achievements.add('Book Prize Award');
  }

  // 7. Scholarships (concise short terms only)
  if (/\b(?:jpa|jabatan\s+perkhidmatan\s+awam)\s+scholarship|\bbiasiswa\s+jpa\b/i.test(text)) {
    achievements.add('JPA Scholarship');
  } else if (/\bmara\s+scholarship|\bbiasiswa\s+mara\b/i.test(text)) {
    achievements.add('MARA Scholarship');
  } else if (/\bkuok\s+(?:foundation\s+)?scholarship\b/i.test(text)) {
    achievements.add('Kuok Foundation Scholar');
  } else if (/\byayasan\s+utm\s+scholarship\b/i.test(text)) {
    achievements.add('Yayasan UTM Scholarship');
  } else if (/\basean\s+scholarship\b/i.test(text)) {
    achievements.add('ASEAN Scholarship');
  } else if (/\bmerit\s+scholarship\b/i.test(text)) {
    achievements.add('Merit Scholarship');
  } else if (/\bdean'?s\s+scholarship\b/i.test(text)) {
    achievements.add("Dean's Scholarship");
  } else {
    const scholarshipMatch = text.match(/\b([A-Za-z0-9&'-]{2,16}(?:\s+[A-Za-z0-9&'-]{2,12}){0,2}\s+scholarship)\b/i);
    if (scholarshipMatch) {
      const sName = cleanValue(scholarshipMatch[1]);
      if (sName.length <= 30 && !/^(?:received|awarded|full|partial|got|a|the)\s+/i.test(sName)) {
        achievements.add(sName);
      }
    }
  }

  // 8. Cohort Rank
  const rankMatch = text.match(/\b(top\s+\d+%(?:\s+of\s+(?:class|cohort|batch))?|top\s+\d+\s+(?:student|graduate)|rank\s+1\s+(?:in\s+cohort|in\s+class))\b/i);
  if (rankMatch) {
    const rawRank = cleanValue(rankMatch[1]);
    if (rawRank.length <= 25) achievements.add(rawRank);
  }

  // Guard: Strictly sanitize every item so it is a short term (<= 32 chars, <= 4 words, no sentence words)
  const sanitized = Array.from(achievements)
    .map((item) => cleanValue(item.replace(/^[-*•▪◦]\s*/, '').replace(/[:.,;]+$/, '')))
    .filter((item) => {
      if (!item || item.length > 35) return false;
      const wordCount = item.split(/\s+/).length;
      if (wordCount > 5) return false;
      // Must not be a sentence or verb lead
      if (/^(?:i|we|was|were|received|awarded|responsible|participated|studied|completed)\b/i.test(item)) return false;
      return true;
    });

  return sanitized.slice(0, 6);
}

function extractEducation(sectionText: string, awardsText: string = '', fullDocumentText: string = ''): StructuredResume['education'] {
  const text = `${sectionText}\n${awardsText}`;
  let educationLevel: EducationLevel = '';
  if (/\b(ph\.?d|doctorate|doctoral)\b/i.test(text)) educationLevel = 'phd';
  else if (/\b(master'?s?|m\.?sc|m\.?a\.|mba)\b/i.test(text)) educationLevel = 'master';
  else if (/\b(bachelor'?s?|b\.?sc|b\.?a\.|b\.?eng|b\.?s\.)\b/i.test(text)) educationLevel = 'bachelor';
  else if (/\bdiploma\b/i.test(text)) educationLevel = 'diploma';
  else if (/\b(certification|certificate)\b/i.test(text)) educationLevel = 'certificate';

  let fieldOfStudy = extractLabeledValue(text, ['field of study', 'major', 'degree subject', 'specialization', 'specialisation']);
  if (!fieldOfStudy) {
    const degreeMatch = text.match(/\b(?:bachelor|master|b\.?sc|b\.?a|m\.?sc|m\.?a|b\.?eng|mba)\b(?:'s)?\s+(?:of|in)\s+([^,\n|()]+)/i);
    fieldOfStudy = degreeMatch
      ? cleanValue(degreeMatch[1].replace(/^(?:science|arts|engineering|business administration)\s+in\s+/i, ''))
      : '';
  }
  if (fieldOfStudy) {
    fieldOfStudy = fieldOfStudy.replace(/\s+\b(?:university|universiti|universitas|college|institute|school|academy)\b.*/i, '').trim();
  }

  const institutionLine = splitLines(text).find((line) => /\b(university|universiti|universitas|college|institute|school|academy)\b/i.test(line)) ?? '';
  let institutionName = extractLabeledValue(text, ['institution', 'university', 'college', 'school']);
  if (!institutionName && institutionLine) {
    // If the line has "Universiti Malaya | Graduated 2024", extract just the institution
    const cleanInst = institutionLine.split(/[|–—-]/)[0].trim();
    institutionName = cleanValue(cleanInst.replace(/\b(?:bachelor|master|phd|degree)\s+of\s+[^,\n|()]+/i, ''));
  }
  if (!institutionName && /\buniversiti\s+malaya\b/i.test(text)) {
    institutionName = 'Universiti Malaya';
  }
  const graduationMatch = text.match(/(?:graduat(?:ed|ion)|expected graduation|completion)\D{0,24}((?:19|20)\d{2})/i);
  const years = [...text.matchAll(/\b(?:19|20)\d{2}\b/g)].map((match) => Number(match[0]));
  const graduationYear = graduationMatch
    ? Number(graduationMatch[1])
    : years.length ? Math.max(...years) : '';
  const academicAchievements = extractAcademicAchievements(`${sectionText}\n${awardsText}\n${fullDocumentText}`);
  const courseworkMatch = text.match(/(?:relevant\s+)?coursework\s*[:—-]\s*([^\n]+)/i);

  return {
    education_level: educationLevel,
    field_of_study: fieldOfStudy,
    institution_name: institutionName,
    graduation_year: graduationYear,
    academic_achievements: academicAchievements,
    relevant_coursework: courseworkMatch ? extractList(courseworkMatch[1]) : [],
  };
}

function isBullet(line: string): boolean {
  return /^\s*(?:[-*•▪◦]|\d+[.)])\s+/.test(line);
}

function isAchievement(line: string): boolean {
  return /\d+%|\$[\d,.]+|\b(?:increased|improved|reduced|saved|grew|achieved|delivered|exceeded|raised|cut|generated|ranked|awarded|launched)\b/i.test(line);
}

const TITLE_NOUN_PATTERNS = [
  /\b(?:software|full[\s-]?stack|frontend|front[\s-]?end|backend|back[\s-]?end|mobile|ios|android|web|cloud|devops|systems?|infrastructure|platform|embedded|firmware|hardware|network|database|security|cybersecurity|data|machine[\s-]?learning|ai|deep[\s-]?learning|ml|nlp|computer[\s-]?vision|blockchain|qa|test|automation|solutions?|enterprise|applications?)\s+(?:engineer|developer|architect|specialist|analyst|programmer|technician|consultant|lead|director|manager)\b/i,
  /\b(?:engineer|developer|architect|programmer|analyst|scientist|consultant|specialist|administrator|designer|technician|officer|executive|associate|intern|trainee|fellow|coordinator|supervisor|auditor|researcher|instructor|lecturer|professor)\b/i,
  /\b(?:product|project|program|engineering|it|technical|marketing|sales|operations|general|account|hr|talent)\s+(?:manager|lead|director|head|vp|president|officer|supervisor)\b/i,
  /\b(?:ui\/?ux|ux\/?ui|user\s+experience|product|graphic|web|interaction)\s+(?:designer|researcher|lead)\b/i,
  /\b(?:data|business|systems?|financial|marketing|security|operations)\s+(?:analyst|scientist|specialist)\b/i,
  /\b(?:undergraduate|postgraduate|phd|masters?|bachelors?|student|fresh\s+graduate|intern)\b/i,
];

const COMPANY_INDICATORS = /\b(?:inc\.?|llc\.?|ltd\.?|bhd\.?|sdn\.?\s*bhd\.?|corp\.?|corporation|group|co\.?|technologies|solutions|systems|labs|studio|agency|bank|university|college|school|hospital|ministry|enterprises|consulting|ventures|department)\b/i;

export function isLikelyJobTitle(text: string): boolean {
  const cleaned = text.trim();
  if (!cleaned || cleaned.length > 60) return false;
  return TITLE_NOUN_PATTERNS.some((p) => p.test(cleaned));
}

export function isLikelyCompanyName(text: string): boolean {
  const cleaned = text.trim();
  if (!cleaned) return false;
  return COMPANY_INDICATORS.test(cleaned);
}

export function disambiguateRoleCompany(part1: string, part2: string): { jobTitle: string; companyName: string } {
  const p1 = cleanValue(part1);
  const p2 = cleanValue(part2);

  const p1IsTitle = isLikelyJobTitle(p1);
  const p2IsTitle = isLikelyJobTitle(p2);
  const p1IsCompany = isLikelyCompanyName(p1);
  const p2IsCompany = isLikelyCompanyName(p2);

  if ((p1IsCompany || !p1IsTitle) && p2IsTitle) {
    return { jobTitle: p2, companyName: p1 };
  }
  if (p1IsTitle && (p2IsCompany || !p2IsTitle)) {
    return { jobTitle: p1, companyName: p2 };
  }
  return { jobTitle: p1, companyName: p2 };
}

function parseRoleCompany(value: string): { jobTitle: string; companyName: string } {
  const cleaned = cleanValue(value.replace(/^(?:job title|position|role)\s*:\s*/i, ''));
  const atMatch = cleaned.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i);
  if (atMatch) return disambiguateRoleCompany(cleanValue(atMatch[1]), cleanValue(atMatch[2]));

  const pieces = cleaned.split(/\s+(?:\||—|–|-)\s+/).map(cleanValue).filter(Boolean);
  if (pieces.length >= 2) return disambiguateRoleCompany(pieces[0], pieces.slice(1).join(' | '));
  return { jobTitle: cleaned, companyName: '' };
}

export function detectCurrentJobTitle(text: string, personalText: string, workExperience: WorkExperience[]): string {
  // 1. Explicit labeled check
  const labeled = extractLabeledValue(text, [
    'current job title', 'job title', 'current role', 'position', 'role', 'title', 'headline', 'professional title', 'designation',
  ]);
  if (labeled && isLikelyJobTitle(labeled)) {
    return cleanValue(labeled);
  }

  // 2. Scan personal / contact header lines
  const lines = splitLines(personalText);
  for (const line of lines) {
    if (/@/.test(line) || /\d{7,}/.test(line) || /https?:\/\//i.test(line) || /github|linkedin/i.test(line)) continue;
    if (/^(?:contact|personal|profile|curriculum|resume|phone|email)\b/i.test(line)) continue;

    const parts = line.split(/\s*[|•–—/]\s*/).map(cleanValue).filter(Boolean);
    const titleCandidate = parts.find((p) => isLikelyJobTitle(p));
    if (titleCandidate) {
      return titleCandidate;
    }
    if (isLikelyJobTitle(line)) {
      return cleanValue(line);
    }
  }

  // 3. Fallback to most recent job in work experience
  if (workExperience.length > 0 && workExperience[0].job_title) {
    const job = workExperience[0].job_title;
    if (isLikelyJobTitle(job)) {
      return job;
    }
  }

  // 4. Labeled fallback
  if (labeled) {
    return cleanValue(labeled);
  }

  // 5. First job fallback
  if (workExperience.length > 0 && workExperience[0].job_title) {
    return workExperience[0].job_title;
  }

  return '';
}

function extractWorkExperience(text: string): WorkExperience[] {
  const lines = text.split(/\r?\n/);
  const blocks: string[][] = [];
  let current: string[] = [];
  const flush = () => {
    const trimmed = current.map((line) => line.trim()).filter(Boolean);
    if (trimmed.length) blocks.push(trimmed);
    current = [];
  };

  for (const line of lines) {
    if (!line.trim()) {
      if (current.length && current.some((item) => dateRangeIn(item)) && current.some(isBullet)) flush();
      else if (current.length) current.push('');
      continue;
    }
    const hasDate = Boolean(dateRangeIn(line));
    const previousHasDate = current.some((item) => dateRangeIn(item));
    const previousHasBullet = current.some(isBullet);
    if (hasDate && previousHasDate) flush();
    else if (previousHasDate && previousHasBullet && !isBullet(line) && !hasDate
      && line.length < 90 && !/^(?:built|created|developed|designed|implemented|led|managed|improved|increased|reduced|delivered|achieved|responsible|collaborated)\b/i.test(line)) {
      flush();
    }
    current.push(line);
  }
  flush();

  return blocks.map((block) => {
    const dateIndex = block.findIndex((line) => dateRangeIn(line));
    const headerLines = dateIndex >= 0 ? block.slice(0, dateIndex + 1) : block.slice(0, 2);
    const dateLine = dateIndex >= 0 ? block[dateIndex] : '';
    const range = dateLine ? dateRangeIn(dateLine) : null;
    let headerText = '';
    if (dateLine) {
      const remainder = dateLine.replace(dateRangePattern, '').replace(/[()[\],|:—–-]/g, ' ').trim();
      headerText = remainder || headerLines.slice(0, -1).join(' ');
    } else {
      headerText = headerLines.filter((line) => !isBullet(line)).join(' ');
    }

    let { jobTitle, companyName } = parseRoleCompany(headerText);
    if ((!companyName || isLikelyCompanyName(jobTitle)) && dateIndex > 0) {
      const priorHeader = block.slice(0, dateIndex).filter((line) => !isBullet(line));
      if (priorHeader.length >= 2) {
        const disambiguated = disambiguateRoleCompany(cleanValue(priorHeader[0]), cleanValue(priorHeader[1]));
        jobTitle = disambiguated.jobTitle;
        companyName = disambiguated.companyName;
      }
    }
    const contentLines = block.filter((line, index) => {
      if (index === dateIndex) return false;
      if (dateIndex < 0 && index < headerLines.length) return false;
      return !headerLines.includes(line) || isBullet(line);
    });
    const responsibilities = contentLines.map((line) => cleanValue(line.replace(/^(?:[-*•▪◦]|\d+[.)])\s*/, ''))).filter(Boolean);
    const fullContent = block.join('\n');
    const detectedInBlock = detectAllSkillsInDocument(fullContent);
    const skillsUsed = [...new Set([
      ...detectedInBlock.technical_skills,
      ...detectedInBlock.ai_skills,
      ...detectedInBlock.tools_and_technologies,
    ])];

    return {
      job_title: jobTitle,
      company_name: companyName,
      employment_start_date: range?.start ?? extractLabeledValue(block.join('\n'), ['employment start date', 'start date']),
      employment_end_date: range?.end ?? (range?.ongoing ? null : extractLabeledValue(block.join('\n'), ['employment end date', 'end date'])),
      job_responsibilities: responsibilities,
      achievements: responsibilities.filter(isAchievement),
      skills_used: skillsUsed,
    };
  }).filter((job) => job.job_title || job.company_name || job.employment_start_date || job.job_responsibilities.length);
}

function extractProjects(sections: ReturnType<typeof classifyResumeSections>, candidateName: string = ''): Project[] {
  return sections.filter((section) => section.category === 'Projects')
    .flatMap((section) => extractProjectDetails(section.text, [candidateName]).map((project) => {
      const description = project.description ?? '';
      const fullText = `${project.name ?? ''}\n${description}`;
      const explicitTech = extractLabeledValue(description, ['technologies', 'tech stack', 'tools used', 'technology']);
      const detectedInProject = detectAllSkillsInDocument(fullText);
      const tech = [...new Set([
        ...extractList(explicitTech),
        ...detectedInProject.technical_skills,
        ...detectedInProject.ai_skills,
        ...detectedInProject.tools_and_technologies,
      ])];
      const url = fullText.match(/\bhttps?:\/\/[^\s)]+/i)?.[0] ?? null;
      const role = extractLabeledValue(description, ['project role', 'role', 'my role']);
      const outcomes = splitLines(description).filter((line) =>
        isAchievement(line) || /^\s*(?:outcome|result|impact)\s*[:—-]/i.test(line),
      );

      let name = cleanProjectTitle(project.name ?? '', [candidateName]);
      if (!name || isHumanName(name, [candidateName])) {
        // Fallback: use first technology or software
        const leadTech = tech[0] || 'Software';
        name = `${leadTech} Application`;
      }

      return {
        project_name: name,
        project_description: description,
        project_technologies: tech,
        project_role: role,
        project_outcomes: outcomes,
        portfolio_url: url,
      };
    }));
}

const MALAYSIAN_STATES = [
  'Johor', 'Selangor', 'Kuala Lumpur', 'Penang', 'Pulau Pinang',
  'Perak', 'Melaka', 'Malacca', 'Negeri Sembilan', 'Pahang',
  'Kedah', 'Kelantan', 'Terengganu', 'Perlis', 'Sabah', 'Sarawak',
  'Putrajaya', 'Labuan',
];

const MALAYSIAN_CITIES: Record<string, string> = {
  // Johor
  skudai: 'Skudai, Johor',
  'johor bahru': 'Johor Bahru, Johor',
  jb: 'Johor Bahru, Johor',
  'iskandar puteri': 'Iskandar Puteri, Johor',
  kulai: 'Kulai, Johor',
  senai: 'Senai, Johor',
  'gelang patah': 'Gelang Patah, Johor',
  'batu pahat': 'Batu Pahat, Johor',
  muar: 'Muar, Johor',
  kluang: 'Kluang, Johor',
  'pasir gudang': 'Pasir Gudang, Johor',
  pontian: 'Pontian, Johor',
  'kota tinggi': 'Kota Tinggi, Johor',
  segamat: 'Segamat, Johor',
  'ulu tiram': 'Ulu Tiram, Johor',
  masai: 'Masai, Johor',

  // Selangor
  'petaling jaya': 'Petaling Jaya, Selangor',
  pj: 'Petaling Jaya, Selangor',
  'shah alam': 'Shah Alam, Selangor',
  'subang jaya': 'Subang Jaya, Selangor',
  subang: 'Subang Jaya, Selangor',
  klang: 'Klang, Selangor',
  cyberjaya: 'Cyberjaya, Selangor',
  puchong: 'Puchong, Selangor',
  'seri kembangan': 'Seri Kembangan, Selangor',
  bangi: 'Bangi, Selangor',
  serdang: 'Serdang, Selangor',
  damansara: 'Damansara, Selangor',
  sepang: 'Sepang, Selangor',
  kajang: 'Kajang, Selangor',
  ampang: 'Ampang, Selangor',
  rawang: 'Rawang, Selangor',
  selayang: 'Selayang, Selangor',
  sunway: 'Bandar Sunway, Selangor',

  // Federal Territories
  'kuala lumpur': 'Kuala Lumpur, Malaysia',
  kl: 'Kuala Lumpur, Malaysia',
  putrajaya: 'Putrajaya, Malaysia',
  labuan: 'Labuan, Malaysia',
  cheras: 'Cheras, Kuala Lumpur',
  bangsar: 'Bangsar, Kuala Lumpur',
  'mont kiara': 'Mont Kiara, Kuala Lumpur',
  setapak: 'Setapak, Kuala Lumpur',
  kepong: 'Kepong, Kuala Lumpur',

  // Penang
  'george town': 'George Town, Penang',
  georgetown: 'George Town, Penang',
  'bayan lepas': 'Bayan Lepas, Penang',
  butterworth: 'Butterworth, Penang',
  'bukit mertajam': 'Bukit Mertajam, Penang',
  gelugor: 'Gelugor, Penang',
  'seberang perai': 'Seberang Perai, Penang',

  // Perak
  ipoh: 'Ipoh, Perak',
  taiping: 'Taiping, Perak',
  kampar: 'Kampar, Perak',
  'teluk intan': 'Teluk Intan, Perak',

  // Melaka
  melaka: 'Melaka, Malaysia',
  malacca: 'Melaka, Malaysia',
  'ayer keroh': 'Ayer Keroh, Melaka',

  // Negeri Sembilan
  seremban: 'Seremban, Negeri Sembilan',
  nilai: 'Nilai, Negeri Sembilan',
  'port dickson': 'Port Dickson, Negeri Sembilan',

  // Pahang
  kuantan: 'Kuantan, Pahang',
  'cameron highlands': 'Cameron Highlands, Pahang',
  bentong: 'Bentong, Pahang',

  // Kedah
  'alor setar': 'Alor Setar, Kedah',
  'sungai petani': 'Sungai Petani, Kedah',
  kulim: 'Kulim, Kedah',
  langkawi: 'Langkawi, Kedah',

  // Kelantan
  'kota bharu': 'Kota Bharu, Kelantan',

  // Terengganu
  'kuala terengganu': 'Kuala Terengganu, Terengganu',
  kemaman: 'Kemaman, Terengganu',

  // Perlis
  kangar: 'Kangar, Perlis',

  // Sarawak
  kuching: 'Kuching, Sarawak',
  miri: 'Miri, Sarawak',
  sibu: 'Sibu, Sarawak',
  bintulu: 'Bintulu, Sarawak',

  // Sabah
  'kota kinabalu': 'Kota Kinabalu, Sabah',
  sandakan: 'Sandakan, Sabah',
  tawau: 'Tawau, Sabah',
};

const INTERNATIONAL_LOCATIONS: Record<string, string> = {
  singapore: 'Singapore',
  jakarta: 'Jakarta, Indonesia',
  bandung: 'Bandung, Indonesia',
  surabaya: 'Surabaya, Indonesia',
  bangkok: 'Bangkok, Thailand',
  'ho chi minh': 'Ho Chi Minh City, Vietnam',
  hanoi: 'Hanoi, Vietnam',
  manila: 'Manila, Philippines',
  tokyo: 'Tokyo, Japan',
  seoul: 'Seoul, South Korea',
  'hong kong': 'Hong Kong',
  taipei: 'Taipei, Taiwan',
  sydney: 'Sydney, Australia',
  melbourne: 'Melbourne, Australia',
  london: 'London, United Kingdom',
  toronto: 'Toronto, Canada',
  vancouver: 'Vancouver, Canada',
  'new york': 'New York, USA',
  'san francisco': 'San Francisco, USA',
  seattle: 'Seattle, USA',
};

function parseLocationFromSnippet(snippet: string): string | null {
  const lower = snippet.toLowerCase();

  // 1. Check Malaysian cities
  const sortedCities = Object.keys(MALAYSIAN_CITIES).sort((a, b) => b.length - a.length);
  for (const city of sortedCities) {
    const escaped = escapeRegExp(city);
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    if (regex.test(lower)) {
      for (const state of MALAYSIAN_STATES) {
        const stateRegex = new RegExp(`(^|[^a-z0-9])${escapeRegExp(state.toLowerCase())}([^a-z0-9]|$)`, 'i');
        if (stateRegex.test(lower)) {
          const normCity = city.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          return `${normCity}, ${state === 'Pulau Pinang' ? 'Penang' : state}`;
        }
      }
      return MALAYSIAN_CITIES[city];
    }
  }

  // 2. Check Malaysian states
  for (const state of MALAYSIAN_STATES) {
    const stateRegex = new RegExp(`(^|[^a-z0-9])${escapeRegExp(state.toLowerCase())}([^a-z0-9]|$)`, 'i');
    if (stateRegex.test(lower)) {
      const normState = state === 'Pulau Pinang' ? 'Penang' : state;
      return `${normState}, Malaysia`;
    }
  }

  // 3. Check International locations
  for (const [intCity, formatted] of Object.entries(INTERNATIONAL_LOCATIONS)) {
    const intRegex = new RegExp(`(^|[^a-z0-9])${escapeRegExp(intCity)}([^a-z0-9]|$)`, 'i');
    if (intRegex.test(lower)) {
      return formatted;
    }
  }

  // 4. Country alone
  if (/\bmalaysia\b/i.test(lower)) {
    return 'Malaysia';
  }

  return null;
}

export function detectLocation(text: string, contactText: string = ''): string {
  // 1. Check labeled field: "Location:", "Address:", "Based in:", "Residence:"
  const labeled = extractLabeledValue(text, [
    'location', 'based in', 'current location', 'address',
    'residence', 'city', 'state', 'living in', 'present address',
  ]);
  if (labeled) {
    const parsed = parseLocationFromSnippet(labeled);
    if (parsed) return parsed;
    const cleaned = cleanValue(
      labeled
        .replace(/^(?:no\.?\s*\d+[^,]+,\s*)/i, '')
        .replace(/\b(?:jalan|lorong|taman|kampung|persiaran)\s+[^,]+/gi, '')
        .replace(/\b\d{5}\b/g, '')
        .replace(/^[\s,]+|[\s,]+$/g, ''),
    );
    if (cleaned.length >= 3 && cleaned.length <= 40 && cleaned.split(',').length <= 3) {
      return cleaned;
    }
  }

  // 2. Scan contact header lines (usually line 2-10 of resume)
  const headerLines = splitLines(contactText).slice(0, 12);
  for (const line of headerLines) {
    const segments = line.split(/[|•·\t]+/).map(cleanValue).filter(Boolean);
    for (const segment of segments) {
      if (/@/.test(segment) || /https?:\/\/|www\./i.test(segment) || /\+?\d[\d\s().-]{7,}/.test(segment)) {
        continue;
      }
      const parsed = parseLocationFromSnippet(segment);
      if (parsed) return parsed;
    }
  }

  // 3. Scan top 15 lines of whole text
  const topLines = splitLines(text).slice(0, 15);
  for (const line of topLines) {
    const segments = line.split(/[|•·\t]+/).map(cleanValue).filter(Boolean);
    for (const segment of segments) {
      if (/@/.test(segment) || /https?:\/\/|www\./i.test(segment) || /\+?\d[\d\s().-]{7,}/.test(segment)) {
        continue;
      }
      const parsed = parseLocationFromSnippet(segment);
      if (parsed) return parsed;
    }
  }

  // 4. Check for institution location (e.g. UTM Skudai Johor)
  const utmMatch = text.match(/\b(?:universiti\s+teknologi\s+malaysia|utm)\b[^\n]{0,80}\b(skudai|johor(?:\s+bahru)?)\b/i);
  if (utmMatch) {
    return 'Skudai, Johor';
  }

  // 5. Scan whole document for Malaysian city match
  const docParsed = parseLocationFromSnippet(text);
  if (docParsed && docParsed !== 'Malaysia') {
    return docParsed;
  }

  return '';
}

function detectIndustry(text: string): string {
  return industries.find((industry) => new RegExp(`\\b${escapeRegExp(industry)}\\b`, 'i').test(text)) ?? '';
}

function readCareerPreferences(text: string): StructuredResume['career_preferences'] {
  const targetRoles = extractList(extractLabeledValue(text, ['target job roles', 'target roles', 'desired roles', 'target position']));
  const preferredIndustries = extractList(extractLabeledValue(text, ['preferred industries', 'target industries']));
  const preferredLocations = extractList(extractLabeledValue(text, ['preferred work location', 'preferred location', 'desired location', 'preferred locations']));
  const modeText = extractLabeledValue(text, ['preferred work mode', 'work mode', 'work arrangement']).toLowerCase();
  const preferredWorkMode = /\bremote\b/.test(modeText)
    ? 'remote'
    : /\bhybrid\b/.test(modeText)
      ? 'hybrid'
      : /\bon[\s-]?site\b/.test(modeText) ? 'on-site' : '';

  return {
    target_job_roles: targetRoles,
    preferred_industries: preferredIndustries,
    preferred_work_location: preferredLocations,
    preferred_work_mode: preferredWorkMode,
    career_goals: extractLabeledValue(text, ['career goals', 'career objective', 'professional goals', 'development goals']),
  };
}

const GITHUB_BLACKLIST = new Set([
  'about', 'blog', 'explore', 'topics', 'trending', 'features', 'pricing',
  'enterprise', 'security', 'login', 'signup', 'join', 'contact', 'settings',
  'marketplace', 'pulls', 'issues', 'notifications', 'collections', 'events',
  'sponsors', 'readme', 'site', 'orgs',
]);

const LINKEDIN_BLACKLIST = new Set([
  'in', 'pub', 'feed', 'jobs', 'learning', 'company', 'school', 'help',
  'pulse', 'share', 'signup', 'login', 'messaging', 'notifications',
]);

export function cleanUrlCandidate(raw: string): string {
  let cleaned = raw
    .trim()
    .replace(/^[\s(<\[{'"]+|[\s)>\]}'",;:.]+$/g, '')
    .trim();
  cleaned = cleaned.replace(/[?#].*$/, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned.trim();
}

export function detectGitHubUrl(text: string, contactText?: string): string {
  const combined = `${contactText || ''}\n${text}`;

  // 1. Direct or protocol-less URL: github.com/username or github.com/username/repo
  // Matches optional OCR spaces: "github . com / username"
  const urlRegex = /(?:https?:\s*\/\/\s*)?(?:www\s*\.\s*)?github\s*\.\s*com\s*\/\s*([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})/gi;
  
  let match: RegExpExecArray | null;
  const candidates: string[] = [];

  while ((match = urlRegex.exec(combined)) !== null) {
    const username = cleanUrlCandidate(match[1]);
    if (username && !GITHUB_BLACKLIST.has(username.toLowerCase())) {
      candidates.push(username);
    }
  }

  if (candidates.length > 0) {
    if (contactText) {
      const contactMatch = /(?:https?:\s*\/\/\s*)?(?:www\s*\.\s*)?github\s*\.\s*com\s*\/\s*([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})/i.exec(contactText);
      if (contactMatch) {
        const u = cleanUrlCandidate(contactMatch[1]);
        if (u && !GITHUB_BLACKLIST.has(u.toLowerCase())) {
          return `https://github.com/${u}`;
        }
      }
    }
    return `https://github.com/${candidates[0]}`;
  }

  // 2. Labeled: "GitHub: username", "GitHub: @username", "GitHub - username"
  const labeledRegex = /(?:github|git\s*profile|github\s*handle)\s*(?:[:|\-—–]|\bat\b)\s*[@\/]?\s*([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})\b/i;
  const labelMatch = combined.match(labeledRegex);
  if (labelMatch) {
    const username = cleanUrlCandidate(labelMatch[1]);
    if (username && !GITHUB_BLACKLIST.has(username.toLowerCase()) && !/^https?$/i.test(username)) {
      return `https://github.com/${username}`;
    }
  }

  return '';
}

export function detectLinkedInUrl(text: string, contactText?: string): string {
  const combined = `${contactText || ''}\n${text}`;

  // 1. Direct or regional URL: [country.]linkedin.com/in/username
  // Matches optional OCR spaces: "linkedin . com / in / username"
  const urlRegex = /(?:https?:\s*\/\/\s*)?(?:[a-zA-Z0-9-_]+\s*\.\s*)?linkedin\s*\.\s*com\s*\/\s*in\s*\/\s*([a-zA-Z0-9_%-]+)/gi;

  let match: RegExpExecArray | null;
  const candidates: string[] = [];

  while ((match = urlRegex.exec(combined)) !== null) {
    const rawUsername = cleanUrlCandidate(match[1]);
    if (rawUsername && !LINKEDIN_BLACKLIST.has(rawUsername.toLowerCase())) {
      candidates.push(rawUsername);
    }
  }

  if (candidates.length > 0) {
    if (contactText) {
      const contactMatch = /(?:https?:\s*\/\/\s*)?(?:[a-zA-Z0-9-_]+\s*\.\s*)?linkedin\s*\.\s*com\s*\/\s*in\s*\/\s*([a-zA-Z0-9_%-]+)/i.exec(contactText);
      if (contactMatch) {
        const u = cleanUrlCandidate(contactMatch[1]);
        if (u && !LINKEDIN_BLACKLIST.has(u.toLowerCase())) {
          return `https://www.linkedin.com/in/${u}`;
        }
      }
    }
    return `https://www.linkedin.com/in/${candidates[0]}`;
  }

  // 2. Labeled: "LinkedIn: in/username", "LinkedIn: username", "LinkedIn - username"
  const labeledRegex = /(?:linkedin|linked\s*in)\s*(?:[:|\-—–]|\bat\b)\s*(?:in\/)?\s*[@\/]?\s*([a-zA-Z0-9_%-]{3,100})\b/i;
  const labelMatch = combined.match(labeledRegex);
  if (labelMatch) {
    const username = cleanUrlCandidate(labelMatch[1]);
    if (username && !LINKEDIN_BLACKLIST.has(username.toLowerCase()) && !/^https?$/i.test(username)) {
      return `https://www.linkedin.com/in/${username}`;
    }
  }

  return '';
}

export function detectPortfolioUrl(text: string, contactText?: string): string {
  const combined = `${contactText || ''}\n${text}`;

  // 1. Labeled portfolio or website
  const labeledRegex = /(?:portfolio|personal\s*website|website|web)\s*[:|\-—–]\s*(https?:\/\/[^\s,;]+|[a-zA-Z0-9.-]+\.(?:dev|me|io|design|app|tech|page)\b[^\s,;]*)/i;
  const labelMatch = combined.match(labeledRegex);
  if (labelMatch) {
    let url = cleanUrlCandidate(labelMatch[1]);
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    return url;
  }

  // 2. Direct domains like username.github.io or username.dev
  const devDomainMatch = combined.match(/(?:https?:\/\/)?([a-zA-Z0-9.-]+\.(?:github\.io|dev|me|design))\b/i);
  if (devDomainMatch) {
    let url = cleanUrlCandidate(devDomainMatch[0]);
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    return url;
  }

  return '';
}

export function extractStructuredResume(text: string): StructuredResume {
  const sections = classifyResumeSections(text);
  const textFor = (category: string) => sections
    .filter((section) => section.category === category)
    .map((section) => section.text)
    .join('\n');
  const personalText = `${textFor('Contact & Profile')}\n${textFor('Professional Summary')}`.trim()
    || text.split(/\r?\n/).slice(0, 8).join('\n');
  const workText = textFor('Work Experience');
  const educationText = textFor('Education');
  const awardsText = textFor('Awards & Honors');
  const skillsText = textFor('Skills');
  const certificationsText = textFor('Certifications')
    || extractLabeledValue(skillsText, ['certifications', 'certificates']);
  const languageText = textFor('Languages')
    || extractLabeledValue(skillsText, ['languages', 'spoken languages']);
  const workExperience = extractWorkExperience(workText);
  const firstJob = workExperience[0];

  const email = personalText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]
    ?? text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]
    ?? '';
  const phoneMatch = personalText.match(/(?:phone|mobile|tel(?:ephone)?)\s*[:|—-]?\s*(\+?\d[\d\s().-]{7,}\d)/i)
    ?? personalText.match(/(\+?\d[\d\s().-]{7,}\d)/);
  const phone = phoneMatch?.[1] ?? phoneMatch?.[0] ?? '';
  const headerLines = splitLines(textFor('Contact & Profile'));
  const labeledName = extractLabeledValue(text, ['full name', 'candidate name', 'name']);
  const firstLineName = headerLines.find((line) =>
    !/@/.test(line)
    && !/\d{7,}/.test(line)
    && !/^(?:personal information|contact information|resume|curriculum vitae)$/i.test(line)
    && line.split(/\s+/).length <= 6,
  ) ?? '';
  const fullName = labeledName || firstLineName;
  const currentTitle = detectCurrentJobTitle(text, personalText, workExperience);
  const statusLabel = extractLabeledValue(text, ['current employment status', 'employment status', 'current status']);
  const explicitStatus = normalizedStatus(statusLabel)
    || normalizedStatus(personalText.match(/\b(?:currently\s+)?(student|employed|unemployed|freelancer|career changer)\b/i)?.[1] ?? '');
  const employmentStatus = explicitStatus
    || (firstJob?.employment_end_date === null ? 'employed' : '');
  const location = detectLocation(text, `${textFor('Contact & Profile')}\n${textFor('Professional Summary')}`);
  const education = extractEducation(educationText, awardsText, text);
  const skills = extractSkills(skillsText, text);
  skills.certifications = extractCertifications(certificationsText);
  skills.languages = extractLanguages(languageText);
  const projects = extractProjects(sections, fullName);
  const industry = extractLabeledValue(personalText, ['industry', 'industry sector', 'primary industry'])
    || detectIndustry(`${textFor('Professional Summary')}\n${workText}`);
  const github_url = detectGitHubUrl(text, personalText);
  const linkedin_url = detectLinkedInUrl(text, personalText);
  const portfolio_url = detectPortfolioUrl(text, personalText);

  return {
    personal_information: {
      full_name: fullName,
      email,
      phone_number: phone,
      current_job_title: currentTitle,
      current_employment_status: employmentStatus,
      years_of_experience: calculateExperienceYears(workText),
      industry,
      location,
      github_url,
      linkedin_url,
      portfolio_url,
    },
    education,
    skills,
    work_experience: workExperience,
    projects,
    career_preferences: readCareerPreferences(text),
  };
}
