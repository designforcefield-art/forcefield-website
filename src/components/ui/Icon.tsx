import {
  Briefcase, Building2, CalendarCheck, ChartNoAxesColumn, Compass, Flower2, GitBranch, Globe, GraduationCap,
  LayoutTemplate, Magnet, Plug, Route, ShieldCheck, ShoppingBag, ShoppingCart, Sofa, Sparkles, TrendingUp,
  Users, UtensilsCrossed, Workflow, type LucideIcon, type LucideProps,
} from 'lucide-react'

/**
 * Catalogue records store icon NAMES (strings) so they stay CMS-friendly.
 * Register any new icon here once.
 */
const REGISTRY: Record<string, LucideIcon> = {
  Briefcase, Building2, CalendarCheck, ChartNoAxesColumn, Compass, Flower2, GitBranch, Globe, GraduationCap,
  LayoutTemplate, Magnet, Plug, Route, ShieldCheck, ShoppingBag, ShoppingCart, Sofa, Sparkles, TrendingUp,
  Users, UtensilsCrossed, Workflow,
}

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = REGISTRY[name] ?? Sparkles
  return <C aria-hidden="true" {...props} />
}
