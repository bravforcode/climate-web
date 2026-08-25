import React, { useState } from 'react';
import { UserRole } from './types';
import { LineUserProfile } from './domain/lineAuth';
import { Navbar, WorkspaceStage } from './components/Navbar';
import { Hero } from './components/Hero';
import { BentoGrid } from './components/BentoGrid';
import { PublicTelemetry } from './components/PublicTelemetry';
import { ProposalModal } from './components/ProposalModal';
import { LineLoginModal } from './components/LineLoginModal';
import { ModulePaymentBilling } from './components/modules/ModulePaymentBilling';
import { Footer } from './components/Footer';
import { MOCK_LINE_USER } from './data/mockData';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('operator');
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceStage>('assess');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState<boolean>(false);
  const [isLineLoginModalOpen, setIsLineLoginModalOpen] = useState<boolean>(false);
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState<boolean>(false);
  const [lineUser, setLineUser] = useState<LineUserProfile | null>(MOCK_LINE_USER);

  const handleToggleOnline = () => {
    setIsOnline((prev) => !prev);
  };

  const handleExploreClick = () => {
    setActiveWorkspace('assess');
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
    setIsSponsorModalOpen(true);
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
      
      {/* 1. Navigation with Floating Pill, 3-Stage Switcher & Unified Role Popover */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={setActiveWorkspace}
        isOnline={isOnline}
        onToggleOnline={handleToggleOnline}
        offlineQueueCount={offlineQueueCount}
        onOpenProposalModal={() => setIsProposalModalOpen(true)}
        onOpenSponsorModal={handleSponsorClick}
        lineUser={lineUser}
        onOpenLineLoginModal={() => setIsLineLoginModalOpen(true)}
      />

      {/* 2. Attention: High Impact Cinematic Hero */}
      <main className="flex-1">
        <Hero
          onExploreClick={handleExploreClick}
          onTelemetryClick={handleTelemetryClick}
          onOpenLineLogin={() => setIsLineLoginModalOpen(true)}
          lineUser={lineUser}
          onSponsorClick={handleSponsorClick}
        />

        {/* 3. Interest & Action: Progressive 3-Stage Workspace Bento Grid */}
        <BentoGrid
          currentRole={currentRole}
          activeWorkspace={activeWorkspace}
          onSelectWorkspace={setActiveWorkspace}
          isOnline={isOnline}
          onOpenProposalModal={() => setIsProposalModalOpen(true)}
          onOpenSponsorModal={handleSponsorClick}
          onSyncComplete={() => setOfflineQueueCount(0)}
        />

        {/* 4. Live Verifiable Public Telemetry */}
        <PublicTelemetry />
      </main>

      {/* 5. Professional Footer */}
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

      {/* Dedicated CSR Sponsorship Modal (Reduced clutter from main scroll) */}
      <ModulePaymentBilling
        isOpen={isSponsorModalOpen}
        onClose={() => setIsSponsorModalOpen(false)}
        currentRole={currentRole}
      />

    </div>
  );
}

export default App;
