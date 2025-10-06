'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Platform = 'linkedin' | 'twitter' | 'facebook' | 'instagram'

interface PlatformConfig {
  name: string
  provider: string
  icon: string
  bgColor: string
  hoverColor: string
}

const PLATFORMS: Record<Platform, PlatformConfig> = {
  linkedin: {
    name: 'LinkedIn',
    provider: 'linkedin_oidc',
    icon: '🔗',
    bgColor: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700'
  },
  twitter: {
    name: 'Twitter',
    provider: 'twitter',
    icon: '🐦',
    bgColor: 'bg-sky-500',
    hoverColor: 'hover:bg-sky-600'
  },
  facebook: {
    name: 'Facebook',
    provider: 'facebook',
    icon: '📘',
    bgColor: 'bg-blue-700',
    hoverColor: 'hover:bg-blue-800'
  },
  instagram: {
    name: 'Instagram',
    provider: 'instagram',
    icon: '📷',
    bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    hoverColor: 'hover:from-purple-600 hover:to-pink-600'
  }
}

interface ConnectAccountUIProps {
  existingConnections: { platform: string }[]
}

export default function ConnectAccountUI({ existingConnections }: ConnectAccountUIProps) {
  const [loading, setLoading] = useState<Platform | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const connectedPlatforms = existingConnections.map(conn => conn.platform)

  const handleConnect = async (platform: Platform) => {
    setLoading(platform)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: PLATFORMS[platform].provider as 'google' | 'facebook' | 'twitter' | 'linkedin',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?platform=${platform}`,
          scopes: platform === 'linkedin' ? 'r_liteprofile r_emailaddress' : undefined
        }
      })

      if (error) {
        setError(`Failed to connect to ${PLATFORMS[platform].name}: ${error.message}`)
        setLoading(null)
      }
    } catch (err) {
      setError(`An unexpected error occurred`)
      setLoading(null)
      console.error('Connection error:', err)
    }
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connect Your First Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Link your social media accounts to start automating your content distribution
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {(Object.entries(PLATFORMS) as [Platform, PlatformConfig][]).map(([key, platform]) => {
            const isConnected = connectedPlatforms.includes(key)
            const isLoading = loading === key

            return (
              <button
                key={key}
                onClick={() => handleConnect(key)}
                disabled={isConnected || isLoading}
                className={`
                  relative w-full flex items-center justify-center px-4 py-3 border border-transparent 
                  text-sm font-medium rounded-md text-white 
                  ${platform.bgColor} ${platform.hoverColor} 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                `}
              >
                <span className="absolute left-4 text-xl">{platform.icon}</span>
                <span>
                  {isLoading ? (
                    'Connecting...'
                  ) : isConnected ? (
                    `${platform.name} Connected ✓`
                  ) : (
                    `Connect with ${platform.name}`
                  )}
                </span>
              </button>
            )
          })}
        </div>

        <div className="text-center">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Skip for now
          </button>
        </div>

        {connectedPlatforms.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue to Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}