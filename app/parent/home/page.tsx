'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/ui/NavBar';
import AppLeftPanel from '@/components/ui/AppLeftPanel';
import GemBadge from '@/components/ui/GemBadge';
import AvatarCircle from '@/components/ui/AvatarCircle';
import Spinner from '@/components/ui/Spinner';
import api from '@/lib/api';
import type { ChildProfile, SessionResult } from '@/types/noey';

interface ChildSummary {
  child:      ChildProfile;
  totalExams: number;
  avgScore:   number;
}

function scoredSessions(sessions: SessionResult[]) {
  return sessions.filter(s => s.total > 0 && s.percentage !== undefined && s.percentage !== null);
}

export default function ParentHomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [balance, setBalance]     = useState(0);
  const [summaries, setSummaries] = useState<ChildSummary[]>([]);
  const [children, setChildren]   = useState<ChildProfile[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (user) loadData();
  }, [authLoading, user]);

  async function loadData() {
    setLoading(true);
    try {
      const [balRes, childRes] = await Promise.all([
        api.get('/tokens/balance'),
        api.get('/children'),
      ]);
      setBalance(balRes.data.data.balance);
      const kids: ChildProfile[] = childRes.data.data.children ?? [];
      setChildren(kids);

      if (kids.length) {
        const results = await Promise.allSettled(
          kids.map(c => api.get('/results', { params: { child_id: c.child_id, per_page: 50 } }))
        );
        const built: ChildSummary[] = kids.map((child, i) => {
          const res = results[i];
          if (res.status !== 'fulfilled') return { child, totalExams: 0, avgScore: 0 };
          const sessions: SessionResult[] = res.value.data.data.sessions ?? [];
          const done = scoredSessions(sessions);
          const totalExams = done.length;
          const avgScore   = totalExams > 0
            ? Math.round(done.reduce((sum, s) => sum + s.percentage, 0) / totalExams)
            : 0;
          return { child, totalExams, avgScore };
        });
        setSummaries(built);
      }
    } finally { setLoading(false); }
  }

  if (authLoading) return null;

  const quickLinks = [
    { label: 'Children Settings', href: '/parent/children' },
    { label: 'Add Tokens',        href: '/parent/tokens' },
    { label: 'Analytics',         href: '/parent/analytics' },
    { label: 'News',              href: '/news' },
  ];

  return (
    <div className="flex flex-col min-h-dvh bg-noey-bg">

      <NavBar
        zone="parent"
        showGems
        showAvatar
        gemCount={balance}
        avatarIndex={user?.avatar_index ?? 1}
        avatarName={user?.display_name ?? ''}
      />

      <div className="flex flex-1">

        {/* Left panel — desktop only */}
        <AppLeftPanel
          image="/illustrations/parents-dashboard.png"
          title="Welcome to your Dashboard!"
          description="Track your children's progress, manage gems, and review exam results all in one place."
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-y-auto">

          {/* ── MOBILE: title row ── */}
          <div className="md:hidden px-5 mt-6 mb-4">
            <h1 className="font-display italic font-semibold text-noey-dark text-2xl">
              {user?.display_name}&apos;s Dashboard
            </h1>
          </div>

          {/* ── DESKTOP: heading ── */}
          <div className="hidden md:block px-10 pt-10 pb-6">
            <h1 className="font-display italic font-semibold text-noey-dark text-2xl">
              {user?.display_name}&apos;s Dashboard
            </h1>
            <div className="h-px bg-noey-neutral mt-3" />
          </div>

          {loading ? (
            <div className="flex justify-center pt-16">
              <Spinner color="#3D2B3D" size={28} />
            </div>
          ) : (
            <div className="flex-1 px-5 md:px-10 pb-10 flex flex-col gap-5">

              {/* Gem balance card */}
              <div className="bg-noey-neutral rounded-3xl p-5">
                <p className="font-sans font-semibold text-noey-dark text-base mb-3">
                  {user?.display_name}
                </p>
                <div className="flex items-center gap-3 mb-1">
                  <GemBadge count={balance} />
                  <p className="font-sans text-noey-text-muted text-sm">gems available</p>
                </div>
                <p className="font-sans text-noey-text-muted text-xs mt-1">
                  3 free gems reset on the 1st of every month
                </p>
              </div>

              {/* Children list */}
              {children.length === 0 ? (
                <div className="bg-noey-neutral rounded-3xl p-6 text-center">
                  <p className="font-sans font-bold text-noey-dark mb-3">
                    No children linked yet
                  </p>
                  <button
                    onClick={() => router.push('/parent/children/add')}
                    className="bg-noey-primary text-white font-bold px-6 py-3 rounded-2xl text-sm"
                  >
                    Add Child
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <h2 className="font-sans font-semibold text-noey-text-muted text-xs uppercase tracking-wide">
                    Your Children
                  </h2>
                  {summaries.map(({ child, totalExams, avgScore }) => (
                    <button
                      key={child.child_id}
                      onClick={() => router.push(`/parent/analytics?child_id=${child.child_id}`)}
                      className="bg-noey-neutral rounded-3xl p-4 flex items-center gap-4 text-left hover:bg-[#EDE8E0] transition-colors w-full active:scale-[0.98]"
                    >
                      <AvatarCircle
                        avatarIndex={child.avatar_index}
                        displayName={child.display_name}
                        size={52}
                        showRing
                        role="child"
                      />
                      <div className="flex-1">
                        <p className="font-sans font-bold text-base text-noey-dark">
                          {child.display_name}
                        </p>
                        <p className="font-sans text-noey-text-muted text-sm">
                          {totalExams > 0
                            ? `${totalExams} exam${totalExams > 1 ? 's' : ''} · ${avgScore}% avg`
                            : 'No exams yet'}
                        </p>
                      </div>
                      <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                        <path d="M1 1l5 5-5 5" stroke="#9B9BA8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              {/* Quick links grid */}
              <div>
                <h2 className="font-sans font-semibold text-noey-text-muted text-xs uppercase tracking-wide mb-3">
                  Quick Links
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {quickLinks.map(({ label, href }) => (
                    <button
                      key={href}
                      onClick={() => router.push(href)}
                      className="bg-noey-neutral rounded-2xl py-4 px-3 text-center font-sans font-semibold text-sm text-noey-dark hover:bg-[#EDE8E0] transition-colors active:scale-[0.98]"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* efoundry credit — desktop only */}
          <div className="hidden md:flex justify-end px-10 pb-6">
            <p className="font-sans text-xs text-noey-text-muted">
              Created with love and care by{' '}
              <span className="font-medium text-noey-text">efoundry</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}