import { ArticleCategory } from '../pipeline/types'

export interface CategoryDefinition {
  id: ArticleCategory
  label: string
  keywords: string[]
  weight: number
}

export const CATEGORY_DEFINITIONS: Record<ArticleCategory, CategoryDefinition> = {
  'ai-ml': {
    id: 'ai-ml',
    label: 'AI & Machine Learning',
    weight: 1.2,
    keywords: [
      'ai', 'llm', 'gpt', 'gemini', 'claude', 'deepseek', 'openai', 'anthropic', 'transformer',
      'machine learning', 'deep learning', 'neural network', 'diffusion', 'inference',
      'weights', 'fine-tuning', 'rlhf', 'rag', 'agentic', 'langchain', 'huggingface',
      'model', 'computer vision', 'nlp', 'embedding', 'vector'
    ],
  },
  'software-engineering': {
    id: 'software-engineering',
    label: 'Software Engineering',
    weight: 1.1,
    keywords: [
      'typescript', 'javascript', 'python', 'rust', 'golang', 'react', 'nextjs', 'vue',
      'node', 'compiler', 'framework', 'library', 'api', 'graphql', 'rest', 'git',
      'github', 'architecture', 'refactor', 'frontend', 'backend', 'full-stack',
      'open source', 'webassembly', 'v8', 'performance', 'debugging', 'testing'
    ],
  },
  'data-cloud': {
    id: 'data-cloud',
    label: 'Cloud & Infrastructure',
    weight: 1.0,
    keywords: [
      'aws', 'gcp', 'azure', 'cloud', 'kubernetes', 'k8s', 'docker', 'container',
      'serverless', 'database', 'postgres', 'postgresql', 'redis', 'kafka', 'distributed',
      's3', 'infra', 'devops', 'ci/cd', 'terraform', 'microservices', 'storage'
    ],
  },
  'security': {
    id: 'security',
    label: 'Cybersecurity',
    weight: 1.0,
    keywords: [
      'vulnerability', 'cve', 'zero-day', 'exploit', 'malware', 'ransomware', 'cyber',
      'security', 'patch', 'breach', 'encryption', 'bug bounty', 'auth', 'phishing',
      'firewall', 'pentest', 'attack'
    ],
  },
  'career-industry': {
    id: 'career-industry',
    label: 'Tech Industry & Careers',
    weight: 0.9,
    keywords: [
      'hiring', 'layoff', 'interview', 'salary', 'compensation', 'startup', 'funding',
      'acquisition', 'venture', 'silicon valley', 'career', 'internship', 'developer job',
      'tech talent', 'culture'
    ],
  },
  'general-tech': {
    id: 'general-tech',
    label: 'General Tech',
    weight: 0.8,
    keywords: [
      'apple', 'google', 'microsoft', 'hardware', 'chip', 'semiconductor', 'gadget',
      'smartphone', 'regulation', 'court', 'ftc', 'eu', 'patent', 'antitrust'
    ],
  },
}
