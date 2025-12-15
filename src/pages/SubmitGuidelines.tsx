import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Camera, CheckCircle, XCircle, FileText, ArrowRight } from "lucide-react";

const SubmitGuidelines = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Submission Guidelines</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Help us build the most comprehensive Alvarez guitar database. Follow these guidelines to ensure your submission is approved quickly.
          </p>

          {/* Photo Requirements */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Photo Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Clear, well-lit photos are essential for accurate identification. Please include:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Required Photos</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                      <span><strong>Headstock front</strong> - Shows tuners and logo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                      <span><strong>Serial number close-up</strong> - Must be clearly readable</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                      <span><strong>Interior label</strong> - Look inside the soundhole</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Helpful Extras</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                      <span>Full body front view</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                      <span>Back of guitar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                      <span>Neck block stamp (if accessible)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                      <span>Bridge and saddle detail</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Photo Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use natural lighting when possible</li>
                  <li>• Avoid flash glare on serial numbers</li>
                  <li>• Keep the camera steady - no blurry shots</li>
                  <li>• Clean dust off the guitar first</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Good vs Poor Examples */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Good vs Poor Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900 rounded-lg p-4">
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Good Submission
                  </h4>
                  <ul className="text-sm space-y-2">
                    <li>✓ Serial number clearly visible: "45123"</li>
                    <li>✓ All required photos included</li>
                    <li>✓ Notes mention original owner history</li>
                    <li>✓ Model number provided if known</li>
                    <li>✓ Modifications clearly disclosed</li>
                  </ul>
                </div>
                
                <div className="border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900 rounded-lg p-4">
                  <h4 className="font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Poor Submission
                  </h4>
                  <ul className="text-sm space-y-2">
                    <li>✗ Blurry serial number photo</li>
                    <li>✗ Missing interior label shot</li>
                    <li>✗ No description or context</li>
                    <li>✗ Low-resolution images</li>
                    <li>✗ Photos of wrong guitar</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What to Include */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Information to Include
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Required Information</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• <strong>Serial number</strong> - Exactly as shown on the guitar</li>
                  <li>• <strong>At least one photo</strong> - More is better</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Helpful Information</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Model name/number if you know it</li>
                  <li>• Approximate year of manufacture</li>
                  <li>• Where and when you purchased it</li>
                  <li>• Any modifications or repairs</li>
                  <li>• Original case, paperwork, or accessories</li>
                  <li>• Previous ownership history if known</li>
                </ul>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Modifications</h4>
                <p className="text-sm text-muted-foreground">
                  Please disclose any modifications to your guitar (replaced tuners, refinished, 
                  electronics changes, etc.). This helps us maintain accurate records and doesn't 
                  affect your submission approval.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limiting Notice */}
          <Card className="mb-8 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
            <CardContent className="pt-6">
              <p className="text-sm">
                <strong>Note:</strong> To maintain quality, each user may have up to 5 pending 
                submissions at a time. Once your submissions are reviewed, you can submit more.
              </p>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <Button asChild size="lg">
              <Link to="/submit" className="gap-2">
                Submit Your Guitar
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubmitGuidelines;
