// types/noey.ts — NoeyAPI v1.0.0

// NoeyUser — add first_name, last_name, avatar_index for parent
export interface NoeyUser {
  user_id: number;
  display_name: string;
  first_name: string;     // ← add
  last_name: string;      // ← add
  avatar_index: number;   // ← add (removes localStorage workaround)
  email: string;
  role: "parent" | "child" | "admin";
  active_child_id: number | null;
  token_balance: number | null;
  children?: ChildProfile[];
}

// ChildProfile — add nickname
export interface ChildProfile {
  child_id: number;
  display_name: string;
  nickname: string;       // ← add this
  standard: string;
  term: string;
  age: number | null;
  avatar_index: number;
  created_at: string;
}

export interface TokenBalance {
  balance: number;
  tokens_lifetime: number;
}

export interface LedgerEntry {
  ledger_id: number;
  user_id: number;
  amount: number;
  balance_after: number;
  type: "purchase" | "exam_deduct" | "registration" | "monthly_refresh" | "admin_credit" | "admin_deduct" | "refund";
  reference_id: string | null;
  note: string | null;
  created_at: string;
}

export interface ExamCatalogueEntry {
  standard: string;
  term: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  pool_count: number;
}

export interface Question {
  question_id: string;
  question: string;        // ← API returns "question" not "question_text"
  options: Record<string, string>;
  correct_answer?: string;
  tip?: string;
  explanation?: string;
  meta: {
    topic: string;
    subtopic: string;
    cognitive_level: "recall" | "application" | "analysis" | "knowledge" | "comprehension";
  };
}

export interface ExamPackage {
  package_id: string;
  meta: {
    standard: string;
    term: string;
    subject: string;
    difficulty: string;
    topics_covered: string[];
  };
  questions: Question[];
}

export interface ExamSession {
  session_id: number;
  external_session_id: string;
  package: ExamPackage;
  balance_after: number;
}

export interface ActiveSession {
  session_id: number;
  external_session_id: string;
  subject: string;
  standard: string;
  term: string;
  difficulty: string;
  started_at: string;
  checkpoint: { session_id: number; state: CheckpointState; saved_at: string } | null;
}

export interface CheckpointState {
  current_question: number;
  answers: Record<string, string>;
  elapsed_seconds?: number;
}

export interface SubmitAnswer {
  question_id: string;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
  topic: string;
  subtopic?: string;
  cognitive_level: string;
  time_taken_seconds?: number;
}

export interface TopicBreakdown {
  topic: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface SessionResult {
  session_id: number;
  subject: string;
  standard: string;
  term: string;
  difficulty: string;
  score: number;
  total: number;
  percentage: number;
  time_taken_seconds: number;
  state: "active" | "completed" | "cancelled";
  started_at: string;
  completed_at: string | null;
}

export interface SubmitResult {
  session_id: number;
  score: number;
  total: number;
  percentage: number;
  time_taken_seconds: number;
  topic_breakdown: TopicBreakdown[];
}

export interface ResultDetail {
  session: SessionResult;
  answers: {
    question_id: string;
    topic: string;
    selected_answer: string;
    correct_answer: string;
    is_correct: boolean;
    time_taken_seconds: number;
  }[];
  topic_breakdown: TopicBreakdown[];
}

export interface ResultStats {
  total_exams: number;
  average_score: number;
  best_subject: string | null;
  weakest_topic: string | null;
  topic_breakdown: TopicBreakdown[];
}

export interface InsightResult {
  session_id: number;
  insight_text: string;
  model_used: string;
  generated_at: string;
  from_cache: boolean;
}

export interface WeeklyDigest {
  child_id: number;
  iso_week: string;
  insight_text: string;
  generated_at: string;
}

export interface PinStatus {
  pin_set: boolean;
  is_locked: boolean;
  locked_until: string | null;
  seconds_remaining: number;
}

export interface NoeyError {
  code: string;
  message: string;
  data?: { status: number; [key: string]: unknown };
}

export interface DifficultyConfig {
  label: string;
  questions: number;
  minutesPerQuestion: number;
  gemCost: number;
  description: string;
}

export const DIFFICULTY_CONFIG: Record<string, DifficultyConfig> = {
  easy:   { label: "Easy",   questions: 20, minutesPerQuestion: 5, gemCost: 1, description: "Builds confidence with recall focused questions." },
  medium: { label: "Medium", questions: 40, minutesPerQuestion: 4, gemCost: 2, description: "Exam ready question building application skills." },
  hard:   { label: "Hard",   questions: 60, minutesPerQuestion: 3, gemCost: 3, description: "Full level exam questions." },
};

export const SUBJECTS = ["Mathematics", "Language Arts", "Social Studies", "Science"] as const;
export type Subject = (typeof SUBJECTS)[number];

export const STANDARDS = [
  { value: "std_1", label: "Standard 1" },
  { value: "std_2", label: "Standard 2" },
  { value: "std_3", label: "Standard 3" },
  { value: "std_4", label: "Standard 4" },
  { value: "std_5", label: "Standard 5" },
] as const;

export const TERMS = [
  { value: "term_1", label: "Term 1" },
  { value: "term_2", label: "Term 2" },
  { value: "term_3", label: "Term 3" },
] as const;