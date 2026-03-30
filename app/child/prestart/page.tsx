"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardBody, Button } from "@heroui/react";
import api, { getApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import { GemIcon } from "@/components/ui/GemBadge";
import BackButton from "@/components/ui/BackButton";
import Spinner from "@/components/ui/Spinner";
import { DIFFICULTY_CONFIG } from "@/types/noey";
import type { ActiveSession, ExamSession } from "@/types/noey";
import { formatStandard, formatTerm, formatDifficulty, formatDuration } from "@/lib/utils";

function Content() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();

  const subject = sp.get("subject") ?? "Mathematics";
  const standard = sp.get("standard") ?? "std_4";
  const term = sp.get("term") ?? "term_1";
  const difficulty = sp.get("difficulty") ?? "easy";
  const config = DIFFICULTY_CONFIG[difficulty];
  const totalSecs = config.questions * config.minutesPerQuestion * 60;

  const activeChild = user?.children?.find((c) => c.child_id === user?.active_child_id);

  const [balance, setBalance] = useState<number | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [resumePrompt, setResumePrompt] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  // Wait for auth to fully resolve AND active_child_id to be available
  // This prevents the race condition where useEffect fires before context loads
  useEffect(() => {
    if (authLoading) return;
    if (!user?.active_child_id) return;

    async function init() {
      // Re-establish child context using the confirmed ID from context
      await api.post(`/children/${user!.active_child_id}/switch`).catch(() => {});

      await Promise.all([
        api.get("/tokens/balance")
          .then(({ data }) => setBalance(data.data.balance))
          .catch(() => setBalance(0)),
        api.get("/exams/active")
          .then(({ data }) => {
            const s = data.data.session;
            if (s) { setActiveSession(s); setResumePrompt(true); }
          })
          .catch(() => {}),
      ]);
    }

    init();
  }, [authLoading, user?.active_child_id]);

  async function handleDiscard() {
    if (activeSession) await api.delete(`/exams/${activeSession.session_id}`).catch(() => {});
    setActiveSession(null);
    setResumePrompt(false);
  }

  function handleResume() {
    if (!activeSession) return;
    router.push(
      `/child/exam?session_id=${activeSession.session_id}&subject=${encodeURIComponent(activeSession.subject)}&standard=${activeSession.standard}&term=${activeSession.term}&difficulty=${activeSession.difficulty}&resume=true`
    );
  }

  async function handleStart() {
    setError("");
    setStarting(true);
    try {
      // One final switch right before start for reliability
      if (user?.active_child_id) {
        await api.post(`/children/${user.active_child_id}/switch`).catch(() => {});
      }

      const { data } = await api.post("/exams/start", {
        standard,
        term: standard === "std_5" ? "" : term,
        subject,
        difficulty,
      });

      const session: ExamSession = data.data;
      sessionStorage.setItem("noey_exam_session", JSON.stringify(session));

      // Use balance_after from API — this is the definitive post-deduction balance
      setBalance(session.balance_after);

      router.push(
        `/child/exam?session_id=${session.session_id}&subject=${encodeURIComponent(subject)}&standard=${standard}&term=${term}&difficulty=${difficulty}`
      );
    } catch (err) {
      const { code, message } = getApiError(err);
      if (code === "noey_insufficient_tokens") setError("Not enough gems. Please add more to continue.");
      else if (code === "noey_no_exam_available") setError("No exam available for this selection. Try a different subject or difficulty.");
      else setError(message);
    } finally {
      setStarting(false);
    }
  }

  const canAfford = balance === null ? true : balance >= config.gemCost;
  const isReady = !authLoading && balance !== null;

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar zone="child" showGems showAvatar gemCount={balance ?? 0} avatarIndex={activeChild?.avatar_index ?? 1} avatarName={activeChild?.display_name ?? ""} />

      <div className="flex-1 flex flex-col px-5 pb-8">
        <div className="mb-6">
          <span className="font-black text-xl text-noey-text">{subject} </span>
          <span className="text-noey-text-muted font-medium text-sm">{formatStandard(standard)}{term ? ` | ${formatTerm(term)}` : ""}</span>
        </div>

        {resumePrompt && activeSession && (
          <Card className="bg-noey-surface shadow-none border-2 border-noey-gem mb-5">
            <CardBody className="p-5">
              <p className="font-bold text-base text-noey-text mb-1">Unfinished Exam Found</p>
              <p className="text-noey-text-muted text-sm mb-4">You have an unfinished {activeSession.subject} exam. Resume or start fresh?</p>
              <div className="flex gap-3">
                <Button onPress={handleResume} className="flex-1 bg-noey-primary text-white font-bold rounded-2xl">Resume</Button>
                <Button onPress={handleDiscard} variant="flat" className="flex-1 bg-noey-surface-dark text-noey-text font-bold rounded-2xl">Discard</Button>
              </div>
            </CardBody>
          </Card>
        )}

        {!resumePrompt && (
          <Card className="bg-noey-surface shadow-none flex-1">
            <CardBody className="p-5 flex flex-col">
              <p className="font-bold text-base text-noey-text mb-5">{formatDifficulty(difficulty)} Difficulty | {config.questions} Questions</p>

              <div className="flex flex-col divide-y divide-noey-surface-dark">
                {[
                  ["Standard", formatStandard(standard)],
                  term ? ["Term", formatTerm(term)] : null,
                  ["Difficulty", formatDifficulty(difficulty)],
                  ["Questions", `${config.questions} Questions`],
                  ["Total Time", formatDuration(totalSecs)],
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label as string} className="flex items-center justify-between py-3">
                    <span className="text-noey-text-muted font-medium text-sm">{label}</span>
                    <span className="font-bold text-base text-noey-text">{value}</span>
                  </div>
                ))}
              </div>

              {!isReady && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Spinner color="#111114" size={16} />
                  <span className="text-noey-text-muted text-sm">Loading...</span>
                </div>
              )}

              <Button
                onPress={handleStart}
                isLoading={starting}
                isDisabled={!canAfford || starting || !isReady}
                className="w-full bg-noey-primary text-white font-bold h-14 rounded-2xl mt-6"
              >
                {!starting && <span className="flex items-center gap-2">Start <GemIcon size={18} /> {config.gemCost}</span>}
              </Button>

              {!canAfford && balance !== null && (
                <p className="text-noey-gem text-sm font-medium text-center mt-2">You need {config.gemCost} gem{config.gemCost > 1 ? "s" : ""} to start</p>
              )}

              {error && (
                <Card className="bg-red-50 border border-red-200 shadow-none mt-3">
                  <CardBody className="py-3 px-4"><p className="text-red-600 text-sm font-medium text-center">{error}</p></CardBody>
                </Card>
              )}
            </CardBody>
          </Card>
        )}

        <BackButton />
      </div>
    </div>
  );
}

export default function PreStartPage() {
  return <Suspense><Content /></Suspense>;
}