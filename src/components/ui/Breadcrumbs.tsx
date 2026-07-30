import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center gap-2 text-[10px] md:text-xs tracking-widest uppercase font-semibold text-white/40 ${className}`}
    >
      <a 
        href="/" 
        className="hover:text-white transition-colors flex items-center gap-1 text-white/30"
        style={{ textDecoration: 'none' }}
      >
        <Home size={12} />
        <span>Home</span>
      </a>
      
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={idx} className="flex items-center gap-2">
            <ChevronRight size={10} className="text-white/10" />
            {isLast || !item.href ? (
              <span className="text-[#d4af37] font-bold">{item.label}</span>
            ) : (
              <a 
                href={item.href} 
                className="hover:text-white transition-colors"
                style={{ textDecoration: 'none' }}
              >
                {item.label}
              </a>
            )}
          </div>
        );
      })}
    </nav>
  );
}
