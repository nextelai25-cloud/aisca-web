'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { boardTeams } from '@/lib/constants';
import { Container } from '@/components/layout/Container';
import { SectionWrapper } from '@/components/layout/SectionWrapper';

const ease = [0.22, 1, 0.36, 1] as const;

function InitialAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('');
  const sizes = { sm: 'w-10 h-10 text-sm', md: 'w-16 h-16 text-base', lg: 'w-[72px] h-[72px] text-[1.4rem]' };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center shrink-0 font-medium text-white/60`}
      style={{ 
        border: '1px solid rgba(255,255,255,0.10)',
        background: 'rgba(255,255,255,0.06)'
      }}
    >
      {initials}
    </div>
  );
}

export default function BoardSection() {
  const [activeTab, setActiveTab] = useState('core');

  const currentTeam = boardTeams.find(t => t.id === activeTab) || boardTeams[0];

  return (
    <SectionWrapper id="board" spacing="none" background="secondary" className="py-32 lg:py-40 border-t border-white/[0.04]" style={{ paddingBottom: '32px' }}>
      <Container>
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '48px', width: '100%', overflow: 'visible', padding: '0 24px' }}>
          <span className="section-eyebrow">National Leadership</span>
          <h2 className="section-title">Executive Board</h2>
          <p className="section-subtitle" style={{ textAlign: 'center', width: '100%', overflow: 'visible', padding: '0 24px' }}>
            The administrative directors and student leaders steering the future of commerce education across all provinces.
          </p>
        </div>

        {/* Team Tab Controls — centered, wrapping */}
        <div className="board-tabs hide-scrollbar" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center',
          marginBottom: '40px'
        }}>
          {boardTeams.map((team) => (
            <button
              key={team.id}
              onClick={() => setActiveTab(team.id)}
              style={activeTab === team.id ? {
                padding: '8px 16px',
                borderRadius: '999px',
                background: '#ffffff',
                color: '#000000',
                border: 'none',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              } : {
                padding: '8px 16px',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.45)',
                fontSize: '12px',
                fontWeight: '400',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {team.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease }}
          >
            {activeTab === 'core' ? (
              <div className="flex flex-col gap-6 max-w-[900px] mx-auto w-full px-4 md:px-0">
                {/* Deputy Chairpersons Grid Container */}
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  marginBottom: '24px'
                }}>
                  {currentTeam.members.slice(0, 2).map((member: any) => (
                    <div
                      key={member.name}
                      style={{
                        width: '240px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}
                    >
                      {/* Photo area */}
                      <div style={{
                        width: '100%',
                        aspectRatio: '1/1',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        {member.photo ? (
                          <img
                            src={member.photo}
                            alt={member.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                          />
                        ) : (
                          <div style={{
                            width: '100%', height: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', fontWeight: '300', color: 'rgba(255,255,255,0.18)'
                          }}>{member.initials}</div>
                        )}
                      </div>
                      {/* Info — name and role ONLY, NO quote */}
                      <div style={{
                        padding: '16px',
                        borderTop: '1px solid rgba(255,255,255,0.06)'
                      }}>
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                          {member.name}
                        </p>
                        <p style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Co-Secretaries Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {currentTeam.members.slice(2, 4).map((m: any) => (
                    <div
                      key={m.name}
                      className="board-card flex flex-row rounded-2xl overflow-hidden text-left h-auto md:h-[160px]"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        width: '100%'
                      }}
                    >
                      {/* Image Left */}
                      <div 
                        className="relative w-[110px] md:w-[150px] shrink-0 bg-gradient-to-br from-[#151515] to-[#0a0a0a] flex items-center justify-center text-2xl text-white/10 overflow-hidden"
                        style={{ minHeight: '140px' }}
                      >
                        {m.photo ? (
                          <img
                            src={m.photo}
                            alt={m.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ objectPosition: 'center top' }}
                          />
                        ) : (
                          <span className="relative z-10 font-light">{m.initials}</span>
                        )}
                      </div>

                      {/* Text Details Right */}
                      <div className="flex flex-col justify-center flex-grow secretary-card-text">
                        <h4 className="text-base md:text-lg font-semibold text-white mb-1.5 font-sans" style={{ lineHeight: '1.2' }}>
                          {m.name}
                        </h4>
                        <span className="text-[11px] tracking-[0.2em] uppercase text-white/40 font-normal font-sans">
                          {m.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className="board-grid"
                style={currentTeam.members.length <= 3 ? {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: '16px',
                  justifyItems: 'center',
                  justifyContent: 'center',
                  maxWidth: '900px',
                  margin: '0 auto'
                } : {
                  maxWidth: '900px',
                  margin: '0 auto'
                }}
              >
                {currentTeam.members.map((m) => (
                  <div
                    key={m.name}
                    className="board-card member-card"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Photo area */}
                    <div style={{
                      width: '100%',
                      aspectRatio: '3/4',
                      background: 'linear-gradient(160deg, #1c1c1c 0%, #0f0f0f 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: '300',
                      color: 'rgba(255,255,255,0.18)',
                      letterSpacing: '0.05em',
                      position: 'relative'
                    }}>
                      {m.photo ? (
                        <img 
                          src={m.photo} 
                          alt={m.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} 
                        />
                      ) : m.initials}
                    </div>
                    {/* Info area */}
                    <div className="card-info" style={{
                      padding: '16px',
                      borderTop: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '4px'
                      }}>{m.name}</p>
                      <p style={{
                        fontSize: '11px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.35)',
                        fontWeight: '400'
                      }}>{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Container>
    </SectionWrapper>
  );
}
