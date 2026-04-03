'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@heroui/react';
import api, { getApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/ui/NavBar';
import AppLeftPanel from '@/components/ui/AppLeftPanel';
import { STANDARDS, TERMS } from '@/types/noey';

export default function ChildContentSettingsPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);

  const [standard, setStandard] = useState(activeChild?.standard ?? 'std_4');
  const [term, setTerm]         = useState(activeChild?.term     ?? 'term_1');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [dirty, setDirty]       = useState(false);

  useEffect(() => {
    if (!authLoading && !user)                         router.replace('/login');
    if (!authLoading && user && !user.active_child_id) router.replace('/profile-select');
  }, [authLoading, user]);

  useEffect(() => {
    if (activeChild) {
      setStandard(activeChild.standard);
      setTerm(activeChild.term ?? 'term_1');
    }
  }, [activeChild?.child_id]);

  async function handleSave() {
    if (!activeChild) return;
    setSaving(true); setError('');
    try {
      await api.patch(`/children/${activeChild.child_id}`, {
        standard,
        term: standard === 'std_5' ? '' : term,
      });
      await refreshUser();
      setDirty(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !activeChild) return null;

  return (
    <div className="flex flex-col min-h-dvh bg-noey-bg">

      <NavBar
        zone="child"
        showGems
        showAvatar
        gemCount={user?.token_balance ?? 0}
        avatarIndex={activeChild.avatar_index}
        avatarName={activeChild.display_name}
      />

      <div className="flex flex-1">

        <AppLeftPanel
          image="/illustrations/child-homeroom-img.png"
          title="Content Settings"
          description="Set your standard and term to make sure your exams match exactly where you are in the curriculum."
        />

        <div className="flex-1 flex flex-col relative">

          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between px-5 mt-4 mb-6">
            <Link href="/child/home" className="flex items-center gap-2 text-noey-text-muted font-semibold text-sm">
              <div className="w-8 h-8 rounded-full bg-noey-dark flex items-center justify-center">
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                  <path d="M7 1L1 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              Back
            </Link>
            <h2 className="font-display italic font-semibold text-noey-dark text-lg">
              Content Settings
            </h2>
          </div>

          {/* Centered content */}
          <div className="flex-1 flex flex-col justify-center px-5 md:px-10 pb-10">

            {/* Desktop heading */}
            <div className="hidden md:block mb-6">
              <h1 className="font-display italic font-semibold text-noey-dark text-2xl">
                Content Settings
              </h1>
              <p className="font-sans text-noey-text-muted text-sm mt-1">
                These settings control which exams are shown for {activeChild.display_name}.
              </p>
              <div className="h-px bg-noey-neutral mt-3" />
            </div>

            <div className="flex flex-col gap-6">

              {/* Standard */}
              <div>
                <label className="font-sans text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-3 block">
                  Standard
                </label>
                <div className="flex flex-col gap-2">
                  {STANDARDS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => { setStandard(s.value); if (s.value === 'std_5') setTerm(''); setDirty(true); }}
                      className={`flex items-center justify-between px-5 py-4 rounded-2xl font-sans font-semibold text-base transition-colors
                        ${standard === s.value
                          ? 'bg-noey-primary text-white'
                          : 'bg-noey-neutral text-noey-dark hover:bg-[#EDE8E0]'}`}
                    >
                      {s.label}
                      {standard === s.value && <span className="text-lg">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Term */}
              {standard !== 'std_5' && (
                <div>
                  <label className="font-sans text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-3 block">
                    Term
                  </label>
                  <div className="flex gap-3">
                    {TERMS.map(t => (
                      <button
                        key={t.value}
                        onClick={() => { setTerm(t.value); setDirty(true); }}
                        className={`flex-1 py-4 rounded-2xl font-sans font-bold text-sm transition-colors
                          ${term === t.value
                            ? 'bg-noey-primary text-white'
                            : 'bg-noey-neutral text-noey-dark hover:bg-[#EDE8E0]'}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                  <p className="text-red-600 text-sm font-medium text-center">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                  <p className="text-green-600 text-sm font-medium text-center">✓ Settings saved!</p>
                </div>
              )}

              <Button
                onPress={handleSave}
                isLoading={saving}
                isDisabled={!dirty || saving}
                className="w-full bg-noey-primary text-white font-bold h-14 rounded-2xl disabled:opacity-40"
              >
                Save Changes
              </Button>

            </div>
          </div>

          <div className="hidden md:flex justify-end px-10 pb-6">
            <p className="font-sans text-xs text-noey-text-muted">
              Created with love and care by <span className="font-medium text-noey-text">efoundry</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}