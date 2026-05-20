'use client';

import { Container } from '@/components/layout/Container';
import { SectionWrapper } from '@/components/layout/SectionWrapper';
import { SectionHeading } from '@/components/layout/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { GlowCard } from '@/components/ui/GlowCard';

export default function DesignSystemPreview() {
  return (
    <main className="min-h-screen bg-[#050505]">
      
      <SectionWrapper background="subtle-glow">
        <Container>
          <SectionHeading 
            badge="Phase 1 Approved"
            title="Design System & Architecture" 
            description="A rigorous, scalable token system with Apple/Linear-tier primitives. No hardcoded pixels. Strict 12/6/1 responsive grid logic."
          />
        </Container>
      </SectionWrapper>

      {/* Typography Preview */}
      <SectionWrapper spacing="compact" className="border-t border-white/[0.04]">
        <Container>
          <h3 className="type-overline mb-8 text-white/50">1. Typography Tokens</h3>
          <div className="flex flex-col gap-6">
            <div>
              <span className="type-caption text-white/30 block mb-1">.type-display-xl</span>
              <h1 className="type-display-xl">Cinematic Scale</h1>
            </div>
            <div>
              <span className="type-caption text-white/30 block mb-1">.type-heading-xl</span>
              <h2 className="type-heading-xl">Premium Infrastructure</h2>
            </div>
            <div>
              <span className="type-caption text-white/30 block mb-1">.type-body-lg</span>
              <p className="type-body-lg max-w-[65ch]">The motion system communicates confidence, elegance, and precision. Everything feels minimal, controlled, and intentional. No over-animation.</p>
            </div>
          </div>
        </Container>
      </SectionWrapper>

      {/* Components Preview */}
      <SectionWrapper spacing="compact" className="border-t border-white/[0.04]">
        <Container>
          <h3 className="type-overline mb-8 text-white/50">2. Component Primitives</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Buttons & Badges */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <Button variant="primary">Primary Action</Button>
                <Button variant="ghost">Ghost State</Button>
                <Button variant="outline">Outline State</Button>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="default">Default</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center gap-4">
                <Avatar initials="A" size="sm" />
                <Avatar initials="IS" size="md" />
                <Avatar initials="CA" size="lg" />
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <Input label="Email Address" placeholder="Enter your email" required />
              <Input label="Password" type="password" placeholder="••••••••" error="Password must contain at least one symbol" />
            </div>

          </div>
        </Container>
      </SectionWrapper>

      {/* Layout & Cards Preview */}
      <SectionWrapper spacing="default" className="border-t border-white/[0.04]">
        <Container>
          <h3 className="type-overline mb-8 text-white/50">3. Card & Layout Grids (max 3 cards per row rule)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card hoverable>
              <Badge variant="outline" className="mb-4">Standard Card</Badge>
              <h4 className="type-heading-lg mb-2">Clean Surface</h4>
              <p className="type-body-md text-white/60 mb-6">Standard translucent card with subtle border radius and padding scales.</p>
              <Button variant="ghost" size="sm" className="w-full">View Details</Button>
            </Card>

            <GlowCard>
              <Badge variant="success" className="mb-4">Glow Card</Badge>
              <h4 className="type-heading-lg mb-2">Elevated Depth</h4>
              <p className="type-body-md text-white/60 mb-6">Layered graphite depth with subtle top-border highlights and massive hover glow.</p>
              <Button variant="primary" size="sm" className="w-full">Get Started</Button>
            </GlowCard>

            <Card hoverable>
              <Badge variant="outline" className="mb-4">Motion System</Badge>
              <h4 className="type-heading-lg mb-2">Cubic Bezier</h4>
              <p className="type-body-md text-white/60 mb-6">Hover over this card to see the controlled 250ms translateY and shadow expansion.</p>
              <Button variant="outline" size="sm" className="w-full">Interact</Button>
            </Card>
          </div>
        </Container>
      </SectionWrapper>

    </main>
  );
}
