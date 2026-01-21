import { HelpCircle, BookOpen, Upload, UserPlus, Users } from "lucide-react";
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
          <DrawerTitle>How to Use the Alvarez Legacy Archive</DrawerTitle>
          <DrawerDescription>
            A community-driven encyclopedia celebrating the history of Alvarez guitars
          </DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="px-4 pb-4 max-h-[60vh]">
          <div className="space-y-6">
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
                Click on any model to view its full detail page with photos and specifications.
              </p>
            </section>

            {/* Community */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Community Stories</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Discover the stories behind the guitars. See what fellow collectors and enthusiasts 
                have shared about their Alvarez instruments. Each story includes photos, specifications, 
                and the unique journey of how the guitar came to its owner.
              </p>
              <p className="text-sm text-muted-foreground">
                Like stories you enjoy, mark guitars you own, and join the conversation in the comments.
              </p>
            </section>

            {/* Submit */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Submit Your Guitar</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Share your own Alvarez guitar with the community! Include clear photos and tell the 
                story of your instrument. Submissions are reviewed by our team before being added 
                to the public archive.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Recommended photos:</strong> Headstock front, soundhole label, and full front view. 
                Additional photos of the back, neck heel, and bridge help tell the complete story.
              </p>
            </section>

            {/* Sign Up */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Creating an Account</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                To submit guitars and interact with the community, you'll need to create an account. 
                Registration requires an <strong>invite code</strong> — this helps us maintain quality 
                and prevent spam. Contact an existing member or admin to request a code.
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
                <li>The label inside the soundhole can reveal era and origin</li>
                <li>Japanese-made guitars (pre-1990s) are particularly collectible</li>
                <li>Sharing your guitar's story helps build our community knowledge</li>
                <li>Compare your guitar to examples in the encyclopedia</li>
              </ul>
            </section>

            {/* About */}
            <section className="space-y-2 border-t pt-4">
              <h3 className="font-semibold">About This Archive</h3>
              <p className="text-sm text-muted-foreground">
                The Alvarez Legacy Archive is a community-driven encyclopedia for Alvarez acoustic 
                guitars. Our goal is to celebrate and document the rich history of Alvarez instruments, 
                from the early Japanese-made models through to modern production. All content is 
                contributed and curated by guitar enthusiasts and collectors.
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
