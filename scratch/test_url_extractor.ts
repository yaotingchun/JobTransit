// Test GitHub and LinkedIn detection logic

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
  return raw
    .trim()
    .replace(/^[\s(<\[{'"]+|[\s)>\]}'",;:.]+$/g, '')
    .trim();
}

export function detectGitHubUrl(text: string, contactText?: string): string {
  const combined = `${contactText || ''}\n${text}`;

  // 1. Check for full or partial github URLs: github.com/username or github.com/username/repo
  // Handle optional OCR spaces: "github . com / username" or "https: // github.com/username"
  const urlRegex = /(?:https?:\s*\/\/\s*)?(?:www\s*\.\s*)?github\s*\.\s*com\s*\/\s*([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})/gi;
  
  let match: RegExpExecArray | null;
  const candidates: string[] = [];

  while ((match = urlRegex.exec(combined)) !== null) {
    const username = match[1]?.trim();
    if (username && !GITHUB_BLACKLIST.has(username.toLowerCase())) {
      candidates.push(username);
    }
  }

  if (candidates.length > 0) {
    // If contactText had one of them, prioritize candidate from contactText
    if (contactText) {
      const contactMatch = /(?:https?:\s*\/\/\s*)?(?:www\s*\.\s*)?github\s*\.\s*com\s*\/\s*([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})/i.exec(contactText);
      if (contactMatch && !GITHUB_BLACKLIST.has(contactMatch[1].toLowerCase())) {
        return `https://github.com/${contactMatch[1]}`;
      }
    }
    return `https://github.com/${candidates[0]}`;
  }

  // 2. Check for labeled GitHub: "GitHub: username", "GitHub: @username", "GitHub - username"
  const labeledRegex = /(?:github|git\s*profile|github\s*handle)\s*(?:[:|\-—–]|\bat\b)\s*[@\/]?\s*([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})\b/i;
  const labelMatch = combined.match(labeledRegex);
  if (labelMatch) {
    const username = labelMatch[1].trim();
    if (username && !GITHUB_BLACKLIST.has(username.toLowerCase())) {
      return `https://github.com/${username}`;
    }
  }

  return '';
}

export function detectLinkedInUrl(text: string, contactText?: string): string {
  const combined = `${contactText || ''}\n${text}`;

  // 1. Check for standard or regional linkedin URLs: [country.]linkedin.com/in/username
  // Handle optional OCR spaces: "linkedin . com / in / username"
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

  // 2. Check for labeled LinkedIn: "LinkedIn: in/username", "LinkedIn: username", "LinkedIn - username"
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

// Run test cases
const testSamples = [
  {
    name: 'Standard HTTPS links in header',
    text: `
      Alex Morgan
      Software Engineer
      Email: alex@example.com | Phone: +60 12-345 6789
      GitHub: https://github.com/alexmorgan
      LinkedIn: https://www.linkedin.com/in/alex-morgan-dev
      Portfolio: https://alexmorgan.dev
    `,
    expectedGh: 'https://github.com/alexmorgan',
    expectedLi: 'https://www.linkedin.com/in/alex-morgan-dev',
  },
  {
    name: 'Protocol-less links with punctuation',
    text: `
      CONTACT
      alex@gmail.com
      github.com/alex-dev, linkedin.com/in/alex-m/
    `,
    expectedGh: 'https://github.com/alex-dev',
    expectedLi: 'https://www.linkedin.com/in/alex-m',
  },
  {
    name: 'Regional LinkedIn & OCR spacing',
    text: `
      Alex Tan
      github . com / alextan99
      https://my.linkedin.com/in/alextan-utm
    `,
    expectedGh: 'https://github.com/alextan99',
    expectedLi: 'https://www.linkedin.com/in/alextan-utm',
  },
  {
    name: 'Labeled without URL structure',
    text: `
      CONTACT DETAILS
      GitHub: @coding-ninja
      LinkedIn: in/coding-ninja-pro
    `,
    expectedGh: 'https://github.com/coding-ninja',
    expectedLi: 'https://www.linkedin.com/in/coding-ninja-pro',
  },
  {
    name: 'Project repo in text, profile in header',
    text: `
      Alex Lee
      github.com/alexlee
      Projects:
      Developed OpenSource App - github.com/alexlee/awesome-project
    `,
    expectedGh: 'https://github.com/alexlee',
  },
];

console.log('--- RUNNING TESTS ---');
for (const sample of testSamples) {
  const gh = detectGitHubUrl(sample.text);
  const li = detectLinkedInUrl(sample.text);
  console.log(`Test: ${sample.name}`);
  console.log(`  GH: ${gh} (expected: ${sample.expectedGh}) => ${gh === sample.expectedGh ? 'PASS' : 'FAIL'}`);
  if (sample.expectedLi) {
    console.log(`  LI: ${li} (expected: ${sample.expectedLi}) => ${li === sample.expectedLi ? 'PASS' : 'FAIL'}`);
  }
}
