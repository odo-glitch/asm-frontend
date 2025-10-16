import LoginForm from '@/components/auth/LoginForm'
import TypingAnimation from '@/components/auth/TypingAnimation'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
      {/* Video Background - Left Side */}
      <div className="absolute lg:relative w-full lg:w-1/2 h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/odomarketing-background-socialmedia.mp4" type="video/mp4" />
        </video>
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Typing Animation */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
          <TypingAnimation />
          <p className="text-white text-xl md:text-2xl max-w-2xl opacity-90">
            Manage all your social media accounts in one place
          </p>
        </div>
      </div>

      {/* Form - Right Side */}
      <div className="relative lg:w-1/2 flex items-center justify-center p-8 lg:p-16 min-h-screen">
        {/* Backdrop blur effect for mobile */}
        <div className="absolute inset-0 lg:hidden bg-black/30 backdrop-blur-sm" />
        
        {/* Form Container with Glassmorphism */}
        <div className="relative w-full max-w-xl">
          <div className="backdrop-blur-xl bg-white/90 lg:bg-white/95 rounded-3xl shadow-2xl p-8 lg:p-12 border border-white/20">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Sign in to your account
                </h2>
                <p className="text-base text-gray-600">
                  Or{' '}
                  <a href="/auth/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                    create a new account
                  </a>
                </p>
              </div>
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}