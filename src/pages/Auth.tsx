import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

// Validation schemas
const emailSchema = z.string().trim().email("Please enter a valid email address").max(255, "Email is too long");
const passwordSchema = z.string().min(12, "Password must be at least 12 characters").max(128, "Password is too long");
const inviteCodeSchema = z.string().trim().min(1, "Invite code is required");

// Allowed redirect paths (whitelist for security)
const ALLOWED_REDIRECTS = ["/submit", "/admin", "/encyclopedia", "/serial-lookup", "/identify"];

const sanitizeRedirect = (redirect: string | null): string => {
  if (!redirect) return "/";
  const path = redirect.startsWith("/") ? redirect.split("?")[0] : "/";
  return ALLOWED_REDIRECTS.includes(path) ? redirect : "/";
};

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [inviteCodeError, setInviteCodeError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const redirectTo = sanitizeRedirect(searchParams.get("redirect"));

  useEffect(() => {
    if (user) {
      navigate(redirectTo);
    }
  }, [user, navigate, redirectTo]);

  const validateSignInForm = (): boolean => {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setEmailError(emailResult.error.errors[0].message);
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    }

    return valid;
  };

  const validateSignUpForm = (): boolean => {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setInviteCodeError("");

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setEmailError(emailResult.error.errors[0].message);
      valid = false;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setPasswordError(passwordResult.error.errors[0].message);
      valid = false;
    }

    const inviteResult = inviteCodeSchema.safeParse(inviteCode);
    if (!inviteResult.success) {
      setInviteCodeError(inviteResult.error.errors[0].message);
      valid = false;
    }

    return valid;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignInForm()) return;
    
    setIsLoading(true);
    
    const { error } = await signIn(email.trim(), password);
    
    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have signed in successfully.",
      });
      navigate(redirectTo);
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignUpForm()) return;
    
    setIsLoading(true);

    // Validate invite code exists and is unused
    const { data: codeData, error: codeError } = await supabase
      .from("invite_codes")
      .select("id, code")
      .eq("code", inviteCode.trim())
      .is("used_at", null)
      .maybeSingle();

    if (codeError || !codeData) {
      setInviteCodeError("Invalid or already used invite code");
      setIsLoading(false);
      return;
    }
    
    const { error } = await signUp(email.trim(), password);
    
    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Mark the invite code as used
    await supabase
      .from("invite_codes")
      .update({ 
        used_at: new Date().toISOString(), 
        used_by_email: email.trim() 
      })
      .eq("id", codeData.id);

    toast({
      title: "Account created!",
      description: "You can now sign in with your credentials.",
    });
    
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setEmailError(emailResult.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setResetEmailSent(true);
    }

    setIsLoading(false);
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>
                {resetEmailSent
                  ? "Check your email for the reset link"
                  : "Enter your email to receive a password reset link"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resetEmailSent ? (
                <div className="space-y-4 text-center">
                  <p className="text-muted-foreground">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <Button onClick={() => { setShowForgotPassword(false); setResetEmailSent(false); }} className="w-full">
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      required
                    />
                    {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to Sign In
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>
              {redirectTo === "/submit" 
                ? "Sign in to submit your guitar to the archive" 
                : "Sign in to access your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      required
                      aria-invalid={!!emailError}
                    />
                    {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError("");
                      }}
                      required
                      aria-invalid={!!passwordError}
                    />
                    {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot your password?
                  </button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-invite">Invite Code</Label>
                    <Input
                      id="signup-invite"
                      type="text"
                      placeholder="Enter your invite code"
                      value={inviteCode}
                      onChange={(e) => {
                        setInviteCode(e.target.value);
                        setInviteCodeError("");
                      }}
                      required
                      aria-invalid={!!inviteCodeError}
                    />
                    {inviteCodeError && <p className="text-sm text-destructive">{inviteCodeError}</p>}
                    <p className="text-xs text-muted-foreground">Registration is invite-only</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      required
                      aria-invalid={!!emailError}
                    />
                    {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password (min. 12 characters)</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError("");
                      }}
                      required
                      minLength={12}
                      aria-invalid={!!passwordError}
                    />
                    {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
