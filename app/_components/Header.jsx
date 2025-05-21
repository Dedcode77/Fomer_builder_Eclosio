"use client"

import { Button } from '@/components/ui/button'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

function Header() {
  const { user, isSignedIn } = useUser()
  const path = usePathname()
  const router = useRouter()

  useEffect(() => {
    console.log('Current path:', path)
  }, [path])

  return !path.includes('aiform') && (
    <div className='p-3 px-5 border-b shadow-sm'>
      <div className='flex items-center justify-between'>
        <Image
          src='/ype-icone_Plan-de-travail-1.jpg'
          width={50}
          height={40}
          alt='logo'
        />

        {isSignedIn ? (
          <div className='flex items-center gap-5'>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Dashboard
            </Button>
            <UserButton />
          </div>
        ) : (
          <SignInButton>
            <Button>Commencer</Button>
          </SignInButton>
        )}
      </div>
    </div>
  )
}

export default Header
