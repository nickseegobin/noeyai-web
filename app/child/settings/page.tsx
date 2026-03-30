"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button } from "@heroui/react";
import api, { getApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import AvatarPicker from "@/components/ui/AvatarPicker";
import BackButton from "@/components/ui/BackButton";

export default function ChildSettingsPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);

  const [displayName, setDisplayName] = useState(activeChild?.display_name ?? "");
  const [avatarIndex, setAvatarIndex] = useState(activeChild?.avatar_index ?? 1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Nickname is set at creation — read-only display only
  const nickname = (activeChild as any)?.nickname ?? "";

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
    if (!authLoading && user && !user.active_child_id) router.replace("/profile-select");
  }, [authLoading, user]);

  useEffect(() => {
    if (activeChild) {
      setDisplayName(activeChild.display_name);
      setAvatarIndex(activeChild.avatar_index);
    }
  }, [activeChild?.child_id]);

  async function handleSave() {
    if (!activeChild) return;
    setSaving(true);
    setError("");
    setSuccess(false);
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
    <div className="page-container">
      <h1 className="font-black text-2xl text-noey-text mb-8">My Settings</h1>

      <div className="flex justify-center mb-8">
        <AvatarPicker
          value={avatarIndex}
          onChange={(v) => { setAvatarIndex(v); setDirty(true); }}
          role="child"
          count={5}
        />
      </div>

      <div className="flex flex-col gap-4">
        {/* Display name — editable */}
        <Input
          label="Name"
          value={displayName}
          onValueChange={(v) => { setDisplayName(v); setDirty(true); }}
          variant="flat"
          classNames={{ inputWrapper: "bg-noey-surface rounded-2xl h-14" }}
          isDisabled={saving}
        />

        {/* Nickname — read-only display, set at account creation */}
        {nickname ? (
          <div className="bg-noey-surface rounded-2xl px-4 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-0.5">
                Leaderboard Nickname
              </p>
             

            <p className="font-bold text-base text-noey-text">@{nickname}</p>
            </div>
            
          </div>
        ) : null}

        {/* Info note about nickname */}
        {nickname && (
          <p className="text-noey-text-muted text-xs px-1">
            Your leaderboard nickname keeps your real name private. It was assigned when your account was created.
          </p>
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
      </div>

      <div className="mt-auto pt-8">
        <Button
          onPress={handleSave}
          isLoading={saving}
          isDisabled={!dirty || saving || !displayName.trim()}
          className="w-full bg-noey-primary text-white font-bold h-14 rounded-2xl disabled:opacity-40"
        >
          Save Changes
        </Button>
      </div>

      <BackButton href="/child/home" />
    </div>
  );
}