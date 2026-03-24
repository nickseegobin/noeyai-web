"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Card, CardBody } from "@heroui/react";
import api, { getApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login, refreshUser } = useAuth();
  const router = useRouter();

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { username, password });
      const d = data.data;
      login(d.token, {
        user_id: d.user_id,
        display_name: d.display_name,
        email: d.email,
        role: d.role,
        active_child_id: d.active_child_id,
        token_balance: null,
        children: [],
      });
      // Fetch full profile (children + token_balance) right after login
      await refreshUser();
      router.push("/profile-select");
    } catch (err) {
      const { code } = getApiError(err);
      setError(
        code === "noey_invalid_credentials"
          ? "Incorrect username or password."
          : getApiError(err).message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="font-black text-4xl text-noey-text text-center mb-12">Login</h1>

        <div className="flex flex-col gap-3">
          <Input
            label="Username"
            value={username}
            onValueChange={setUsername}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            isDisabled={loading}
            autoCapitalize="none"
            autoComplete="username"
            variant="flat"
            classNames={{ inputWrapper: "bg-noey-surface rounded-2xl h-14" }}
          />

          <Input
            label="Password"
            type={showPw ? "text" : "password"}
            value={password}
            onValueChange={setPassword}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            isDisabled={loading}
            autoComplete="current-password"
            variant="flat"
            endContent={
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="text-noey-text-muted text-sm font-semibold"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            }
            classNames={{ inputWrapper: "bg-noey-surface rounded-2xl h-14" }}
          />

          <div className="flex justify-center mt-1">
            <a
              href="http://noeyai.local/wp-login.php?action=lostpassword"
              target="_blank"
              rel="noopener noreferrer"
              className="text-noey-text-muted text-sm font-medium"
            >
              Forgot Password?
            </a>
          </div>

          {error && (
            <Card className="bg-red-50 border border-red-200 shadow-none">
              <CardBody className="py-3 px-4">
                <p className="text-red-600 text-sm font-medium text-center">{error}</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          onPress={handleLogin}
          isLoading={loading}
          className="w-full bg-noey-primary text-white font-bold text-base h-14 rounded-2xl"
        >
          Login
        </Button>
        <Button
          as={Link}
          href="/register"
          variant="flat"
          className="w-full bg-noey-surface text-noey-text font-semibold text-base h-14 rounded-2xl"
        >
          Create Account
        </Button>
      </div>
    </div>
  );
}
