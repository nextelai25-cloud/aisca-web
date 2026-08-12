export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

// Breadcrumbs are intentionally hidden across the whole site. Kept as a no-op
// component so all existing imports and usages still compile without changes.
export function Breadcrumbs(_props: BreadcrumbsProps) {
  return null;
}
