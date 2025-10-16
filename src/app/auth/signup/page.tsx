import SignupForm from '@/components/auth/SignupForm'
import TypingAnimation from '@/components/auth/TypingAnimation'

export default function SignupPage() {
  return (
    <div className="min-h-screen relative overflow-hidden animate-page-enter">
      {/* Full Screen Video Background */}
      <div className="fixed inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%23000000' width='1920' height='1080'/%3E%3C/svg%3E"
          className="w-full h-full object-cover"
        >
          <source src="/odomarketing-background-socialmedia.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay on left side */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/40 to-transparent lg:to-black/0" />
      </div>

      {/* Content Container */}
      <div className="relative min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Typing Animation */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 text-center min-h-[40vh] lg:min-h-screen">
          <TypingAnimation />
          <p className="text-white text-xl md:text-2xl max-w-2xl opacity-90">
            Manage all your social media accounts in one place
          </p>
        </div>

        {/* Right Side - Form with Blurred Background */}
        <div className="relative w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 min-h-screen">
          {/* Blurred backdrop for the form area */}
          <div className="absolute inset-0 backdrop-blur-2xl bg-white/10" />
          
          {/* Form Container with Glassmorphism */}
          <div className="relative w-full max-w-xl">
            <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl p-8 lg:p-12 border border-white/20">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    Create your account
                  </h2>
                  <p className="text-base text-gray-600">
                    Or{' '}
                    <a href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                      sign in to your existing account
                    </a>
                  </p>
                </div>
                <SignupForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}