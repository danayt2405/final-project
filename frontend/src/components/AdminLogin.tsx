import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Shield, Lock, ArrowLeft, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { login } from "../services/api";
import type { Language, Theme } from "../types";
import insaLogo from "../assets/logo.png";

interface AdminLoginProps {
  language: Language;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onLoginSuccess: () => void;
  onBack: () => void;
}

export function AdminLogin({
  language,
  theme,
  setTheme,
  onLoginSuccess,
  onBack,
}: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    title: language === "am" ? "የአስተዳዳሪ ግባ" : "Admin Login",
    subtitle: language === "am" ? "ለመቀጠል ይግቡ" : "Sign in to continue",
    username: language === "am" ? "የተጠቃሚ ስም" : "Username",
    password: language === "am" ? "የይለፍ ቃል" : "Password",
    signIn: language === "am" ? "ግባ" : "Sign In",
    back: language === "am" ? "ተመለስ" : "Back",
    enterUsername: language === "am" ? "የተጠቃሚ ስም ያስገቡ" : "Enter username",
    enterPassword: language === "am" ? "የይለፍ ቃል ያስገቡ" : "Enter password",
    loginSuccess:
      language === "am" ? "በተሳካ ሁኔታ ገብተዋል" : "Successfully logged in",
    loginFailed:
      language === "am"
        ? "ግባ አልተሳካም የተጠቃሚና የይለፍ ቃል ያረጋግጡ"
        : "Login failed. Please check your credentials.",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error(
        language === "am" ? "ሁሉንም መስኮች ይሙሉ" : "Please fill all fields"
      );
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(username, password);

      console.log("LOGIN RESPONSE USER:", user); // DEBUG

      toast.success(t.loginSuccess);

      onLoginSuccess(user); // ✅ PASS USER
    } catch (error) {
      console.error("Login error:", error);
      toast.error(t.loginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="hover:bg-blue-50 dark:hover:bg-slate-700"
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Back button */}
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="hover:bg-blue-50 dark:hover:bg-slate-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.back}
        </Button>
      </div>

      {/* Login Card */}
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-md p-4">
            <img src={insaLogo} alt="INSA Logo" className="w-full h-full" />
          </div>

          <div>
            <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
              {t.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">{t.subtitle}</p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label>{t.username}</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                placeholder={t.enterUsername}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>{t.password}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder={t.enterPassword}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              {isLoading
                ? language === "am"
                  ? "በመግባት ላይ..."
                  : "Signing in..."
                : t.signIn}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
