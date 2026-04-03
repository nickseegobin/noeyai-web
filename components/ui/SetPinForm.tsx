'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { getApiError } from '@/lib/api';
import PinInput from '@/components/ui/PinInput';
import Spinner from '@/components/ui/Spinner';
import { SiteSettings } from '@/lib/wp';
import BrandLogo from '@/components/ui/BrandLogo';

interface Props {
  successPath?: string;
  showBack?:    boolean;
  backPath?:    string;
}

export default function SetPinForm({
  successPath = '/register/child',
  showBack    = false,
  backPath    = '/profile-select',
 
}: Props) {
  const [pin, setPin]           = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router                  = useRouter();

  const ready = pin.length === 4 && confirmPin.length === 4;

  async function handleConfirm() {
    if (pin !== confirmPin) {
      setError('PINs do not match. Please try again.');
      setPin('');
      setConfirmPin('');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/pin/set', { pin });
      router.push(successPath);
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center min-h-dvh px-8 py-12 bg-noey-bg">
      <div className="w-full max-w-sm mx-auto flex flex-col">

        
        {/* Back button */}
        {showBack && (
          <button
            onClick={() => router.push(backPath)}
            className="flex items-center gap-2 text-noey-text-muted font-semibold mb-6 self-start"
          >
            <div className="w-8 h-8 rounded-full bg-noey-dark flex items-center justify-center">
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M7 1L1 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            Back
          </button>
        )}

        <h1 className="font-display italic font-semibold text-3xl text-noey-dark text-center mb-3">
          Set Your Secret PIN
        </h1>
        <p className="font-sans text-noey-text-muted text-sm text-center mb-10">
          Your PIN keeps your parent zone secure.
        </p>

        <div className="flex flex-col gap-8">

          <div>
            <p className="font-sans font-semibold text-base text-noey-dark text-center mb-4">
              Enter PIN
            </p>
            <PinInput
              value={pin}
              onChange={v => { setPin(v); setError(''); }}
              disabled={loading}
              error={!!error}
            />
          </div>

          <div>
            <p className="font-sans font-semibold text-base text-noey-dark text-center mb-4">
              Confirm PIN
            </p>
            <PinInput
              value={confirmPin}
              onChange={v => { setConfirmPin(v); setError(''); }}
              disabled={loading}
              error={!!error}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <p className="text-red-600 text-sm font-medium text-center">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-10">
          <button
            onClick={handleConfirm}
            disabled={!ready || loading}
            className="noey-btn-primary flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading ? <Spinner /> : 'Confirm PIN'}
          </button>
        </div>

      </div>
    </div>
  );
}