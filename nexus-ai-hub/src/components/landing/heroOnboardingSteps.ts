/** Prompt builder for the landing hero guided flow (steps come from `GET /catalog/hero-onboarding`). */

export function buildHeroOnboardingPrompt(
  answers: Partial<Record<string, string>>,
  userTyped: string,
): string {
  const parts = [
    answers.task && `I want to: ${answers.task.toLowerCase()}.`,
    answers.role && `I describe myself as: ${answers.role.toLowerCase()}.`,
    answers.context && `I'll use this: ${answers.context.toLowerCase()}.`,
    answers.tone && `Please use this tone: ${answers.tone.toLowerCase()}.`,
    answers.format && `Format: ${answers.format.toLowerCase()}.`,
    answers.audience && `The output is for: ${answers.audience.toLowerCase()}.`,
    answers.depth && `Detail preference: ${answers.depth.toLowerCase()}.`,
    answers.experience && `My experience with AI: ${answers.experience.toLowerCase()}.`,
    answers.constraint && `Preferences: ${answers.constraint.toLowerCase()}.`,
    userTyped.trim() && `My specific need: "${userTyped.trim()}".`,
  ].filter(Boolean);
  return `[Guided setup] ${parts.join(' ')} Please help me with clear next steps and, where useful, suggest models or tools that fit.`;
}
