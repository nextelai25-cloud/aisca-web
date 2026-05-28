'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_LINKS } from '@/lib/constants';
import { Container } from '@/components/layout/Container';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nav = (href: string) => { 
    setOpen(false); 
    if (href.startsWith('/')) {
      window.location.href = href;
    } else if (window.location.pathname === '/') {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }); 
    } else {
      window.location.href = '/' + href;
    }
  };
  
  return (
    <>
      <nav 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled ? 'bg-[#050505]/85 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.5)] py-1' : 'bg-transparent py-3'
        }`}
      >
        <Container>
          <div className="flex items-center justify-between h-16 md:h-20">
             {/* Logo */}
            <a href="/" style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none'
            }}>
              <img
                src="/aisca-original.png"
                alt="AISCA Logo"
                className="header-logo"
                style={{
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </a>

            {/* Desktop Navigation Links */}
            <div className="desktop-nav hidden lg:flex items-center gap-2">
              {NAV_LINKS.map(l => (
                <button 
                  key={l.href} 
                  onClick={() => nav(l.href)}
                  className="nav-link"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                    letterSpacing: '0.04em',
                    color: 'rgba(255,255,255,0.75)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease'
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* CTA & Mobile Menu Toggle */}
            <div className="flex items-center gap-5">
              <div className="hidden lg:block">
                <a 
                  href="/register/associate"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  Join AISCA
                </a>
              </div>
              
              <button 
                onClick={() => setOpen(!open)} 
                className="mobile-menu-btn lg:hidden w-12 h-12 flex items-center justify-center outline-none cursor-pointer rounded-xl bg-white/[0.05] border border-white/[0.08]" 
                aria-label="Toggle Menu"
              >
                <div className="w-5 flex flex-col gap-[5px]">
                  <span className={`h-[1.5px] bg-white rounded transition-all duration-300 ${open ? 'rotate-45 translate-y-[6.5px]' : ''} w-full`} />
                  <span className={`h-[1.5px] bg-white rounded transition-all duration-300 ${open ? 'opacity-0' : ''} w-3/4`} />
                  <span className={`h-[1.5px] bg-white rounded transition-all duration-300 ${open ? '-rotate-45 -translate-y-[6.5px]' : ''} w-full`} />
                </div>
              </button>
            </div>
          </div>
        </Container>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div 
            className="fixed inset-0 z-40 bg-[#050505]/98 backdrop-blur-3xl lg:hidden flex flex-col"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col items-center justify-center flex-1 gap-8 px-8">
              {NAV_LINKS.map((l, i) => (
                <motion.button 
                  key={l.href} 
                  onClick={() => nav(l.href)}
                  className="text-3xl text-zinc-400 hover:text-white transition-colors font-display font-bold tracking-tight cursor-pointer"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {l.label}
                </motion.button>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.06 + 0.1, duration: 0.4 }}
                className="mt-10 w-full max-w-[240px]"
              >
                <a 
                  href="/register/associate"
                  className="w-full min-h-[52px] rounded-2xl bg-white text-black text-base font-bold shadow-[0_0_40px_rgba(255,255,255,0.25)] cursor-pointer" 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                >
                  Join AISCA
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
