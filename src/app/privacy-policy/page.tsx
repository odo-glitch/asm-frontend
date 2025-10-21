export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Privacy Policy
        </h1>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-sm text-gray-600 mb-6">
            Last Updated: October 2025
          </p>

          <p className="text-lg text-gray-700 mb-6">
            Your privacy is important to us. This Privacy Policy explains how we collect, use, 
            disclose, and safeguard your information when you use our social media management platform.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            1. Information We Collect
          </h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            1.1 Account Information
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>Name and email address</li>
            <li>Profile picture</li>
            <li>Account credentials (encrypted)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            1.2 Social Media Data
          </h3>
          <p className="text-gray-700 mb-4">
            When you connect your social media accounts (Facebook, Instagram, Twitter, LinkedIn, TikTok), we collect:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>Access tokens for posting and managing content</li>
            <li>Page/account information (name, ID, followers)</li>
            <li>Post engagement metrics (likes, comments, shares)</li>
            <li>Messages and conversations (for inbox management)</li>
            <li>Analytics and insights data</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            1.3 Content Data
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>Posts you create and schedule</li>
            <li>Media files you upload (images, videos)</li>
            <li>Calendar and scheduling information</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            2. How We Use Your Information
          </h2>

          <p className="text-gray-700 mb-4">We use your information to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Provide and maintain our services</li>
            <li>Schedule and publish content to your social media accounts</li>
            <li>Display analytics and performance metrics</li>
            <li>Manage your inbox and conversations</li>
            <li>Send notifications about scheduled posts and important updates</li>
            <li>Improve our platform and user experience</li>
            <li>Ensure security and prevent fraud</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            3. Facebook/Instagram Data Usage
          </h2>

          <p className="text-gray-700 mb-4">
            We comply with Facebook Platform Policy and only use Facebook/Instagram data for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li><strong>Page Management:</strong> Publishing and scheduling posts to your Pages</li>
            <li><strong>Analytics:</strong> Displaying engagement metrics and insights</li>
            <li><strong>Customer Service:</strong> Managing Messenger conversations and Instagram DMs</li>
            <li><strong>Content Organization:</strong> Organizing your content calendar</li>
          </ul>

          <p className="text-gray-700 mb-6">
            We use aggregated and anonymized analytics data to improve our app. We do not:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Sell your data to third parties</li>
            <li>Use your data for advertising purposes outside our platform</li>
            <li>Share individual user data with third parties without consent</li>
            <li>Post to your accounts without your explicit authorization</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            4. Data Sharing and Disclosure
          </h2>

          <p className="text-gray-700 mb-4">We may share your information:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li><strong>With Social Platforms:</strong> When you authorize us to post on your behalf</li>
            <li><strong>Service Providers:</strong> Trusted third parties who help operate our platform (hosting, analytics)</li>
            <li><strong>Legal Compliance:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            5. Data Security
          </h2>

          <p className="text-gray-700 mb-4">We implement security measures including:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Encryption of data in transit and at rest</li>
            <li>Secure access tokens storage</li>
            <li>Regular security audits</li>
            <li>Access controls and authentication</li>
            <li>Secure cloud infrastructure (Vercel, Supabase)</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            6. Your Rights and Choices
          </h2>

          <p className="text-gray-700 mb-4">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li><strong>Access:</strong> Request a copy of your data</li>
            <li><strong>Correction:</strong> Update or correct your information</li>
            <li><strong>Deletion:</strong> Delete your account and data (see <a href="/data-deletion" className="text-blue-600 hover:underline">Data Deletion Instructions</a>)</li>
            <li><strong>Revoke Access:</strong> Disconnect social media accounts at any time</li>
            <li><strong>Opt-out:</strong> Unsubscribe from email notifications</li>
            <li><strong>Data Portability:</strong> Export your data in a machine-readable format</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            7. Data Retention
          </h2>

          <p className="text-gray-700 mb-6">
            We retain your data as long as your account is active. When you delete your account:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Account is deactivated immediately</li>
            <li>Data is permanently deleted within 30 days</li>
            <li>Some data may be retained for legal compliance (up to 90 days)</li>
            <li>Backup copies are purged within 60 days</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            8. Cookies and Tracking
          </h2>

          <p className="text-gray-700 mb-4">We use cookies and similar technologies for:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Authentication and session management</li>
            <li>Remembering your preferences</li>
            <li>Analytics and performance monitoring</li>
            <li>Security and fraud prevention</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            9. Children&apos;s Privacy
          </h2>

          <p className="text-gray-700 mb-6">
            Our service is not intended for users under 13 years of age. We do not knowingly 
            collect personal information from children under 13.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            10. International Data Transfers
          </h2>

          <p className="text-gray-700 mb-6">
            Your data may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place to protect your data in compliance 
            with GDPR and other regulations.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            11. Changes to This Policy
          </h2>

          <p className="text-gray-700 mb-6">
            We may update this Privacy Policy from time to time. We will notify you of any 
            significant changes by email or through our platform. Continued use of our service 
            constitutes acceptance of the updated policy.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            12. Contact Us
          </h2>

          <p className="text-gray-700 mb-4">
            If you have questions about this Privacy Policy or our data practices, contact us:
          </p>
          <ul className="list-none space-y-2 text-gray-700 mb-6">
            <li>📧 Email: privacy@yourdomain.com</li>
            <li>📧 Support: support@yourdomain.com</li>
            <li>📄 Data Deletion: <a href="/data-deletion" className="text-blue-600 hover:underline">Data Deletion Instructions</a></li>
          </ul>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mt-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Compliance
            </h3>
            <p className="text-gray-700">
              This Privacy Policy complies with:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
              <li>General Data Protection Regulation (GDPR)</li>
              <li>California Consumer Privacy Act (CCPA)</li>
              <li>Facebook Platform Policy</li>
              <li>Instagram Platform Policy</li>
              <li>Other applicable privacy laws and regulations</li>
            </ul>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-600">
            <p><strong>Last Updated:</strong> October 2025</p>
            <p className="mt-2"><strong>Effective Date:</strong> October 2025</p>
          </div>
        </div>
      </div>
    </div>
  )
}
