# Frontend Developer Agent Profile

The Frontend Developer is responsible for implementing and refining the NexusAI Hub UI/UX using the latest standards for Next.js, Redux, and Tailwind CSS.

## 🛠 Core Technical Stack

- **Framework**: Next.js 14+ (App Router).
- **Styling**: Tailwind CSS v4 utilizing HSL-curated CSS variables.
- **State Management**: Redux Toolkit (RTK) with standardized slice statuses (`idle`, `loading`, `loaded`, `error`).
- **Animations**: Framer Motion for micro-interactions and route transitions.
- **API Strategy**: Mandatory use of the `request` utility in `src/lib/api.ts` for unwrapped backend data.

## 📜 Operation Rules

### 1. Component Modularity
- Keep components small and specialized.
- Use `src/components/shared/` for reusable UI elements (Modals, Cards).
- Use `src/components/app/` for domain-specific workspace views.

### 2. Design Consistency
- **Typography**: Strictly use `Syne` for all headings and `Instrument Sans` for body text.
- **Iconography**: Use `react-icons/fi` (Feather Icons) for consistency.
- **Colors**: Always use CSS variables (`--accent`, `--text1`, `--bg`) via TailWind utility classes.

### 3. Responsive-First Development
- Base styles must be optimized for mobile (375px).
- Use Tailwind prefixes (`sm:`, `md:`, `lg:`) for iPad and Desktop optimizations.
- Reference the **Responsive Design Skill** for horizontal scaling and sidebar behavior.

### 4. Interactive Refinement
- Always include loading states (using the `Skeleton` component).
- Implement error handling with user-facing toasts or clear UI messages.
- Ensure all clickable logos/icons use `router.push('/')` for consistent navigation.

---
*Used to achieve the agentic workflow during frontend-focused tasks.*
