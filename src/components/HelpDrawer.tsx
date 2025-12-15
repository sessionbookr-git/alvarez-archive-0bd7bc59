import { HelpCircle, Search, BookOpen, Upload, UserPlus, Key } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const HelpDrawer = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help Guide</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>How to Use Alvarez Master Gold</DrawerTitle>
          <DrawerDescription>
            Your guide to identifying and documenting vintage Alvarez guitars
          </DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="px-4 pb-4 max-h-[60vh]">
          <div className="space-y-6">
            {/* Serial Lookup */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Serial Number Lookup</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter your guitar's serial number (found on the headstock or inside the soundhole) 
                to get an estimated production year and possible model matches. Our database uses 
                known serial patterns to provide confidence-rated results.
              </p>
            </section>

            {/* Encyclopedia */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Model Encyclopedia</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Browse our catalog of documented Alvarez models spanning 55+ years. Filter by 
                decade, country of manufacture, or search by model name. Each entry includes 
                production years, specifications, and key identifying features.
              </p>
            </section>

            {/* Identify */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Visual Identification</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Don't have a serial number? Use our visual identification guide to narrow down 
                your guitar's era based on physical features like tuner style, truss rod location, 
                label type, and bridge design. Each feature is linked to specific production periods.
              </p>
            </section>

            {/* Submit */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Submit Your Guitar</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Help grow our archive by submitting your own Alvarez guitar. Include clear photos 
                of the headstock, label, body, and any unique features. Submissions are reviewed 
                by our team before being added to the public database.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> Check our submission guidelines for photo tips and what 
                information to include.
              </p>
            </section>

            {/* Sign Up */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Creating an Account</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                To submit guitars, you'll need to create an account. Registration requires an 
                <strong> invite code</strong> — this helps us maintain data quality and prevent 
                spam. Contact an existing member or admin to request a code.
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-2">
                <li>Password must be at least 12 characters</li>
                <li>Each invite code can only be used once</li>
                <li>You can track your submissions in "My Submissions"</li>
              </ul>
            </section>

            {/* Tips */}
            <section className="space-y-2 border-t pt-4">
              <h3 className="font-semibold">Quick Tips</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Serial numbers on Alvarez guitars are typically 4-8 digits</li>
                <li>Japanese-made guitars (pre-1990s) often have the most reliable serial patterns</li>
                <li>The label inside the soundhole can reveal era and origin</li>
                <li>When in doubt, compare your guitar to approved examples in the archive</li>
              </ul>
            </section>
          </div>
        </ScrollArea>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default HelpDrawer;
