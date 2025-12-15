import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SerialSearchProps {
  variant?: "hero" | "compact";
}

const SerialSearch = ({ variant = "compact" }: SerialSearchProps) => {
  const [serialNumber, setSerialNumber] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (serialNumber.trim()) {
      navigate(`/lookup?serial=${encodeURIComponent(serialNumber.trim())}`);
    }
  };

  if (variant === "hero") {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter serial number..."
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="h-14 pl-12 text-lg bg-background border-border focus-visible:ring-accent"
            />
          </div>
          <Button 
            type="submit" 
            size="lg"
            className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Look Up
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-3 text-left lg:text-left">
          Enter your guitar's serial number to identify its year and model
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Serial number..."
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          className="pl-9"
        />
      </div>
      <Button type="submit" size="sm">
        Search
      </Button>
    </form>
  );
};

export default SerialSearch;
