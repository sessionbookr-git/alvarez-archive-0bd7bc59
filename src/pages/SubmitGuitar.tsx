import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useGuitarSubmission } from "@/hooks/useGuitarSubmission";
import { useAuth } from "@/hooks/useAuth";
import { useSubmissionRateLimit } from "@/hooks/useSubmissionRateLimit";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Check, Loader2, AlertCircle, FileText, BookOpen, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

// Helper to format features from Identify page into notes
const formatFeaturesAsNotes = (features: Record<string, string>): string => {
  if (!features || Object.keys(features).length === 0) return "";
  
  const lines = Object.entries(features).map(([category, value]) => {
    const label = category.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return `${label}: ${value}`;
  });
  
  return `Identified features:\n${lines.join("\n")}`;
};

const SubmitGuitar = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { submit, loading, error } = useGuitarSubmission();
  const { canSubmit, remainingSubmissions, maxSubmissions, isLoading: rateLimitLoading } = useSubmissionRateLimit();
  const { track } = useAnalytics();

  // Check if we came from Identify page with pre-filled features
  const locationState = location.state as { fromIdentify?: boolean; features?: Record<string, string> } | null;
  const prefilledFeatures = locationState?.fromIdentify ? locationState.features : null;

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    serialNumber: "",
    neckBlock: "",
    model: "",
    year: "",
    bodyStyle: "",
    electronics: "",
    topWood: "",
    backSidesWood: "",
    finishType: "",
    countryOfOrigin: "",
    purchaseLocation: "",
    notes: prefilledFeatures ? formatFeaturesAsNotes(prefilledFeatures) : "",
    email: "",
    story: "",
    displayName: "",
    isStoryPublic: false,
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/submit");
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking auth or rate limit
  if (authLoading || rateLimitLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  // Don't render if not authenticated (redirect will happen)
  if (!user) {
    return null;
  }

  // Rate limit exceeded
  if (!canSubmit) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container-wide max-w-2xl text-center">
            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-amber-600" />
            </div>
            <h1 className="text-3xl font-semibold mb-4">Submission Limit Reached</h1>
            <p className="text-muted-foreground mb-6">
              You have {maxSubmissions} pending submissions awaiting review. 
              Once some are approved or rejected, you can submit more guitars.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link to="/my-submissions">View My Submissions</Link>
              </Button>
              <Button asChild>
                <Link to="/">Return Home</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setImages([...images, ...newFiles]);
      
      // Create previews
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serialNumber.trim()) {
      toast({
        title: "Serial number required",
        description: "Please enter your guitar's serial number.",
        variant: "destructive",
      });
      return;
    }

    const result = await submit(formData, images);
    
    if (result.success) {
      setSubmitted(true);
      track('submission_completed', { serial: formData.serialNumber });
      toast({
        title: "Submission received!",
        description: "Your guitar will be reviewed and added to the archive.",
      });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container-wide max-w-2xl text-center">
            <div className="w-20 h-20 bg-confidence-high/20 rounded-full flex items-center justify-center mx-auto mb-6 opacity-0 animate-fade-in">
              <Check className="h-10 w-10 text-confidence-high" />
            </div>
            <h1 className="text-3xl font-semibold mb-4 opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
              Thank You!
            </h1>
            <p className="text-muted-foreground mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
              Your submission has been received and will be reviewed by our team. 
              Once verified, it will be added to the archive to help other collectors.
            </p>
            <Button 
              variant="outline" 
              onClick={() => { 
                setSubmitted(false); 
                setStep(1); 
                setImages([]); 
                setImagePreviews([]);
                setFormData({ serialNumber: "", neckBlock: "", model: "", year: "", bodyStyle: "", electronics: "", topWood: "", backSidesWood: "", finishType: "", countryOfOrigin: "", purchaseLocation: "", notes: "", email: "", story: "", displayName: "", isStoryPublic: false }); 
              }} 
              className="opacity-0 animate-fade-in" 
              style={{ animationDelay: "300ms" }}
            >
              Submit Another Guitar
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container-wide max-w-2xl">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">
              Submit Your Guitar
            </h1>
            <p className="text-muted-foreground mb-4">
              Help expand our database by sharing details about your Alvarez guitar.
            </p>
            <Button variant="link" asChild className="gap-2">
              <Link to="/submit-guidelines">
                <FileText className="h-4 w-4" />
                Read submission guidelines
              </Link>
            </Button>
            {remainingSubmissions < maxSubmissions && (
              <p className="text-sm text-amber-600 mt-2">
                {remainingSubmissions} of {maxSubmissions} submissions remaining
              </p>
            )}
            {prefilledFeatures && (
              <div className="mt-4 p-3 bg-confidence-high/10 border border-confidence-high/20 rounded-lg inline-block">
                <p className="text-sm text-confidence-high">
                  ✓ Features from identification quiz pre-filled in notes
                </p>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
                }`}>
                  {step > s ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-0.5 mx-1 ${step > s ? "bg-foreground" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Photos */}
            {step === 1 && (
              <div className="space-y-6 opacity-0 animate-fade-in">
                <div>
                  <Label className="text-base font-semibold">Upload Photos</Label>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Add photos of your guitar's headstock, label, full body, and any unique features.
                  </p>

                  {/* Upload Area */}
                  <label className="block border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-foreground/30 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                  </label>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square bg-secondary rounded-md overflow-hidden">
                          <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={() => setStep(2)}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <div className="space-y-6 opacity-0 animate-fade-in">
                {/* Identification */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center">1</span>
                    Identification
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="serial">Serial Number *</Label>
                      <Input
                        id="serial"
                        value={formData.serialNumber}
                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                        placeholder="e.g., 45123"
                        className="mt-1.5"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="neckBlock">Neck Block Number</Label>
                      <Input
                        id="neckBlock"
                        value={formData.neckBlock}
                        onChange={(e) => setFormData({ ...formData, neckBlock: e.target.value })}
                        placeholder="Optional"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div>
                      <Label htmlFor="model">Model Name/Number</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder="e.g., 5054, DY77, Artist Series"
                        className="mt-1.5"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Check the label or headstock</p>
                    </div>
                    <div>
                      <Label htmlFor="year">Production Year</Label>
                      <Input
                        id="year"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        placeholder="e.g., 1978"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center">2</span>
                    Specifications
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">Share what you know about your guitar's specs—any details help!</p>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="bodyStyle">Body Style</Label>
                      <Input
                        id="bodyStyle"
                        value={formData.bodyStyle}
                        onChange={(e) => setFormData({ ...formData, bodyStyle: e.target.value })}
                        placeholder="e.g., Dreadnought, Concert, Jumbo"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="electronics">Electronics</Label>
                      <Input
                        id="electronics"
                        value={formData.electronics}
                        onChange={(e) => setFormData({ ...formData, electronics: e.target.value })}
                        placeholder="e.g., Acoustic-Electric, None"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div>
                      <Label htmlFor="topWood">Top Wood</Label>
                      <Input
                        id="topWood"
                        value={formData.topWood}
                        onChange={(e) => setFormData({ ...formData, topWood: e.target.value })}
                        placeholder="e.g., Solid Spruce, Cedar"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="backSidesWood">Back & Sides Wood</Label>
                      <Input
                        id="backSidesWood"
                        value={formData.backSidesWood}
                        onChange={(e) => setFormData({ ...formData, backSidesWood: e.target.value })}
                        placeholder="e.g., Rosewood, Mahogany"
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div>
                      <Label htmlFor="finishType">Finish</Label>
                      <Input
                        id="finishType"
                        value={formData.finishType}
                        onChange={(e) => setFormData({ ...formData, finishType: e.target.value })}
                        placeholder="e.g., Natural, Sunburst, Gloss"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="countryOfOrigin">Country of Origin</Label>
                      <Input
                        id="countryOfOrigin"
                        value={formData.countryOfOrigin}
                        onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                        placeholder="e.g., Japan, USA, Korea"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="button" onClick={() => setStep(3)}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Story & Additional Info */}
            {step === 3 && (
              <div className="space-y-6 opacity-0 animate-fade-in">
                {/* Story Section */}
                <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-lg">
                  <div className="flex items-start gap-3 mb-4">
                    <BookOpen className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-900 dark:text-amber-100">Share Your Guitar's Story</h3>
                      <p className="text-sm text-amber-700/80 dark:text-amber-200/70">
                        Help bring life to the archive! Share the history and memories behind your guitar.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="story" className="text-amber-900 dark:text-amber-100">Your Story</Label>
                      <Textarea
                        id="story"
                        value={formData.story}
                        onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                        placeholder="How did you acquire this guitar? What memories do you have with it? Is there any interesting history you know about it?"
                        className="mt-1.5 min-h-[140px] bg-background"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="displayName" className="text-amber-900 dark:text-amber-100">Your Name (for attribution)</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        placeholder="e.g., John M. from Texas"
                        className="mt-1.5 bg-background"
                      />
                      <p className="text-xs text-muted-foreground mt-1">This will appear alongside your story if you choose to share publicly.</p>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        {formData.isStoryPublic ? (
                          <Eye className="h-4 w-4 text-confidence-high" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium">Share story publicly</p>
                          <p className="text-xs text-muted-foreground">
                            {formData.isStoryPublic 
                              ? "Your story will appear in the Community section" 
                              : "Your story will only be visible to admins"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.isStoryPublic}
                        onCheckedChange={(checked) => setFormData({ ...formData, isStoryPublic: checked })}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact & Notes */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Your Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="For updates when your submission is approved"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="purchase">Purchase Details</Label>
                    <Input
                      id="purchase"
                      value={formData.purchaseLocation}
                      onChange={(e) => setFormData({ ...formData, purchaseLocation: e.target.value })}
                      placeholder="Where and when did you acquire this guitar?"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any other details that might help with identification..."
                      className="mt-1.5 min-h-[80px]"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h3 className="font-semibold mb-3">Submission Preview</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex">
                      <dt className="text-muted-foreground w-32">Photos:</dt>
                      <dd>{images.length} uploaded</dd>
                    </div>
                    {formData.serialNumber && (
                      <div className="flex">
                        <dt className="text-muted-foreground w-32">Serial:</dt>
                        <dd>{formData.serialNumber}</dd>
                      </div>
                    )}
                    {formData.model && (
                      <div className="flex">
                        <dt className="text-muted-foreground w-32">Model:</dt>
                        <dd>{formData.model}</dd>
                      </div>
                    )}
                    {formData.year && (
                      <div className="flex">
                        <dt className="text-muted-foreground w-32">Year:</dt>
                        <dd>{formData.year}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Guitar"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SubmitGuitar;
