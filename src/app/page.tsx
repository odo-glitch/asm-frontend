import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import TypingAnimation from '@/components/auth/TypingAnimation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full Screen Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        >
          <source src="/odomarketing-background-socialmedia.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center space-y-8">
          <TypingAnimation />
          <p className="text-white text-xl md:text-2xl opacity-90">
            Manage all your social media accounts in one place
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex justify-center py-4 px-8 border border-transparent rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-xl hover:shadow-2xl transition-all duration-200"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex justify-center py-4 px-8 border-2 border-white rounded-xl text-lg font-semibold text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
