"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button } from "@heroui/react";
import api, { getApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import AvatarPicker from "@/components/ui/AvatarPicker";
import BackButton from "@/components/ui/BackButton";

const PROFILE_UPDATE_ENABLED = true;

export default function ParentSettingsPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(user?.display_name ?? "");
  // Seed avatar from context — /auth/me now returns avatar_index for parents
  const [avatarIndex, setAvatarIndex] = useState(user?.avatar_index ?? 1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user]);

  // Sync from context when user loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name);
      setAvatarIndex(user.avatar_index ?? 1);
    }
  }, [user?.user_id]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await api.patch("/auth/profile", {
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

  if (authLoading || !user) return null;

  return (
    <div className="page-container">
      <h1 className="font-black text-2xl text-noey-text mb-8">My Settings</h1>

      <div className="flex justify-center mb-8">
        <AvatarPicker
          value={avatarIndex}
          onChange={(v) => { setAvatarIndex(v); setDirty(true); }}
          role="parent"
          count={5}
        />
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="Display Name"
          value={displayName}
          onValueChange={(v) => { setDisplayName(v); setDirty(true); }}
          variant="flat"
          classNames={{ inputWrapper: "bg-noey-surface rounded-2xl h-14" }}
          isDisabled={saving}
        />

        <Input
          label="Email"
          value={user.email}
          variant="flat"
          isReadOnly
          classNames={{ inputWrapper: "bg-noey-surface-dark rounded-2xl h-14" }}
          description="Email cannot be changed here. Contact support."
        />

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

      <BackButton href="/parent/home" />
    </div>
  );
}