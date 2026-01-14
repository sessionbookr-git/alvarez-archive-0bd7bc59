import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import alvarezLogo from "@/assets/alvarez-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import HelpDrawer from "@/components/HelpDrawer";

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-wide flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-4">
          <img 
            src={alvarezLogo} 
            alt="Alvarez Guitars" 
            className="h-24 w-auto"
          />
          <span className="hidden sm:inline-block text-sm font-medium text-muted-foreground">
            Legacy Archive
          </span>
        </Link>

        <nav className="flex items-center gap-8">
          <Link 
            to="/lookup" 
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Serial Lookup
          </Link>
          <Link 
            to="/encyclopedia" 
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Encyclopedia
          </Link>
          <Link 
            to="/identify" 
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Identify
          </Link>
          <Link 
            to="/community" 
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Community
          </Link>
          <Link 
            to="/submit" 
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Submit
          </Link>
          <HelpDrawer />
          {user && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
