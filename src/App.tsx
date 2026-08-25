import React, { useState } from 'react';
import { UserRole } from './types';
import { LineUserProfile } from './domain/lineAuth';
import { Navbar } from './components/Navbar';
import { RoleContextBar } from './components/RoleContextBar';
import { Hero } from './components/Hero';
import { BentoGrid } from './components/BentoGrid';
import { PublicTelemetry } from './components/PublicTelemetry';
import { ProposalModal } from './components/ProposalModal';
import { LineLoginModal } from './components/LineLoginModal';
import { Footer } from './components/Footer';
import { MOCK_LINE_USER } from './data/mockData';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('operator');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState<boolean>(false);
  const [isLineLoginModalOpen, setIsLineLoginModalOpen] = useState<boolean>(false);
  const [lineUser, setLineUser] = useState<LineUserProfile | null>(MOCK_LINE_USER);

  const handleToggleOnline = () => {
    setIsOnline((prev) => !prev);
  };

  const handleExploreClick = () => {
    const el = document.getElementById('risk-module');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTelemetryClick = () => {
    const el = document.getElementById('telemetry');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSponsorClick = () => {
    const el = document.getElementById('payment-billing-module');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLineLogin = (user: LineUserProfile) => {
    setLineUser(user);
    if (user.linkedRole || user.role) {
      setCurrentRole(user.linkedRole || user.role);
    }
  };

  const handleLineLogout = () => {
    setLineUser(null);
    setIsLineLoginModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col selection:bg-climate-500/30 selection:text-climate-300">
      
      {/* 1. Navigation with Floating Pill & LINE Status Indicator */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        isOnline={isOnline}
        onToggleOnline={handleToggleOnline}
        offlineQueueCount={offlineQueueCount}
        onOpenProposalModal={() => setIsProposalModalOpen(true)}
        lineUser={lineUser}
        onOpenLineLoginModal={() => setIsLineLoginModalOpen(true)}
      />

      {/* 2. Active Role Context & RLS Bar with LINE Profile Indicator */}
      <RoleContextBar
        currentRole={currentRole}
        onQuickSwitch={setCurrentRole}
        lineUser={lineUser}
        onOpenLineLogin={() => setIsLineLoginModalOpen(true)}
      />

      {/* 3. Attention: High Impact Cinematic Hero */}
      <main className="flex-1">
        <Hero
          onExploreClick={handleExploreClick}
          onTelemetryClick={handleTelemetryClick}
          onOpenLineLogin={() => setIsLineLoginModalOpen(true)}
          lineUser={lineUser}
          onSponsorClick={handleSponsorClick}
        />

        {/* 4. Interest & Desire: Interlocking Gapless Bento Grid (Modules A-J) */}
        <BentoGrid
          currentRole={currentRole}
          isOnline={isOnline}
          onOpenProposalModal={() => setIsProposalModalOpen(true)}
          onSyncComplete={() => setOfflineQueueCount(0)}
        />

        {/* 5. Live Verifiable Public Telemetry */}
        <PublicTelemetry />
      </main>

      {/* 6. Action & Disclosures: Professional Footer */}
      <Footer />

      {/* Full Proposal Modal */}
      <ProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
      />

      {/* LINE Login & Identity Modal */}
      <LineLoginModal
        isOpen={isLineLoginModalOpen}
        onClose={() => setIsLineLoginModalOpen(false)}
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        lineUser={lineUser}
        onLogin={handleLineLogin}
        onLogout={handleLineLogout}
      />

    </div>
  );
}

export default App;
