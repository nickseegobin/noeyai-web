'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@heroui/react';

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit() {
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email.'); return; }

    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_WP_API}/noeyai/v1/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-8 py-12 bg-noey-bg">
      <div className="w-full max-w-sm flex flex-col items-center">

        <h2 className="font-display italic font-semibold text-noey-dark text-3xl text-center mb-2">
          Forgot Password?
        </h2>
        <p className="font-sans text-noey-text-muted text-sm text-center mb-8">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {sent ? (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full bg-noey-neutral rounded-2xl px-6 py-5 text-center">
              <p className="font-sans font-semibold text-noey-dark text-sm">
                Check your inbox
              </p>
              <p className="font-sans text-noey-text-muted text-sm mt-1">
                If an account exists for <span className="font-medium text-noey-dark">{email}</span>,
                you&apos;ll receive a reset link shortly.
              </p>
            </div>
            <Link
              href="/login"
              className="font-sans text-sm text-noey-text-muted hover:text-noey-text transition-colors"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 w-full">
              <Input
                label="Email address"
                type="email"
                value={email}
                onValueChange={(v) => { setEmail(v); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                isDisabled={loading}
                autoComplete="email"
                variant="flat"
                classNames={{ inputWrapper: 'bg-noey-neutral rounded-2xl h-14' }}
              />

              {error && (
                <p className="text-red-500 text-sm font-medium text-center">{error}</p>
              )}
            </div>

            <div className="flex flex-col gap-3 mt-8 w-full">
              <Button
                onPress={handleSubmit}
                isLoading={loading}
                className="w-full bg-noey-primary text-white font-bold text-base h-14 rounded-2xl"
              >
                Send Reset Link
              </Button>
              <Link
                href="/login"
                className="block w-full text-center font-sans font-semibold text-noey-text bg-noey-neutral rounded-2xl py-4 hover:opacity-90 transition-all"
              >
                Back to Login
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}