import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container-wide py-12">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Alvarez Legacy Archive ("Service"), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            The Alvarez Legacy Archive is a community-driven database for identifying and cataloging Alvarez guitars. 
            Users can look up serial numbers, browse model information, and submit their own guitar data for inclusion in the archive.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            Registration is by invitation only. You are responsible for maintaining the confidentiality of your account credentials 
            and for all activities that occur under your account. You must provide accurate information when creating an account.
          </p>

          <h2>4. User Submissions</h2>
          <p>
            By submitting guitar information and photos to the Service, you:
          </p>
          <ul>
            <li>Confirm that you have the right to share the submitted content</li>
            <li>Grant us a non-exclusive, royalty-free license to use, display, and distribute the content</li>
            <li>Understand that submissions are subject to review and may be rejected</li>
            <li>Agree not to submit false, misleading, or inappropriate content</li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding user submissions) are the property of the Alvarez Legacy Archive 
            and are protected by copyright and other intellectual property laws. "Alvarez" is a trademark of St. Louis Music; 
            this site is not affiliated with or endorsed by Alvarez Guitars or St. Louis Music.
          </p>

          <h2>6. Prohibited Uses</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Submit spam, malware, or harmful content</li>
            <li>Scrape or harvest data from the Service for commercial purposes</li>
            <li>Impersonate others or provide false information</li>
          </ul>

          <h2>7. Disclaimer of Warranties</h2>
          <p>
            The Service is provided "as is" without warranties of any kind. Information in the database is community-contributed 
            and may contain errors. We do not guarantee the accuracy of guitar identification, dating, or valuation information.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            The Alvarez Legacy Archive shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
            resulting from your use of the Service.
          </p>

          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes 
            acceptance of the new terms.
          </p>

          <h2>10. Contact</h2>
          <p>
            For questions about these Terms of Service, please contact us through the site administrator.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;