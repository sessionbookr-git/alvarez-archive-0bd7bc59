import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container-wide py-12">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Information We Collect</h2>
          
          <h3>Account Information</h3>
          <p>
            When you create an account, we collect your email address and password (stored securely using industry-standard encryption).
          </p>

          <h3>Submission Data</h3>
          <p>
            When you submit a guitar to the archive, we collect:
          </p>
          <ul>
            <li>Serial number and identifying details</li>
            <li>Photos you upload</li>
            <li>Notes and descriptions you provide</li>
            <li>Your email address (linked to the submission)</li>
          </ul>

          <h3>Usage Data</h3>
          <p>
            We may collect anonymous usage data including pages visited, search queries, and browser information 
            to improve the Service.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul>
            <li>Provide and maintain the Service</li>
            <li>Process and display your guitar submissions</li>
            <li>Communicate with you about your account or submissions</li>
            <li>Improve and optimize the Service</li>
            <li>Prevent abuse and maintain security</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>
            <strong>Approved Submissions:</strong> Guitar information and photos from approved submissions are publicly visible 
            in the archive. Your email address is not publicly displayed.
          </p>
          <p>
            <strong>Third Parties:</strong> We do not sell, trade, or rent your personal information to third parties. 
            We may share anonymous, aggregated data for analytical purposes.
          </p>

          <h2>4. Data Storage and Security</h2>
          <p>
            Your data is stored securely using Supabase infrastructure with encryption at rest and in transit. 
            Photos are stored in secure cloud storage. While we implement safeguards, no method of transmission 
            over the Internet is 100% secure.
          </p>

          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate data</li>
            <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
            <li><strong>Withdrawal:</strong> Withdraw consent for data processing where applicable</li>
          </ul>
          <p>
            To exercise these rights, contact the site administrator.
          </p>

          <h2>6. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. These are necessary for the Service to function. 
            We do not use third-party tracking cookies.
          </p>

          <h2>7. Children's Privacy</h2>
          <p>
            The Service is not intended for users under 13 years of age. We do not knowingly collect 
            personal information from children under 13.
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify users of significant changes 
            by posting a notice on the Service.
          </p>

          <h2>9. Contact</h2>
          <p>
            For questions about this Privacy Policy or to exercise your data rights, please contact the site administrator.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;