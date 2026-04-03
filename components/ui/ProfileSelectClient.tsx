'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, ModalContent, ModalBody, ModalHeader, Button } from '@heroui/react';
import api, { getApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import AvatarCircle from '@/components/ui/AvatarCircle';
import BrandLogo from '@/components/ui/BrandLogo';
import PinInput from '@/components/ui/PinInput';
import Spinner from '@/components/ui/Spinner';
import { SiteSettings } from '@/lib/wp';
import type { ChildProfile, PinStatus } from '@/types/noey';

export default function ProfileSelectClient({ site }: { site: SiteSettings }) {
  const { user, loading: authLoading, refreshUser, setActiveChild, logout } = useAuth();
  const [children, setChildren]               = useState<ChildProfile[]>([]);
  const [canAddMore, setCanAddMore]           = useState(true);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [pinOpen, setPinOpen]                 = useState(false);
  const [pin, setPin]                         = useState('');
  const [pinError, setPinError]               = useState('');
  const [pinLocked, setPinLocked]             = useState(false);
  const [lockSecs, setLockSecs]               = useState(0);
  const [switchingId, setSwitchingId]         = useState<number | null>(null);
  const [verifying, setVerifying]             = useState(false);
  const router   = useRouter();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
    if (!authLoading && user) loadChildren();
  }, [authLoading]);

  async function loadChildren() {
    setLoadingChildren(true);
    try {
      await api.post('/children/deselect').catch(() => {});
      const { data } = await api.get('/children');
      setChildren(data.data.children ?? []);
      setCanAddMore(data.data.can_add_more ?? true);
    } catch { /* ignore */ }
    finally { setLoadingChildren(false); }
  }

  function startCountdown(secs: number) {
    setLockSecs(secs);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setLockSecs(s => {
        if (s <= 1) { clearInterval(timerRef.current!); setPinLocked(false); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  async function handleParentTap() {
    try {
      const { data } = await api.get('/auth/pin/status');
      const s: PinStatus = data.data;
      if (s.is_locked) { setPinLocked(true); startCountdown(s.seconds_remaining); }
    } catch { /* no pin set yet */ }
    setPinOpen(true);
  }

  async function handlePinSubmit() {
    if (pin.length !== 4) return;
    setVerifying(true); setPinError('');
    try {
      await api.post('/auth/pin/verify', { pin });
      await api.post('/children/deselect').catch(() => {});
      setActiveChild(null);
      await refreshUser();
      setPinOpen(false); setPin('');
      router.push('/parent/home');
    } catch (err) {
      const { code, message } = getApiError(err);
      if (code === 'noey_pin_not_set') {
        setPinOpen(false); setPin('');
        router.push('/settings/pin/create');
      } else if (code === 'noey_pin_locked') {
        setPinLocked(true);
        const m = message.match(/(\d+)\s*second/);
        startCountdown(m ? parseInt(m[1]) : 900);
        setPinError(message);
      } else if (code === 'noey_pin_invalid') {
        const m = message.match(/(\d+)\s*attempt/);
        setPinError(`Incorrect PIN. ${m ? m[1] : '?'} attempt(s) remaining.`);
        setPin('');
      } else {
        setPinError(message);
      }
    } finally { setVerifying(false); }
  }

  async function handleChildTap(child: ChildProfile) {
    setSwitchingId(child.child_id);
    try {
      await api.post(`/children/${child.child_id}/switch`);
      setActiveChild(child.child_id);
      await refreshUser();
      router.push('/child/home');
    } catch (err) {
      alert(getApiError(err).message);
    } finally { setSwitchingId(null); }
  }

  const addSlots = canAddMore ? Math.max(0, 3 - children.length) : 0;

  if (authLoading || !user) return null;

  return (
    <>
      <div className="min-h-dvh bg-noey-primary flex flex-col items-center justify-center px-8 py-12">

        {/* Logo + title */}
        <div className="flex flex-col items-center mb-12">
         <BrandLogo variant="white" className="w-80 mb-3" />

          <p className="font-sans font-semibold text-white text-lg tracking-wide">
            Select Profile
          </p>
        </div>

        {loadingChildren ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner color="#ffffff" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:flex md:flex-row md:justify-center
                          gap-8 md:gap-12 w-full max-w-2xl">

            {/* Parent slot */}
            <button
              onClick={handleParentTap}
              className="flex flex-col items-center gap-3 active:scale-95 transition-transform"
            >
              <AvatarCircle
                avatarIndex={user.avatar_index ?? 1}
                displayName={user.display_name}
                size={120}
                showRing
                role="parent"
              />
              <span className="font-sans font-semibold text-base text-white">
                {user.display_name}
              </span>
            </button>

            {/* Child slots */}
            {children.map(child => (
              <button
                key={child.child_id}
                onClick={() => handleChildTap(child)}
                disabled={switchingId === child.child_id}
                className="flex flex-col items-center gap-3 active:scale-95 transition-transform"
              >
                <div className="relative">
                  <AvatarCircle
                    avatarIndex={child.avatar_index}
                    displayName={child.display_name}
                    size={120}
                    showRing
                    role="child"
                  />
                  {switchingId === child.child_id && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20">
                      <Spinner />
                    </div>
                  )}
                </div>
                <span className="font-sans font-semibold text-base text-white">
                  {child.display_name}
                </span>
              </button>
            ))}

            {/* Add child slots */}
            {Array.from({ length: addSlots }).map((_, i) => (
              <button
                key={`add-${i}`}
                onClick={() => router.push('/parent/children/add')}
                className="flex flex-col items-center gap-3 active:scale-95 transition-transform"
              >
                <div className="w-[120px] h-[120px] rounded-full bg-white flex items-center justify-center">
                  <span className="text-noey-primary text-4xl font-light leading-none">+</span>
                </div>
                <span className="font-sans font-semibold text-base text-white">
                  Child
                </span>
              </button>
            ))}

          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="mt-12 font-sans text-sm text-white/60 hover:text-white/90 transition-colors"
        >
          Not you? Log out
        </button>

      </div>

      {/* PIN modal */}
      <Modal
        isOpen={pinOpen}
        onOpenChange={(open) => {
          if (!open) { setPinOpen(false); setPin(''); setPinError(''); }
        }}
        placement="center"
        classNames={{ wrapper: 'items-center px-5' }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col items-center gap-1 pb-0">
            <h2 className="font-display italic font-semibold text-xl text-noey-dark">
              Parent Access
            </h2>
            <p className="font-sans text-noey-text-muted text-sm font-normal">
              Enter your 4-digit PIN to continue
            </p>
          </ModalHeader>
          <ModalBody className="pb-6 pt-4 flex flex-col gap-4">
            {pinLocked ? (
              <div className="text-center py-2">
                <div className="text-4xl font-black text-noey-primary mb-2">
                  {Math.floor(lockSecs / 60)}:{String(lockSecs % 60).padStart(2, '0')}
                </div>
                <p className="font-sans text-noey-text-muted text-sm">
                  PIN locked. Please wait.
                </p>
              </div>
            ) : (
              <>
                <PinInput
                  value={pin}
                  onChange={v => { setPin(v); setPinError(''); }}
                  disabled={verifying}
                  error={!!pinError}
                  autoFocus
                />
                {pinError && (
                  <p className="font-sans text-red-500 text-sm font-medium text-center">
                    {pinError}
                  </p>
                )}
                <Button
                  onPress={handlePinSubmit}
                  isLoading={verifying}
                  isDisabled={pin.length < 4 || verifying}
                  className="w-full bg-noey-primary text-white font-bold h-14 rounded-2xl"
                >
                  Confirm
                </Button>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}