'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { SectionWrapper } from '@/components/layout/SectionWrapper';

// "The AISCA Story" video feature on the homepage.
// Shows a lightweight thumbnail first and only loads the YouTube player
// when someone presses play, so the homepage stays fast.
const VIDEO_ID = 'NGWvLWlS1CY';
const WATCH_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const ease = [0.22, 1, 0.36, 1] as const;

export default function StorySection() {
  const [playing, setPlaying] = useState(false);
  const [thumb, setThumb] = useState(`https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`);

  return (
    <SectionWrapper id="our-story" spacing="compact" background="primary">
      <Container>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="section-eyebrow">Our Story</span>
          <h2 className="section-title">The AISCA Story</h2>
          <p className="section-subtitle">
            How one idea to stop commerce students working in isolation grew into an island wide movement. Hear it in our own words, in conversation with Business Advisor.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, ease }}
          className="story-frame"
        >
          <div className="story-video">
            {playing ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title="The AISCA Story"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="story-iframe"
              />
            ) : (
              <button type="button" className="story-poster" onClick={() => setPlaying(true)} aria-label="Play the AISCA story video">
                <img
                  src={thumb}
                  alt="The AISCA story video"
                  className="story-thumb"
                  loading="lazy"
                  onError={() => setThumb(`https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`)}
                />
                <span className="story-shade" aria-hidden />
                <span className="story-play" aria-hidden>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.29-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" /></svg>
                </span>
                <span className="story-caption">
                  <span className="story-caption-kicker">Watch</span>
                  <span className="story-caption-title">The AISCA Story</span>
                </span>
              </button>
            )}
          </div>
        </motion.div>

        <div style={{ textAlign: 'center', marginTop: '22px' }}>
          <a href={WATCH_URL} target="_blank" rel="noopener noreferrer" className="story-link">
            Watch on YouTube
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
          </a>
        </div>
      </Container>

      <style>{`
        .story-frame { max-width: 980px; margin: 0 auto; padding: 8px; border-radius: 26px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); box-shadow: 0 40px 90px -40px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.06); }
        .story-video { position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 19px; overflow: hidden; background: #0b0b0b; }
        .story-iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
        .story-poster { position: absolute; inset: 0; width: 100%; height: 100%; padding: 0; margin: 0; border: 0; cursor: pointer; background: #0b0b0b; display: block; }
        .story-thumb { position: absolute; inset: 0; width: 100% !important; height: 100% !important; max-width: none !important; object-fit: cover; transform: scale(1.01); transition: transform .8s cubic-bezier(.22,1,.36,1), filter .5s ease; filter: saturate(0.95) brightness(0.85); }
        .story-poster:hover .story-thumb { transform: scale(1.045); filter: saturate(1.05) brightness(0.9); }
        .story-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.75) 100%); }
        .story-play { position: absolute; left: 50%; top: 50%; width: 84px; height: 84px; margin: -42px 0 0 -42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; padding-left: 5px;
          background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.35); -webkit-backdrop-filter: blur(14px) saturate(160%); backdrop-filter: blur(14px) saturate(160%); box-shadow: 0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.4); transition: transform .3s ease, background .3s ease; }
        .story-poster:hover .story-play { transform: scale(1.08); background: rgba(255,255,255,0.24); }
        .story-caption { position: absolute; left: 24px; bottom: 20px; display: flex; flex-direction: column; align-items: flex-start; text-align: left; }
        .story-caption-kicker { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.65); font-weight: 600; }
        .story-caption-title { font-size: 20px; font-weight: 700; color: #fff; margin-top: 2px; }
        .story-link { display: inline-flex; align-items: center; gap: 7px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; font-weight: 600; color: rgba(255,255,255,0.75); text-decoration: none; padding: 10px 18px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.12); transition: color .2s, border-color .2s; }
        .story-link:hover { color: #fff; border-color: rgba(255,255,255,0.3); }
        @media (max-width: 640px) {
          .story-frame { padding: 5px; border-radius: 20px; }
          .story-video { border-radius: 15px; }
          .story-play { width: 64px; height: 64px; margin: -32px 0 0 -32px; }
          .story-caption { left: 16px; bottom: 14px; }
          .story-caption-title { font-size: 16px; }
        }
      `}</style>
    </SectionWrapper>
  );
}
