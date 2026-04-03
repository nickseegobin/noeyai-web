'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input, Button } from '@heroui/react';
import api, { getApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/ui/NavBar';
import AppLeftPanel from '@/components/ui/AppLeftPanel';
import AvatarPicker from '@/components/ui/AvatarPicker';

export default function ChildSettingsPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);

  const [displayName, setDisplayName] = useState(activeChild?.display_name ?? '');
  const [avatarIndex, setAvatarIndex] = useState(activeChild?.avatar_index ?? 1);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);
  const [dirty, setDirty]             = useState(false);

  const nickname = (activeChild as any)?.nickname ?? '';

  useEffect(() => {
    if (!authLoading && !user)                         router.replace('/login');
    if (!authLoading && user && !user.active_child_id) router.replace('/profile-select');
  }, [authLoading, user]);

  useEffect(() => {
    if (activeChild) {
      setDisplayName(activeChild.display_name);
      setAvatarIndex(activeChild.avatar_index);
    }
  }, [activeChild?.child_id]);

  async function handleSave() {
    if (!activeChild) return;
    setSaving(true); setError(''); setSuccess(false);
    try {
      await api.patch(`/children/${activeChild.child_id}`, {
        display_name: displayName.trim(),
        avatar_index: avatarIndex,
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
          title="My Settings"
          description="Update your name and avatar. Your leaderboard nickname stays private and can't be changed."
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
              My Settings
            </h2>
          </div>

          {/* Centered content */}
          <div className="flex-1 flex flex-col justify-center px-5 md:px-10 pb-10">

            {/* Desktop heading */}
            <div className="hidden md:block mb-6">
              <h1 className="font-display italic font-semibold text-noey-dark text-2xl">
                My Settings
              </h1>
              <div className="h-px bg-noey-neutral mt-3" />
            </div>

            <div className="flex flex-col gap-5">

              {/* Avatar picker */}
              <div className="flex justify-center">
                <AvatarPicker
                  value={avatarIndex}
                  onChange={v => { setAvatarIndex(v); setDirty(true); }}
                  role="child"
                  count={8}
                />
              </div>

              {/* Display name */}
              <Input
                label="Name"
                value={displayName}
                onValueChange={v => { setDisplayName(v); setDirty(true); }}
                variant="flat"
                classNames={{ inputWrapper: 'bg-noey-neutral rounded-2xl h-14' }}
                isDisabled={saving}
              />

              {/* Nickname — read only */}
              {nickname && (
                <div className="bg-noey-neutral rounded-2xl px-4 py-3.5">
                  <p className="font-sans text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-0.5">
                    Leaderboard Nickname
                  </p>
                  <p className="font-sans font-bold text-base text-noey-dark">@{nickname}</p>
                  <p className="font-sans text-noey-text-muted text-xs mt-1">
                    Keeps your real name private — set at account creation.
                  </p>
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
                isDisabled={!dirty || saving || !displayName.trim()}
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