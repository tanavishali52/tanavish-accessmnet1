/**
 * Guided hero onboarding — served by `GET /api/catalog/hero-onboarding`.
 * Each `icon` is a react-icons export name (Feather `Fi*`) resolved on the Next.js app.
 */

export interface HeroOnboardStepRecord {
  k: string;
  q: string;
  hint: string;
  opts: { icon: string; l: string; sub: string }[];
}

export const HERO_ONBOARD_STEPS: HeroOnboardStepRecord[] = [
  {
    k: 'task',
    q: 'What do you want to do?',
    hint: "Pick whichever feels closest — there's no wrong answer.",
    opts: [
      {
        icon: 'FiEdit3',
        l: 'Write something',
        sub: 'Emails, posts, stories, reports',
      },
      {
        icon: 'FiImage',
        l: 'Make pictures or art',
        sub: 'Images, logos, designs, photos',
      },
      {
        icon: 'FiCode',
        l: 'Build something',
        sub: 'Websites, apps, tools, scripts',
      },
      {
        icon: 'FiBarChart2',
        l: 'Make sense of info',
        sub: 'Files, numbers, documents, data',
      },
      {
        icon: 'FiZap',
        l: 'Save time on boring tasks',
        sub: 'Things that repeat every day',
      },
      {
        icon: 'FiMessageCircle',
        l: 'Get help or answers',
        sub: 'Questions, ideas, brainstorming',
      },
    ],
  },
  {
    k: 'role',
    q: 'What best describes you?',
    hint: 'Just pick the one that feels most like you',
    opts: [
      {
        icon: 'FiBookOpen',
        l: 'Still learning',
        sub: 'Student or new to this field',
      },
      {
        icon: 'FiBriefcase',
        l: 'I work in an office',
        sub: 'Business, meetings, spreadsheets',
      },
      {
        icon: 'FiPenTool',
        l: 'I make things',
        sub: 'Art, design, writing, content',
      },
      {
        icon: 'FiShoppingBag',
        l: 'I run or sell things',
        sub: 'Shop, brand, marketing, clients',
      },
      {
        icon: 'FiCpu',
        l: 'I build with computers',
        sub: 'Code, websites, tech stuff',
      },
      {
        icon: 'FiHome',
        l: 'Just for myself',
        sub: 'Personal projects and hobbies',
      },
    ],
  },
  {
    k: 'context',
    q: 'Where will you use this?',
    hint: 'This helps me recommend the right thing',
    opts: [
      { icon: 'FiBriefcase', l: 'At work', sub: 'My job or business' },
      {
        icon: 'FiBookOpen',
        l: 'For school or study',
        sub: 'Learning, homework, research',
      },
      {
        icon: 'FiSmartphone',
        l: 'Online or social media',
        sub: 'Posts, videos, followers',
      },
      {
        icon: 'FiShoppingCart',
        l: 'For a product or shop',
        sub: 'Something to sell or describe',
      },
      {
        icon: 'FiCompass',
        l: 'Just exploring',
        sub: "Seeing what's out there",
      },
    ],
  },
  {
    k: 'tone',
    q: 'How should it sound when it talks to you?',
    hint: "Think of the vibe you'd want from a helper",
    opts: [
      {
        icon: 'FiHeart',
        l: 'Warm and friendly',
        sub: 'Like chatting with a mate',
      },
      {
        icon: 'FiShield',
        l: 'Clean and proper',
        sub: 'Like a polished business email',
      },
      {
        icon: 'FiBookOpen',
        l: 'Clear and easy',
        sub: 'Simple words, step-by-step',
      },
      {
        icon: 'FiTrendingUp',
        l: 'Bold and exciting',
        sub: 'Energetic, confident, punchy',
      },
    ],
  },
  {
    k: 'format',
    q: 'What should the answer look like?',
    hint: 'How do you want to receive the result?',
    opts: [
      {
        icon: 'FiFileText',
        l: 'A full piece of writing',
        sub: 'Ready to copy and use',
      },
      {
        icon: 'FiList',
        l: 'A simple list',
        sub: 'Clear bullet points or steps',
      },
      { icon: 'FiBarChart2', l: 'A short summary', sub: 'Just the key points' },
      {
        icon: 'FiLayers',
        l: 'A few different ideas',
        sub: 'Options to pick from',
      },
      {
        icon: 'FiMic',
        l: 'Explained in plain words',
        sub: 'Like a friend explaining it',
      },
    ],
  },
  {
    k: 'audience',
    q: 'Who will see or use this?',
    hint: "Who's it for?",
    opts: [
      { icon: 'FiUser', l: 'Just me', sub: 'My personal notes or use' },
      { icon: 'FiUsers', l: 'My team or coworkers', sub: 'People I work with' },
      {
        icon: 'FiUserPlus',
        l: 'Customers or clients',
        sub: 'People who buy from me',
      },
      { icon: 'FiGlobe', l: 'Anyone and everyone', sub: 'The general public' },
    ],
  },
  {
    k: 'depth',
    q: 'How much detail do you want?',
    hint: 'This shapes how thorough the answer is',
    opts: [
      { icon: 'FiZap', l: 'Short and sweet', sub: 'Quick, no extra info' },
      {
        icon: 'FiAlignJustify',
        l: 'Full and detailed',
        sub: 'Cover everything properly',
      },
      {
        icon: 'FiTarget',
        l: 'One clear answer',
        sub: 'Just tell me the best option',
      },
      {
        icon: 'FiGrid',
        l: 'Bite-sized pieces',
        sub: 'Break it into small chunks',
      },
    ],
  },
  {
    k: 'experience',
    q: 'Have you used AI tools before?',
    hint: "Totally fine if you haven't — that's what I'm here for!",
    opts: [
      { icon: 'FiSmile', l: 'Never tried it', sub: 'Complete beginner' },
      {
        icon: 'FiCoffee',
        l: 'A little bit',
        sub: 'Played around with ChatGPT etc.',
      },
      {
        icon: 'FiCpu',
        l: 'I use it regularly',
        sub: 'Comfortable with AI already',
      },
      {
        icon: 'FiTool',
        l: 'I build things with it',
        sub: 'Connecting it to apps and code',
      },
    ],
  },
  {
    k: 'constraint',
    q: 'Anything you want to avoid?',
    hint: "Totally optional — skip if you're not sure",
    opts: [
      {
        icon: 'FiLock',
        l: 'Keep it simple',
        sub: 'No big words or confusing terms',
      },
      { icon: 'FiGlobe', l: 'Stay neutral', sub: 'No strong opinions or bias' },
      {
        icon: 'FiNavigation',
        l: 'Be direct',
        sub: 'No fluff, straight to the point',
      },
      {
        icon: 'FiCheck',
        l: 'No preference',
        sub: 'Whatever works best is fine',
      },
    ],
  },
];
