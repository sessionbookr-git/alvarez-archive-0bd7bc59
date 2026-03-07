import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import alvarezBlackLogo from "@/assets/alvarez-black-logo.png";

const nameSchema = z.string().trim().min(1, "Name is required").max(100);
const emailSchema = z.string().trim().email("Please enter a valid email").max(255);

const RequestAccess = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    const nameResult = nameSchema.safeParse(name);
    if (!nameResult.success) errs.name = nameResult.error.errors[0].message;

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) errs.email = emailResult.error.errors[0].message;

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setErrors({});

    const { error } = await supabase.from("access_requests").insert({
      name: name.trim(),
      email: email.trim(),
      message: message.trim() || null,
    });

    if (error) {
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <img
              src={alvarezBlackLogo}
              alt="Alvarez Guitars"
              className="w-40 mx-auto h-auto mb-4"
            />
            {submitted ? (
              <>
                <div className="mx-auto mb-2">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-xl">You're on the list!</CardTitle>
                <CardDescription>
                  Thanks for your interest in the Alvarez Legacy Archive. We'll be in touch when your access is ready.
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-xl">Request Early Access</CardTitle>
                <CardDescription>
                  The Alvarez Legacy Archive is currently in private beta. Enter your details below and we'll send you an invite when a spot opens up.
                </CardDescription>
              </>
            )}
          </CardHeader>
          {!submitted && (
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ra-name">Name</Label>
                  <Input
                    id="ra-name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: "" })); }}
                    placeholder="Your name"
                    required
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ra-email">Email</Label>
                  <Input
                    id="ra-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: "" })); }}
                    placeholder="you@example.com"
                    required
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ra-message">Tell us about your Alvarez guitar (optional)</Label>
                  <Textarea
                    id="ra-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="I have a 1970s Alvarez 5014 that I'd love to learn more about…"
                    rows={3}
                    maxLength={1000}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Submitting…" : "Request Access"}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default RequestAccess;
