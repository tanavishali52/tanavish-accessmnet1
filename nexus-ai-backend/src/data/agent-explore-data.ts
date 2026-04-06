/** Explore / use-case content for the Agents hub. Icon strings are react-icons names (e.g. FiZap), resolved in the hub via CatalogIcon. */

export type AgentExploreTabId =
  | 'use_cases'
  | 'build_business'
  | 'learn'
  | 'monitor'
  | 'research'
  | 'create'
  | 'analyze';

export interface AgentExploreTabDto {
  id: AgentExploreTabId;
  label: string;
}

export interface AgentExploreSuggestionDto {
  icon: string;
  text: string;
}

export interface AgentUseCaseAppDto {
  name: string;
  icon: string;
  type: string;
  desc: string;
}

export const AGENT_EXPLORE_TABS: AgentExploreTabDto[] = [
  { id: 'use_cases', label: 'Use cases' },
  { id: 'build_business', label: 'Build a business' },
  { id: 'learn', label: 'Help me learn' },
  { id: 'monitor', label: 'Monitor the situation' },
  { id: 'research', label: 'Research' },
  { id: 'create', label: 'Create content' },
  { id: 'analyze', label: 'Analyze & research' },
];

export const AGENT_EXPLORE_SUGGESTIONS: Record<AgentExploreTabId, AgentExploreSuggestionDto[]> = {
  use_cases: [
    { icon: 'FiTrendingUp', text: 'Build a space exploration timeline app' },
    { icon: 'FiBarChart2', text: 'Create a real-time stock market tracker' },
    { icon: 'FiCpu', text: 'Prototype an AI chatbot demo application' },
    { icon: 'FiClipboard', text: 'Create a project management Kanban board' },
  ],
  build_business: [
    { icon: 'FiTrendingUp', text: 'Build a revenue tracking dashboard for my business' },
    { icon: 'FiBriefcase', text: 'Help me build a startup pitch deck from scratch' },
    { icon: 'FiDollarSign', text: 'Build a financial model with 3-year projections' },
    { icon: 'FiTarget', text: 'Define customer personas and targeting strategy' },
  ],
  learn: [
    { icon: 'FiCpu', text: 'Explain machine learning concepts step by step' },
    { icon: 'FiGlobe', text: 'Build an interactive language learning tutor' },
    { icon: 'FiBookOpen', text: 'Design a personalised weekly study planner for me' },
    { icon: 'FiAward', text: 'Create an exam preparation and practice quiz app' },
  ],
  monitor: [
    { icon: 'FiFileText', text: 'Build a live news digest dashboard for my industry' },
    { icon: 'FiTrendingDown', text: 'Monitor and visualise market trends in real time' },
    { icon: 'FiBell', text: 'Monitor brand mentions across social media' },
    { icon: 'FiBarChart2', text: 'Set up automated KPI tracking for my team' },
  ],
  research: [
    { icon: 'FiSearch', text: 'Summarise the latest research papers on AI' },
    { icon: 'FiBookOpen', text: 'Create a literature review on a technical subject' },
    { icon: 'FiBarChart2', text: 'Find and compare datasets for my research topic' },
    { icon: 'FiFileText', text: 'Generate a structured research report on any topic' },
  ],
  create: [
    { icon: 'FiEdit3', text: 'Write SEO-optimised blog posts for my brand' },
    { icon: 'FiSmartphone', text: 'Generate a social media content calendar and posts' },
    { icon: 'FiVideo', text: 'Write a compelling video script for YouTube' },
    { icon: 'FiMail', text: 'Write a high-converting email marketing sequence' },
  ],
  analyze: [
    { icon: 'FiBarChart2', text: 'Analyse my spreadsheet data and generate insights' },
    { icon: 'FiTrendingDown', text: 'Identify and visualise trends in my dataset' },
    { icon: 'FiFileText', text: 'Generate a structured analytical report from my data' },
    { icon: 'FiZap', text: 'Generate business insights and recommendations' },
  ],
};

export const AGENT_USE_CASE_APPS: Record<AgentExploreTabId, AgentUseCaseAppDto[]> = {
  use_cases: [
    { name: 'Space Exploration Timeline', icon: 'FiTrendingUp', type: 'Interactive App', desc: 'From Sputnik to Artemis — an interactive journey through space history' },
    { name: 'Big Mac Index Explorer', icon: 'FiPieChart', type: 'Data Visualisation', desc: 'Explore purchasing power parity with the iconic Big Mac Index' },
    { name: 'Windows 3.1 Simulator', icon: 'FiMonitor', type: 'Retro App', desc: 'A faithful recreation of the classic Windows 3.1 experience' },
    { name: 'Art Heist Mystery', icon: 'FiImage', type: 'Interactive Game', desc: 'Solve famous art heists in this immersive mystery experience' },
    { name: 'Live Stock Tracker', icon: 'FiBarChart2', type: 'Dashboard', desc: 'Real-time stock market visualisation with live data feeds' },
    { name: 'World Data Map', icon: 'FiGlobe', type: 'Data Visualisation', desc: 'Interactive globe showing country-level statistics and trends' },
    { name: 'AI Chatbot Demo', icon: 'FiCpu', type: 'AI App', desc: 'Build and deploy a conversational AI chatbot in minutes' },
    { name: 'Live Leaderboard', icon: 'FiAward', type: 'Interactive App', desc: 'Real-time competition scoring with animated rankings' },
    { name: 'Kanban Board', icon: 'FiClipboard', type: 'Productivity', desc: 'Drag-and-drop project management with task tracking' },
    { name: 'Trivia Game', icon: 'FiGrid', type: 'Game', desc: 'A fun browser-based quiz game with score tracking' },
  ],
  build_business: [
    { name: 'Revenue Dashboard', icon: 'FiTrendingUp', type: 'Dashboard', desc: 'Track revenue, expenses and profit margins in real-time' },
    { name: 'Invoice Generator', icon: 'FiFileText', type: 'Business Tool', desc: 'Automated professional invoice creation and management' },
    { name: 'CRM Contact Tracker', icon: 'FiUsers', type: 'Business Tool', desc: 'Simple but powerful customer relationship management' },
    { name: 'Email Campaign Planner', icon: 'FiMail', type: 'Marketing', desc: 'Plan and schedule email marketing campaigns visually' },
    { name: 'Startup Pitch Deck', icon: 'FiBriefcase', type: 'Business', desc: 'AI-assisted pitch deck creation from business data' },
    { name: 'Competitor Analysis', icon: 'FiGitBranch', type: 'Research', desc: 'Compare features, pricing and positioning of competitors' },
    { name: 'Go-to-Market Strategy', icon: 'FiMap', type: 'Strategy', desc: 'Build a comprehensive GTM plan for your product' },
    { name: 'Financial Model', icon: 'FiDollarSign', type: 'Finance', desc: '3-year financial projections with scenario analysis' },
    { name: 'Business Plan Writer', icon: 'FiHome', type: 'Business', desc: 'Generate comprehensive SaaS business plans' },
    { name: 'Customer Personas', icon: 'FiTarget', type: 'Marketing', desc: 'Define and visualise your ideal customer segments' },
  ],
  learn: [
    { name: 'ML Concepts Explained', icon: 'FiCpu', type: 'Educational', desc: 'Step-by-step machine learning concept visualiser' },
    { name: 'Language Tutor', icon: 'FiGlobe', type: 'Educational', desc: 'Interactive language learning with speech recognition' },
    { name: 'Science Quiz App', icon: 'FiActivity', type: 'Educational Game', desc: 'Gamified science quizzes for students of all levels' },
    { name: 'Study Planner', icon: 'FiBookOpen', type: 'Productivity', desc: 'Personalised weekly study schedule generator' },
    { name: 'Research Paper Reader', icon: 'FiSearch', type: 'AI Tool', desc: 'AI-powered research paper summarisation and Q&A' },
    { name: 'Concept Map Tool', icon: 'FiZap', type: 'Visual Learning', desc: 'Build interactive concept maps for any subject' },
    { name: 'Exam Prep Quiz', icon: 'FiAward', type: 'Educational', desc: 'Practice exams with adaptive difficulty' },
    { name: 'Writing Coach', icon: 'FiEdit3', type: 'AI Tool', desc: 'Real-time writing feedback and improvement suggestions' },
    { name: 'Textbook Summariser', icon: 'FiBook', type: 'AI Tool', desc: 'Condense textbook chapters into clear summaries' },
    { name: 'Subject Quizzer', icon: 'FiGrid', type: 'Educational Game', desc: 'Test yourself on any topic with AI-generated questions' },
  ],
  monitor: [
    { name: 'News Digest', icon: 'FiFileText', type: 'Dashboard', desc: 'Live industry news aggregation and trending topics' },
    { name: 'Market Trends', icon: 'FiTrendingDown', type: 'Data Visualisation', desc: 'Real-time market trend monitoring and analysis' },
    { name: 'Website Tracker', icon: 'FiGlobe', type: 'Monitoring', desc: 'Track competitor website changes and updates' },
    { name: 'Keyword Alerts', icon: 'FiZap', type: 'Monitoring', desc: 'Smart keyword monitoring with notification system' },
    { name: 'Brand Monitor', icon: 'FiBell', type: 'Social Listening', desc: 'Track brand mentions across social platforms' },
    { name: 'API Health Monitor', icon: 'FiWifi', type: 'DevOps', desc: 'Uptime and performance monitoring for APIs' },
    { name: 'Security Dashboard', icon: 'FiShield', type: 'Security', desc: 'Real-time security event monitoring and alerts' },
    { name: 'Trending Topics', icon: 'FiLayers', type: 'Analytics', desc: 'Discover and track trending topics in your industry' },
    { name: 'KPI Tracker', icon: 'FiBarChart2', type: 'Dashboard', desc: 'Automated KPI tracking for teams and projects' },
    { name: 'SEO Rank Tracker', icon: 'FiSearch', type: 'SEO Tool', desc: 'Monitor search rankings for target keywords' },
  ],
  research: [
    { name: 'AI Research Digest', icon: 'FiSearch', type: 'AI Tool', desc: 'Summarise latest AI research papers automatically' },
    { name: 'Web Research Hub', icon: 'FiGlobe', type: 'Research', desc: 'Aggregate and organise web research on any topic' },
    { name: 'Literature Review', icon: 'FiBookOpen', type: 'Academic', desc: 'Generate comprehensive literature reviews' },
    { name: 'Field Mapping Tool', icon: 'FiGrid', type: 'Visualisation', desc: 'Map key players and ideas in any research field' },
    { name: 'Dataset Finder', icon: 'FiBarChart2', type: 'Data Tool', desc: 'Discover and compare datasets for research' },
    { name: 'Fact Checker', icon: 'FiCheckCircle', type: 'AI Tool', desc: 'Verify claims and statistics with source checking' },
    { name: 'Market Research', icon: 'FiTrendingUp', type: 'Business', desc: 'Research market trends and competitive landscape' },
    { name: 'Research Report', icon: 'FiFileText', type: 'AI Tool', desc: 'Generate structured research reports from data' },
    { name: 'Paper Explainer', icon: 'FiAward', type: 'AI Tool', desc: 'Explain technical papers in plain English' },
    { name: 'Research Gap Finder', icon: 'FiMessageCircle', type: 'Academic', desc: 'Identify unexplored areas in your research field' },
  ],
  create: [
    { name: 'Blog Post Writer', icon: 'FiEdit3', type: 'Content', desc: 'Generate SEO-optimised blog posts for your brand' },
    { name: 'Social Calendar', icon: 'FiSmartphone', type: 'Marketing', desc: 'Plan and generate social media content calendar' },
    { name: 'Video Script Writer', icon: 'FiVideo', type: 'Content', desc: 'Create compelling video scripts for YouTube' },
    { name: 'Ad Copy Generator', icon: 'FiImage', type: 'Marketing', desc: 'Generate ad copy and visual concepts for campaigns' },
    { name: 'Email Sequence', icon: 'FiMail', type: 'Marketing', desc: 'High-converting email marketing sequences' },
    { name: 'Podcast Script', icon: 'FiMic', type: 'Content', desc: 'Write engaging podcast episodes on any topic' },
    { name: 'Brand Copywriter', icon: 'FiMessageCircle', type: 'AI Tool', desc: 'Expert brand voice copywriting assistant' },
    { name: 'Proposal Writer', icon: 'FiEdit2', type: 'Business', desc: 'Professional business proposals in minutes'     },
    { name: 'Landing Page Copy', icon: 'FiTarget', type: 'Marketing', desc: 'High-converting landing page copy generator' },
    { name: 'Brand Story Builder', icon: 'FiStar', type: 'Brand', desc: 'Craft compelling brand stories and mission statements' },
  ],
  analyze: [
    { name: 'Data Insights', icon: 'FiBarChart2', type: 'Analytics', desc: 'Analyse spreadsheet data and generate actionable insights' },
    { name: 'Trend Visualiser', icon: 'FiTrendingDown', type: 'Data Visualisation', desc: 'Identify and visualise trends in your data' },
    { name: 'Statistical Analysis', icon: 'FiHash', type: 'Analytics', desc: 'Run statistical tests and generate summaries' },
    { name: 'Document Parser', icon: 'FiEye', type: 'AI Tool', desc: 'Extract key data from uploaded documents' },
    { name: 'Sentiment Analysis', icon: 'FiHeart', type: 'AI Tool', desc: 'Analyse sentiment from reviews and social posts' },
    { name: 'Pattern Finder', icon: 'FiGitMerge', type: 'Analytics', desc: 'Discover hidden patterns and correlations' },
    { name: 'Analytical Report', icon: 'FiFileText', type: 'AI Tool', desc: 'Generate structured analytical reports from data' },
    { name: 'Business Insights', icon: 'FiZap', type: 'AI Tool', desc: 'AI-powered business insights and recommendations' },
    { name: 'KPI Dashboard', icon: 'FiTrendingUp', type: 'Dashboard', desc: 'Track and visualise key performance metrics' },
    { name: 'Competitor Dashboard', icon: 'FiSearch', type: 'Analytics', desc: 'Competitive analysis with data visualisation' },
  ],
};
