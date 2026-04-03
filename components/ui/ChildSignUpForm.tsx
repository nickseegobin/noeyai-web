'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import api, { getApiError } from '@/lib/api';
import AvatarPicker from '@/components/ui/AvatarPicker';
import BrandLogo from '@/components/ui/BrandLogo';
import Spinner from '@/components/ui/Spinner';
import { STANDARDS, TERMS } from '@/types/noey';
import { generateNickname, generateUsername } from '@/lib/nickname';
import { SiteSettings } from '@/lib/wp';

interface F {
  firstName:   string;
  lastName:    string;
  nickname:    string;
  age:         string;
  standard:    string;
  term:        string;
  avatarIndex: number;
}
interface E {
  firstName?: string;
  lastName?:  string;
  age?:       string;
  server?:    string;
}

function FE({ msg }: { msg: string }) {
  return <p className="text-red-500 text-xs font-medium mt-1 ml-2">{msg}</p>;
}

function generateChildPassword(): string {
  const uuid = typeof crypto !== 'undefined'
    ? crypto.randomUUID().replace(/-/g, '')
    : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return `C${uuid}Aa1!`;
}

export default function ChildSignUpForm({ site }: { site: SiteSettings }) {
  const router = useRouter();
  const [f, setF] = useState<F>({
    firstName: '', lastName: '', nickname: generateNickname(),
    age: '', standard: 'std_4', term: 'term_1', avatarIndex: 2,
  });
  const [e, setE]         = useState<E>({});
  const [loading, setLoading] = useState(false);

  function set(k: keyof F, v: string | number) {
    setF(p => ({ ...p, [k]: v }));
    setE(p => ({ ...p, [k]: undefined, server: undefined }));
  }

  function regenNickname() {
    setF(p => ({ ...p, nickname: generateNickname() }));
  }

  function validate() {
    const err: E = {};
    if (!f.firstName.trim()) err.firstName = 'First name is required.';
    if (!f.lastName.trim())  err.lastName  = 'Last name is required.';
    if (f.age && (isNaN(Number(f.age)) || Number(f.age) < 5 || Number(f.age) > 16))
      err.age = 'Valid age: 5–16.';
    setE(err);
    return Object.keys(err).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const displayName = `${f.firstName.trim()} ${f.lastName.trim()}`;
      const username    = generateUsername(f.firstName.trim());
      await api.post('/children', {
        display_name: displayName,
        first_name:   f.firstName.trim(),
        last_name:    f.lastName.trim(),
        username,
        nickname:     f.nickname,
        password:     generateChildPassword(),
        standard:     f.standard,
        term:         f.standard === 'std_5' ? '' : f.term,
        age:          f.age ? Number(f.age) : undefined,
        avatar_index: f.avatarIndex,
      });
      router.push('/profile-select');
    } catch (err) {
      const { code, message } = getApiError(err);
      if (code === 'noey_max_children') setE({ server: 'Maximum of 3 children reached.' });
      else setE({ server: message });
    } finally {
      setLoading(false);
    }
  }

  const valid = !!(f.firstName.trim() && f.lastName.trim());

  return (
    <div className="flex flex-col justify-center min-h-dvh px-8 py-12 bg-noey-bg">
      <div className="w-full max-w-sm mx-auto flex flex-col">

        <div className="flex justify-center mb-4">
         
        </div>

        <h1 className="font-display italic font-semibold text-3xl text-noey-dark text-center mb-2">
          Child Sign Up
        </h1>
        <p className="font-sans text-noey-text-muted text-sm text-center mb-7">
          Children sign in by selecting their profile.
        </p>

        <div className="flex justify-center mb-7">
          <AvatarPicker
            value={f.avatarIndex}
            onChange={v => set('avatarIndex', v)}
            role="child"
            count={8}
          />
        </div>

        <div className="flex flex-col gap-3">

          {/* Name row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="First Name"
                value={f.firstName}
                onChange={ev => set('firstName', ev.target.value)}
                disabled={loading}
                className={`noey-input ${e.firstName ? 'border-red-400' : ''}`}
              />
              {e.firstName && <FE msg={e.firstName} />}
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Last Name"
                value={f.lastName}
                onChange={ev => set('lastName', ev.target.value)}
                disabled={loading}
                className={`noey-input ${e.lastName ? 'border-red-400' : ''}`}
              />
              {e.lastName && <FE msg={e.lastName} />}
            </div>
          </div>

          {/* Nickname */}
          <div>
            <div className="relative">
              <input
                type="text"
                placeholder="Leaderboard Nickname"
                value={f.nickname}
                onChange={ev => set('nickname', ev.target.value)}
                disabled={loading}
                className="noey-input pr-24"
              />
              <button
                type="button"
                onClick={regenNickname}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-noey-text-muted text-xs font-semibold"
              >
                New Name
              </button>
            </div>
            <p className="text-noey-text-muted text-xs mt-1 ml-2">
              🏆 This name appears on leaderboards — no real name is shown.
            </p>
          </div>

          {/* Age + Standard */}
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="number"
                placeholder="Age (optional)"
                value={f.age}
                onChange={ev => set('age', ev.target.value)}
                disabled={loading}
                min={5}
                max={16}
                className={`noey-input ${e.age ? 'border-red-400' : ''}`}
              />
              {e.age && <FE msg={e.age} />}
            </div>
            <div className="flex-1">
              <select
                value={f.standard}
                onChange={ev => {
                  set('standard', ev.target.value);
                  if (ev.target.value === 'std_5') set('term', '');
                }}
                disabled={loading}
                className="noey-input appearance-none"
              >
                {STANDARDS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Term — hidden for Std 5 */}
          {f.standard !== 'std_5' && (
            <select
              value={f.term}
              onChange={ev => set('term', ev.target.value)}
              disabled={loading}
              className="noey-input appearance-none"
            >
              {TERMS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          )}

          {e.server && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <p className="text-red-600 text-sm font-medium text-center">{e.server}</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={!valid || loading}
            className="noey-btn-primary flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading ? <Spinner /> : 'Create Profile'}
          </button>
        </div>

      </div>
    </div>
  );
}