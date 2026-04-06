'use client';

import type { ComponentType, SVGProps } from 'react';
import * as Fi from 'react-icons/fi';

type SvgIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: string | number; strokeWidth?: string | number }>;

/** Maps `icon` strings from `GET /catalog/hero-onboarding` to react-icons/fi components. */
export const HERO_ONBOARD_ICONS: Record<string, SvgIcon> = {
  FiEdit3: Fi.FiEdit3,
  FiImage: Fi.FiImage,
  FiCode: Fi.FiCode,
  FiBarChart2: Fi.FiBarChart2,
  FiZap: Fi.FiZap,
  FiMessageCircle: Fi.FiMessageCircle,
  FiBookOpen: Fi.FiBookOpen,
  FiBriefcase: Fi.FiBriefcase,
  FiPenTool: Fi.FiPenTool,
  FiShoppingBag: Fi.FiShoppingBag,
  FiCpu: Fi.FiCpu,
  FiHome: Fi.FiHome,
  FiSmartphone: Fi.FiSmartphone,
  FiShoppingCart: Fi.FiShoppingCart,
  FiCompass: Fi.FiCompass,
  FiHeart: Fi.FiHeart,
  FiShield: Fi.FiShield,
  FiTrendingUp: Fi.FiTrendingUp,
  FiFileText: Fi.FiFileText,
  FiList: Fi.FiList,
  FiLayers: Fi.FiLayers,
  FiMic: Fi.FiMic,
  FiUser: Fi.FiUser,
  FiUsers: Fi.FiUsers,
  FiUserPlus: Fi.FiUserPlus,
  FiGlobe: Fi.FiGlobe,
  FiAlignJustify: Fi.FiAlignJustify,
  FiTarget: Fi.FiTarget,
  FiGrid: Fi.FiGrid,
  FiSmile: Fi.FiSmile,
  FiCoffee: Fi.FiCoffee,
  FiTool: Fi.FiTool,
  FiLock: Fi.FiLock,
  FiNavigation: Fi.FiNavigation,
  FiCheck: Fi.FiCheck,
};

export function HeroOnboardIcon({
  name,
  className,
  size = 16,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  const Icon = HERO_ONBOARD_ICONS[name];
  if (!Icon) {
    return <span className={`inline-block w-4 h-4 rounded bg-text3/20 ${className ?? ''}`} title={name} />;
  }
  return <Icon className={`flex-shrink-0 text-accent ${className ?? ''}`} size={size} strokeWidth={2} aria-hidden />;
}
