export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Terms of Service
        </h1>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-sm text-gray-600 mb-6">
            Last Updated: October 2025
          </p>

          <p className="text-lg text-gray-700 mb-6">
            Welcome to our Social Media Management Platform. By using our service, you agree to these Terms of Service.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            1. Acceptance of Terms
          </h2>

          <p className="text-gray-700 mb-6">
            By accessing or using our platform, you agree to be bound by these Terms of Service and our Privacy Policy. 
            If you do not agree, please do not use our service.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            2. Service Description
          </h2>

          <p className="text-gray-700 mb-4">
            Our platform provides social media management tools including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Content scheduling and publishing</li>
            <li>Analytics and performance tracking</li>
            <li>Unified inbox for managing conversations</li>
            <li>Content library management</li>
            <li>Calendar-based content planning</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            3. User Accounts
          </h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            3.1 Account Creation
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>You must provide accurate and complete information</li>
            <li>You are responsible for maintaining account security</li>
            <li>You must be at least 13 years old to use our service</li>
            <li>One person or entity may not maintain more than one account</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            3.2 Account Responsibilities
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Keep your password secure and confidential</li>
            <li>Notify us immediately of unauthorized access</li>
            <li>You are responsible for all activity on your account</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            4. Social Media Connections
          </h2>

          <p className="text-gray-700 mb-4">
            When connecting your social media accounts:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>You grant us permission to access and manage your connected accounts</li>
            <li>You must comply with each platform&apos;s terms of service</li>
            <li>You are responsible for content posted through our service</li>
            <li>You can disconnect accounts at any time in Settings</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            5. Acceptable Use
          </h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            5.1 You Agree NOT To:
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Violate any laws or regulations</li>
            <li>Post spam, malicious, or inappropriate content</li>
            <li>Harass, abuse, or harm others</li>
            <li>Violate intellectual property rights</li>
            <li>Attempt to hack or disrupt the service</li>
            <li>Use the service for unauthorized commercial purposes</li>
            <li>Impersonate others or misrepresent your identity</li>
            <li>Share your account credentials</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            6. Content Ownership and Rights
          </h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            6.1 Your Content
          </h3>
          <p className="text-gray-700 mb-4">
            You retain all rights to content you create or upload. By using our service, you grant us:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>Permission to store and process your content</li>
            <li>Right to publish content on your behalf to connected accounts</li>
            <li>License to display content within our platform for service operation</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            6.2 Platform Content
          </h3>
          <p className="text-gray-700 mb-6">
            Our platform interface, features, and original content are protected by copyright and other 
            intellectual property rights. You may not copy, modify, or distribute our platform without permission.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            7. Service Availability
          </h2>

          <p className="text-gray-700 mb-6">
            We strive to provide reliable service but do not guarantee uninterrupted access. We may:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Perform maintenance that temporarily limits access</li>
            <li>Modify or discontinue features with notice</li>
            <li>Suspend service for security or legal reasons</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            8. Termination
          </h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            8.1 By You
          </h3>
          <p className="text-gray-700 mb-4">
            You may delete your account at any time through Settings. See our{' '}
            <a href="/data-deletion" className="text-blue-600 hover:underline">Data Deletion Instructions</a>.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            8.2 By Us
          </h3>
          <p className="text-gray-700 mb-4">
            We may suspend or terminate your account if you:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Violate these Terms of Service</li>
            <li>Engage in fraudulent or illegal activity</li>
            <li>Abuse the service or harm other users</li>
            <li>Fail to pay applicable fees (if any)</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            9. Disclaimers
          </h2>

          <div className="bg-gray-50 border-l-4 border-gray-400 p-6 mb-6">
            <p className="text-gray-700 uppercase font-semibold mb-2">
              Important Legal Notice
            </p>
            <p className="text-gray-700">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, 
              EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
              AND NON-INFRINGEMENT.
            </p>
          </div>

          <p className="text-gray-700 mb-6">
            We are not responsible for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Content posted by users</li>
            <li>Actions of third-party social media platforms</li>
            <li>Service interruptions or data loss</li>
            <li>Compatibility with all devices or browsers</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            10. Limitation of Liability
          </h2>

          <p className="text-gray-700 mb-6">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
            SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            11. Indemnification
          </h2>

          <p className="text-gray-700 mb-6">
            You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Your use of the service</li>
            <li>Your violation of these terms</li>
            <li>Your violation of any third-party rights</li>
            <li>Content you post or share</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            12. Privacy
          </h2>

          <p className="text-gray-700 mb-6">
            Your privacy is important to us. Please review our{' '}
            <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>{' '}
            to understand how we collect, use, and protect your data.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            13. Changes to Terms
          </h2>

          <p className="text-gray-700 mb-6">
            We may update these Terms from time to time. We will notify you of significant changes via 
            email or platform notification. Continued use after changes constitutes acceptance.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            14. Governing Law
          </h2>

          <p className="text-gray-700 mb-6">
            These Terms shall be governed by and construed in accordance with applicable laws. 
            Any disputes shall be resolved in the appropriate courts.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            15. Contact Information
          </h2>

          <p className="text-gray-700 mb-4">
            If you have questions about these Terms, contact us:
          </p>
          <ul className="list-none space-y-2 text-gray-700 mb-6">
            <li>📧 Email: support@yourdomain.com</li>
            <li>📧 Legal: legal@yourdomain.com</li>
            <li>📄 Privacy Policy: <a href="/privacy-policy" className="text-blue-600 hover:underline">View Privacy Policy</a></li>
            <li>📄 Data Deletion: <a href="/data-deletion" className="text-blue-600 hover:underline">View Data Deletion Instructions</a></li>
          </ul>

          <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-600">
            <p><strong>Last Updated:</strong> October 2025</p>
            <p className="mt-2"><strong>Effective Date:</strong> October 2025</p>
            <p className="mt-4">
              By using our service, you acknowledge that you have read and understood these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
