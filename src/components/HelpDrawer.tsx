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
          <DrawerTitle>How to Use the Alvarez Guitar Archive</DrawerTitle>
          <DrawerDescription>
            Your comprehensive guide to identifying, researching, and documenting Alvarez guitars
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
              <p className="text-sm text-muted-foreground">
                You can also search by <strong>neck block number</strong> if your guitar has one 
                stamped inside the body near the neck joint.
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
                decade, country of manufacture, body shape, or search by model name. Each entry 
                includes production years, specifications, photos, and key identifying features.
              </p>
              <p className="text-sm text-muted-foreground">
                Click on any model to view its full detail page with photos, linked features, 
                and related serial number patterns.
              </p>
            </section>

            {/* Identify */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Identify by Features</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Don't have a serial number? Use our step-by-step visual identification tool to 
                narrow down your guitar's era and model. Answer questions about physical features 
                like body shape, tuner style, truss rod location, label type, fingerboard material, 
                and bridge design.
              </p>
              <p className="text-sm text-muted-foreground">
                The tool will show you matching models ranked by how well they fit your selections, 
                helping you identify even unlabeled or mystery guitars.
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
                <strong>Required photos:</strong> Headstock front, soundhole label, and full front view. 
                Additional photos of the back, neck heel, and bridge are helpful for verification.
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
                <li>Track your submissions in "My Submissions"</li>
                <li>Edit pending submissions before they're reviewed</li>
              </ul>
            </section>

            {/* Tips */}
            <section className="space-y-2 border-t pt-4">
              <h3 className="font-semibold">Quick Tips</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Serial numbers on Alvarez guitars are typically 4-8 digits</li>
                <li>Japanese-made guitars (pre-1990s) often have the most reliable serial patterns</li>
                <li>The label inside the soundhole can reveal era and origin</li>
                <li>Neck block numbers are often stamped inside the body near the neck joint</li>
                <li>When in doubt, compare your guitar to approved examples in the archive</li>
              </ul>
            </section>

            {/* About */}
            <section className="space-y-2 border-t pt-4">
              <h3 className="font-semibold">About This Archive</h3>
              <p className="text-sm text-muted-foreground">
                The Alvarez Guitar Archive is a community-driven reference for Alvarez acoustic 
                guitars. Our goal is to document the rich history of Alvarez instruments, from 
                the early Japanese-made models through to modern production. All data is 
                contributed and verified by guitar enthusiasts and collectors.
              </p>
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
