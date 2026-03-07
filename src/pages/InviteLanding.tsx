import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookOpen, Users, Guitar, Search, Loader2, ShieldX } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";
import alvarezBlackLogo from "@/assets/alvarez-black-logo.png";

const emailSchema = z.string().trim().email("Please enter a valid email address").max(255);
const passwordSchema = z.string().min(12, "Password must be at least 12 characters").max(128);

const InviteLanding = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
      return;
    }
    validateCode();
  }, [code, user]);

  const validateCode = async () => {
    if (!code) {
      setValid(false);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("invite_codes")
      .select("id, used_at, notes")
      .eq("code", code.toUpperCase())
      .maybeSingle();

    if (data && !data.used_at) {
      setValid(true);
      // If notes has a name stored, use it
      if (data.notes) setName(data.notes);
    } else {
      setValid(false);
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setEmailError(emailResult.error.errors[0].message);
      return;
    }
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setPasswordError(passwordResult.error.errors[0].message);
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // Redeem the invite code
    await supabase.rpc("validate_and_redeem_invite_code", {
      _code: code!.toUpperCase(),
      _email: email.trim(),
    });

    toast({
      title: "Welcome to the Archive!",
      description: "Your account has been created. Check your email to verify, then sign in.",
    });

    navigate("/auth");
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <Card className="w-full max-w-md mx-4 text-center">
            <CardHeader>
              <div className="mx-auto mb-4">
                <ShieldX className="h-12 w-12 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl">This invite link is no longer valid</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This invite code may have already been used or has expired.
              </p>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link to="/request-access">Request Early Access</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Already have an account? Sign in</Link>
                </Button>
              </div>
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
      <main className="flex-1 py-12">
        <div className="container-wide max-w-2xl mx-auto px-4">
          {/* Welcome section */}
          <div className="text-center mb-10">
            <img
              src={alvarezBlackLogo}
              alt="Alvarez Guitars"
              className="w-full max-w-xs mx-auto h-auto mb-6"
            />
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">
              You've been invited to the Legacy Archive
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              A community-driven encyclopedia for vintage and legacy Alvarez guitars.
              Browse models, submit your guitar, share your story, and help identify instruments.
            </p>
          </div>

          {/* What you can do */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {[
              { icon: BookOpen, label: "Browse the Encyclopedia", desc: "Explore the full catalog of Alvarez models" },
              { icon: Guitar, label: "Submit Your Guitar", desc: "Add your instrument to the archive" },
              { icon: Users, label: "Share Your Story", desc: "Connect with fellow Alvarez enthusiasts" },
              { icon: Search, label: "Identify Models", desc: "Use expert tools to identify your guitar" },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl border border-border bg-card">
                <item.icon className="h-5 w-5 text-primary mb-2" />
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Sign up form */}
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Create Your Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-name">Name</Label>
                  <Input
                    id="invite-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                    placeholder="you@example.com"
                    required
                    aria-invalid={!!emailError}
                  />
                  {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-password">Password (min. 12 characters)</Label>
                  <Input
                    id="invite-password"
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                    required
                    minLength={12}
                    aria-invalid={!!passwordError}
                  />
                  {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Creating account…" : "Join the Archive"}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{" "}
                <Link to="/auth" className="text-primary hover:underline">Sign in</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InviteLanding;
