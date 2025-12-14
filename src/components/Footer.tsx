import { Link } from "react-router-dom";
import alvarezLogo from "@/assets/alvarez-logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container-wide py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img 
                src={alvarezLogo} 
                alt="Alvarez Guitars" 
                className="h-6 w-auto opacity-70"
              />
              <span className="text-sm font-medium text-muted-foreground">
                Legacy Archive
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              A community-driven database documenting the rich history of Alvarez guitars. 
              Helping collectors and enthusiasts identify and learn about vintage instruments since 2024.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Tools</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/lookup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Serial Lookup
                </Link>
              </li>
              <li>
                <Link to="/identify" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Identify by Features
                </Link>
              </li>
              <li>
                <Link to="/encyclopedia" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Model Encyclopedia
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Community</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/submit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Submit Your Guitar
                </Link>
              </li>
              <li>
                <Link to="/timeline" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  History Timeline
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Alvarez Legacy Archive. Not affiliated with Alvarez Guitars or St. Louis Music.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
