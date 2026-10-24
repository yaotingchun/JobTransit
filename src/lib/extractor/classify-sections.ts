import { extractProjectDetails } from './parse-projects.ts';

export type ResumeSectionCategory =
  | 'Contact & Profile'
  | 'Professional Summary'
  | 'Work Experience'
  | 'Education'
  | 'Skills'
  | 'Projects'
  | 'Certifications'
  | 'Volunteer Experience'
  | 'Languages'
  | 'Awards & Honors'
  | 'Publications'
  | 'Interests'
  | 'References'
  | 'Career Preferences'
  | 'Other';

export type ClassifiedResumeSection = {
  category: ResumeSectionCategory;
  heading: string | null;
  text: string;
};

const sectionHeadings: Array<{
  category: ResumeSectionCategory;
  aliases: string[];
}> = [
  {
    category: 'Contact & Profile',
    aliases: ['contact', 'contact information', 'personal details', 'personal information', 'personal profile'],
  },
  {
    category: 'Professional Summary',
    aliases: ['summary', 'professional summary', 'executive summary', 'career summary', 'profile', 'objective', 'career objective', 'about me'],
  },
  {
    category: 'Work Experience',
    aliases: ['experience', 'work experience', 'professional experience', 'employment', 'employment history', 'work history', 'career history', 'professional background'],
  },
  {
    category: 'Education',
    aliases: ['education', 'educational background', 'academic background', 'academic qualifications', 'qualifications'],
  },
  {
    category: 'Skills',
    aliases: [
      'skills', 'skill set', 'skills and abilities', 'skills and expertise', 'skills and competencies',
      'technical skills', 'core skills', 'key skills', 'hard skills', 'professional skills',
      'core competencies', 'key competencies', 'competencies', 'areas of expertise', 'specialties',
      'tools and technologies', 'tools and tech', 'tools & technologies', 'technologies', 'tech stack',
      'technical stack', 'technology stack', 'developer stack', 'technical background', 'technical proficiencies',
      'technical expertise', 'it skills', 'software skills', 'developer skills', 'computer skills',
      'programming languages', 'coding languages', 'computer languages',
      'frameworks and libraries', 'frameworks & libraries', 'frameworks', 'libraries',
      'tools and frameworks', 'tools & frameworks', 'developer tools', 'development tools', 'tools',
      'cloud and devops', 'cloud & devops', 'cloud technologies', 'cloud platforms', 'devops',
      'databases', 'database systems', 'database management', 'data stores',
      'ai and data science', 'ai & data science', 'data science', 'machine learning', 'artificial intelligence', 'ai skills',
      'soft skills', 'interpersonal skills', 'personal skills', 'strengths', 'key strengths', 'personal attributes',
    ],
  },
  {
    category: 'Projects',
    aliases: ['projects', 'selected projects', 'academic projects', 'personal projects', 'key projects'],
  },
  {
    category: 'Certifications',
    aliases: ['certifications', 'certificates', 'licenses', 'licenses and certifications', 'certifications and licenses', 'professional certifications'],
  },
  {
    category: 'Volunteer Experience',
    aliases: ['volunteer', 'volunteer experience', 'volunteer work', 'community involvement', 'community service'],
  },
  {
    category: 'Languages',
    aliases: ['spoken languages', 'foreign languages', 'language proficiency', 'language skills', 'languages'],
  },
  {
    category: 'Awards & Honors',
    aliases: [
      'awards', 'honors', 'honours', 'awards and honors', 'awards and honours', 'achievements',
      'accomplishments', 'academic achievements', 'academic achievement', 'academic honors',
      'academic honours', 'academic awards', 'scholarships', 'scholarships and awards',
      'honors and awards', 'honours and awards', 'awards & achievements', 'honors & achievements',
    ],
  },
  {
    category: 'Publications',
    aliases: ['publications', 'research', 'research experience', 'presentations'],
  },
  {
    category: 'Interests',
    aliases: ['interests', 'hobbies', 'interests and hobbies'],
  },
  {
    category: 'Career Preferences',
    aliases: ['career preferences', 'career goals', 'job preferences', 'employment preferences'],
  },
  {
    category: 'References',
    aliases: ['references', 'professional references'],
  },
];

function normalizeHeading(value: string): string {
  return value
    .trim()
    .replace(/^[#>*•\s\d.)-]+/, '')
    .replace(/[:|]+$/, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function matchHeading(line: string): { category: ResumeSectionCategory; heading: string; remainder: string } | null {
  const cleaned = line.trim().replace(/^[#>*•\s\d.)-]+/, '');
  if (!cleaned) return null;

  const separators = [':', ' — ', ' – ', ' | ', ' - '];
  const inlineSeparator = separators.find((separator) => cleaned.includes(separator));
  const headingPart = inlineSeparator ? cleaned.slice(0, cleaned.indexOf(inlineSeparator)).trim() : cleaned;
  const remainder = inlineSeparator ? cleaned.slice(cleaned.indexOf(inlineSeparator) + inlineSeparator.length).trim() : '';
  const normalized = normalizeHeading(headingPart);

  if (normalized === 'languages' || normalized === 'language') {
    if (/(?:python|javascript|typescript|java|c\+\+|c#|sql|html|css|php|ruby|golang|rust|dart|kotlin|swift)/i.test(remainder)) {
      return { category: 'Skills', heading: headingPart.replace(/:$/, '').trim(), remainder };
    }
  }

  for (const entry of sectionHeadings) {
    if (entry.aliases.some((alias) => normalizeHeading(alias) === normalized)) {
      return { category: entry.category, heading: headingPart.replace(/:$/, '').trim(), remainder };
    }
  }

  return null;
}

function looksLikeCustomHeading(line: string, previousLineIsBlank: boolean): boolean {
  const cleaned = line.trim().replace(/^[#>*•\s\d.)-]+/, '');
  if (!cleaned || cleaned.length > 56 || /[.!?]$/.test(cleaned)) return false;
  if (cleaned.endsWith(':')) return true;
  return previousLineIsBlank
    && /^[A-Z0-9][A-Z0-9 &/()+,'’-]{1,55}$/.test(cleaned)
    && /[A-Z]/.test(cleaned);
}

export function classifyResumeSections(text: string): ClassifiedResumeSection[] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const sections: ClassifiedResumeSection[] = [];
  let current: ClassifiedResumeSection = {
    category: 'Contact & Profile',
    heading: null,
    text: '',
  };
  let foundHeading = false;

  const flush = () => {
    const content = current.text.trim();
    if (content) sections.push({ ...current, text: content });
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      if (current.text && !current.text.endsWith('\n')) current.text += '\n';
      continue;
    }

    const matched = matchHeading(line);
    if (matched) {
      flush();
      foundHeading = true;
      current = {
        category: matched.category,
        heading: matched.heading,
        text: matched.remainder,
      };
      continue;
    }

    const previousLineIsBlank = index > 0 && !lines[index - 1].trim();
    if (foundHeading && looksLikeCustomHeading(line, previousLineIsBlank)) {
      flush();
      current = { category: 'Other', heading: line.replace(/:$/, '').trim(), text: '' };
      continue;
    }

    current.text += `${current.text ? '\n' : ''}${line}`;
  }

  flush();

  if (!foundHeading) {
    const fullText = text.trim();
    return fullText
      ? [{ category: 'Other', heading: null, text: fullText }]
      : [];
  }

  return sections;
}

export function formatClassifiedSections(sections: ClassifiedResumeSection[]): string {
  return sections
    .map(({ category, heading, text }) => {
      const label = heading && normalizeHeading(heading) !== normalizeHeading(category)
        ? `[${category} — ${heading}]`
        : `[${category}]`;
      if (category === 'Projects') {
        const projects = extractProjectDetails(text)
          .map((project, index) => [
            `Project ${index + 1}`,
            `Project name: ${project.name ?? 'Not identified'}`,
            `Description: ${project.description ?? 'Not identified'}`,
          ].join('\n'))
          .join('\n\n');
        return `${label}\n${projects}\n\nOriginal project section:\n${text}`;
      }
      return `${label}\n${text}`;
    })
    .join('\n\n');
}
