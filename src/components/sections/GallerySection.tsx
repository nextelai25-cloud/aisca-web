'use client'
import { useState } from 'react'
import { events } from '@/data/events'

export default function GallerySection() {
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null)
  const [activePhoto, setActivePhoto] = useState(0)

  return (
    <section id="gallery" style={{ padding: '120px 40px', background: '#080808' }}>
      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <p style={{
          fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)', marginBottom: '16px'
        }}>OUR IMPACT</p>
        <h2 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800',
          color: '#ffffff', marginBottom: '16px', letterSpacing: '-0.02em', lineHeight: '1.0'
        }}>Events & Initiatives</h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)' }}>
          Moments that define the islandwide commerce movement
        </p>
      </div>

      {/* Events grid */}
      <div 
        className="events-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => { setSelectedEvent(event); setActivePhoto(0) }}
            style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              aspectRatio: '4/3',
              background: '#111',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              transition: 'transform 0.3s ease, border-color 0.3s ease'
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'
            }}
          >
            {/* Cover photo */}
            {event.coverPhoto ? (
              <img
                src={event.coverPhoto}
                alt={event.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '4rem', fontWeight: '800',
                color: 'rgba(255,255,255,0.06)', letterSpacing: '-0.05em'
              }}>AISCA</div>
            )}

            {/* Dark overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)'
            }} />

            {/* Photo count badge */}
            {event.photos.length > 1 && (
              <div style={{
                position: 'absolute', top: '12px', right: '12px',
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px', padding: '4px 8px',
                fontSize: '11px', color: 'rgba(255,255,255,0.7)'
              }}>
                {event.photos.length} photos
              </div>
            )}

            {/* Bottom info */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '24px 20px 20px'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '3px 8px', borderRadius: '4px'
                }}>{event.tag}</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{event.year}</span>
              </div>
              <p style={{
                fontSize: '16px', fontWeight: '700', color: '#ffffff',
                margin: 0, lineHeight: '1.3'
              }}>{event.name}</p>
              <p style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.3)',
                marginTop: '4px'
              }}>{event.date}</p>
              {event.note && (
                <p style={{
                  fontSize: '10px', color: 'rgba(255,255,255,0.35)',
                  marginTop: '4px', letterSpacing: '0.05em'
                }}>{event.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Event Modal/Lightbox */}
      {selectedEvent && (
        <div
          onClick={() => setSelectedEvent(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.96)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '20px 16px',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div
            className="gallery-modal-inner"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '900px',
              background: '#0d0d0d',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              overflow: 'hidden',
              margin: 'auto',
              marginTop: '0'
            }}
          >
            {/* Close button */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div>
                <span style={{
                  fontSize: '9px', letterSpacing: '0.15em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '3px 8px', borderRadius: '4px', marginRight: '12px'
                }}>{selectedEvent.tag}</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                  {selectedEvent.date}
                </span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: '#fff',
                  width: '36px', height: '36px',
                  cursor: 'pointer', fontSize: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >×</button>
            </div>

            {/* Main photo container */}
            <div
              className="gallery-modal-photo"
              style={{
                width: '100%',
                height: '500px',
                background: '#000000',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {selectedEvent.photos.length > 0 ? (
                <img
                  src={selectedEvent.photos[activePhoto]}
                  alt={selectedEvent.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              ) : (
                <div style={{
                  color: 'rgba(255,255,255,0.1)',
                  fontSize: '5rem',
                  fontWeight: '800'
                }}>AISCA</div>
              )}

              {/* Navigation arrows - only show if multiple photos */}
              {selectedEvent.photos.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActivePhoto(p => p > 0 ? p - 1 : selectedEvent.photos.length - 1) }}
                    style={{
                      position: 'absolute', left: '16px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '50%', width: '48px', height: '48px',
                      color: '#fff', cursor: 'pointer', fontSize: '22px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 10
                    }}
                  >‹</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActivePhoto(p => p < selectedEvent.photos.length - 1 ? p + 1 : 0) }}
                    style={{
                      position: 'absolute', right: '16px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '50%', width: '48px', height: '48px',
                      color: '#fff', cursor: 'pointer', fontSize: '22px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 10
                    }}
                  >›</button>

                  <div style={{
                    position: 'absolute', bottom: '12px', right: '16px',
                    background: 'rgba(0,0,0,0.7)', borderRadius: '6px',
                    padding: '4px 10px', fontSize: '12px',
                    color: 'rgba(255,255,255,0.6)'
                  }}>
                    {activePhoto + 1} / {selectedEvent.photos.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {selectedEvent.photos.length > 1 && (
              <div style={{
                display: 'flex', gap: '8px', padding: '12px 24px',
                overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.06)'
              }}>
                {selectedEvent.photos.map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActivePhoto(idx)}
                    style={{
                      width: '64px', height: '64px', flexShrink: 0,
                      borderRadius: '8px', overflow: 'hidden',
                      border: activePhoto === idx
                        ? '2px solid #ffffff'
                        : '2px solid transparent',
                      cursor: 'pointer', transition: 'border-color 0.2s ease'
                    }}
                  >
                    <img
                      src={photo}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Event details */}
            <div style={{ padding: '28px 24px' }}>
              <h3 className="gallery-modal-title" style={{
                fontSize: '24px', fontWeight: '700', color: '#ffffff',
                marginBottom: '16px', lineHeight: '1.2'
              }}>{selectedEvent.name}</h3>

              {selectedEvent.note && (
                <div style={{
                  display: 'inline-block',
                  padding: '4px 12px', marginBottom: '16px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px', fontSize: '11px',
                  color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em'
                }}>
                  {selectedEvent.note}
                </div>
              )}

              {selectedEvent.description.split('\n\n').map((para, i) => (
                <p key={i} className="gallery-modal-desc" style={{
                  fontSize: '14px', color: 'rgba(255,255,255,0.55)',
                  lineHeight: '1.8', marginBottom: '16px'
                }}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
