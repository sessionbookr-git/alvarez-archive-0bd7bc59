import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useGuitarSubmission } from "@/hooks/useGuitarSubmission";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Check, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SubmitGuitar = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { submit, loading, error } = useGuitarSubmission();

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    serialNumber: "",
    neckBlock: "",
    model: "",
    year: "",
    purchaseLocation: "",
    notes: "",
    email: "",
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/submit");
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking auth
  if (authLoading) {
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
                setFormData({ serialNumber: "", neckBlock: "", model: "", year: "", purchaseLocation: "", notes: "", email: "" }); 
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
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">
              Submit Your Guitar
            </h1>
            <p className="text-muted-foreground">
              Help expand our database by sharing details about your Alvarez guitar.
            </p>
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="model">Model (if known)</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="e.g., 5021"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Production Year (if known)</Label>
                    <Input
                      id="year"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="e.g., 1978"
                      className="mt-1.5"
                    />
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

            {/* Step 3: Additional Info */}
            {step === 3 && (
              <div className="space-y-6 opacity-0 animate-fade-in">
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
                    className="mt-1.5 min-h-[120px]"
                  />
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
