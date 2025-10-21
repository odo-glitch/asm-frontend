export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Data Deletion Instructions
        </h1>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-lg text-gray-700 mb-6">
            We respect your privacy and are committed to protecting your personal data. 
            If you wish to delete your data from our platform, please follow the instructions below.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            How to Delete Your Data
          </h2>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Option 1: Delete Your Account (Recommended)
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Log in to your account</li>
              <li>Navigate to <strong>Settings</strong></li>
              <li>Scroll to the bottom and click <strong>"Delete Account"</strong></li>
              <li>Confirm the deletion</li>
              <li>All your data will be permanently deleted within 30 days</li>
            </ol>
          </div>

          <div className="bg-gray-50 border-l-4 border-gray-400 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Option 2: Disconnect Social Media Accounts
            </h3>
            <p className="text-gray-700 mb-3">
              If you only want to remove specific social media connections:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Log in to your account</li>
              <li>Go to <strong>Settings → Connected Accounts</strong></li>
              <li>Click the <strong>Disconnect</strong> button next to each account you want to remove</li>
              <li>Your social media data will be removed immediately</li>
            </ol>
          </div>

          <div className="bg-gray-50 border-l-4 border-gray-400 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Option 3: Email Request
            </h3>
            <p className="text-gray-700 mb-3">
              You can also request data deletion by emailing us:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                Email: <a href="mailto:support@yourdomain.com" className="text-blue-600 hover:underline">
                  support@yourdomain.com
                </a>
              </li>
              <li>Subject: "Data Deletion Request"</li>
              <li>Include your account email address</li>
              <li>We will process your request within 30 days</li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            What Data Will Be Deleted
          </h2>
          
          <p className="text-gray-700 mb-4">
            When you delete your account or request data deletion, we will remove:
          </p>
          
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Your account information (name, email, profile)</li>
            <li>Connected social media accounts and access tokens</li>
            <li>Scheduled posts and content calendar</li>
            <li>Analytics data and reports</li>
            <li>Content library items you uploaded</li>
            <li>Message history and conversations</li>
            <li>All associated metadata</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            Facebook-Specific Data Deletion
          </h2>
          
          <p className="text-gray-700 mb-4">
            If you connected your Facebook account and want to revoke our app's access:
          </p>
          
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
            <li>Go to your Facebook <a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Apps and Websites settings</a></li>
            <li>Find our app in the list</li>
            <li>Click <strong>Remove</strong></li>
            <li>Select <strong>Delete all activity</strong> when prompted</li>
          </ol>

          <p className="text-gray-700 mb-6">
            This will immediately revoke our app's access to your Facebook data and remove all 
            associated information from Facebook's systems.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            Data Retention
          </h2>
          
          <p className="text-gray-700 mb-6">
            After you request deletion:
          </p>
          
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Your account is deactivated immediately</li>
            <li>Data is permanently deleted from our servers within 30 days</li>
            <li>Some data may be retained for legal compliance (up to 90 days)</li>
            <li>Backup copies are purged within 60 days of deletion</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mt-8">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              ⚠️ Important Notice
            </h3>
            <p className="text-gray-700">
              Account deletion is permanent and cannot be undone. Make sure to download any 
              data you want to keep before deleting your account.
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            Questions or Concerns?
          </h2>
          
          <p className="text-gray-700 mb-4">
            If you have any questions about data deletion or our privacy practices, please contact us:
          </p>
          
          <ul className="list-none space-y-2 text-gray-700">
            <li>📧 Email: <a href="mailto:privacy@yourdomain.com" className="text-blue-600 hover:underline">privacy@yourdomain.com</a></li>
            <li>📄 Privacy Policy: <a href="/privacy-policy" className="text-blue-600 hover:underline">View our Privacy Policy</a></li>
            <li>📋 Terms of Service: <a href="/terms" className="text-blue-600 hover:underline">View our Terms</a></li>
          </ul>

          <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-600">
            <p>Last Updated: October 2025</p>
            <p className="mt-2">
              This page complies with Facebook Platform Policy and GDPR requirements for data deletion.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
