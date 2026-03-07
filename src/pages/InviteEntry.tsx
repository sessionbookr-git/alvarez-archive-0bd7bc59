import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import alvarezBlackLogo from "@/assets/alvarez-black-logo.png";

const InviteEntry = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed) {
      navigate(`/invite/${encodeURIComponent(trimmed)}`);
    }
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
            <CardTitle className="text-xl">Enter Your Invite Code</CardTitle>
            <CardDescription>
              Paste or type the invite code you received to create your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-code">Invite Code</Label>
                <Input
                  id="invite-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX"
                  required
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <Button type="submit" className="w-full" disabled={!code.trim()}>
                Continue
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Don't have a code?{" "}
              <Link to="/request-access" className="text-primary hover:underline">
                Request early access
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default InviteEntry;
