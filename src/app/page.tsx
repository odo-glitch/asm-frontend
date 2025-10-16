import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
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
          preload="metadata"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%23000000' width='1920' height='1080'/%3E%3C/svg%3E"
          className="w-full h-full object-cover"
        >
          <source src="/odomarketing-background-socialmedia.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-8">
        <div className="max-w-3xl w-full text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center mb-6 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-40 animate-pulse"></div>
              <Image
                src="/Odo-Marketing.svg"
                alt="Odo Marketing"
                width={200}
                height={200}
                className="relative drop-shadow-2xl filter brightness-0 invert"
                priority
              />
            </div>
          </div>
          
          {/* Welcome Text */}
          <h1 className="text-2xl md:text-3xl font-semibold text-white/90 tracking-wide mb-4 animate-slide-up">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Welcome to Odo Marketing AI Apps
            </span>
          </h1>
          
          <TypingAnimation />
          <p className="text-white text-xl md:text-2xl opacity-90 animate-slide-up">
            Manage all your social media accounts in one place
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link
              href="/auth/signup"
              className="group inline-flex justify-center py-4 px-8 border border-transparent rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform"
            >
              <span className="flex items-center gap-2">
                Get Started
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
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
