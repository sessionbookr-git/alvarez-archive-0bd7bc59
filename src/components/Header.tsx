import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import alvarezLogo from "@/assets/alvarez-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import HelpDrawer from "@/components/HelpDrawer";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/lookup", label: "Serial Lookup" },
    { to: "/encyclopedia", label: "Encyclopedia" },
    { to: "/identify", label: "Identify" },
    { to: "/community", label: "Community" },
    { to: "/submit", label: "Submit" },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-wide flex h-16 md:h-20 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 md:gap-4" onClick={closeMobileMenu}>
          <img 
            src={alvarezLogo} 
            alt="Alvarez Guitars" 
            className="h-14 md:h-24 w-auto"
          />
          <span className="hidden sm:inline-block text-sm font-medium text-muted-foreground">
            Legacy Archive
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.to}
              to={link.to} 
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
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

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className="text-base font-medium text-foreground/80 transition-colors hover:text-foreground py-2"
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border flex items-center gap-4">
              <HelpDrawer />
              {user && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    signOut();
                    closeMobileMenu();
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
