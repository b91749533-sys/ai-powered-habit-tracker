'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle, ArrowRight, Mail } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { getDescriptiveErrorMessage } from '@/utils/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Footer } from '@/components/layout/Footer'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!email || !password || !confirmPassword) {
      setErrorMsg('All fields are required.')
      return
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setErrorMsg(getDescriptiveErrorMessage(error))
      } else {
        // If auto-logged in or confirmation needed:
        if (data.session) {
          router.push('/dashboard')
          router.refresh()
        } else {
          setSuccessMsg('Registration successful! Please check your email inbox to verify your account.')
          setEmail('')
          setPassword('')
          setConfirmPassword('')
        }
      }
    } catch (err: any) {
      setErrorMsg(getDescriptiveErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background bg-grid-pattern">
      {/* Header */}
      <div className="py-6 px-4 sm:px-6 lg:px-8 flex justify-center sm:justify-start">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <CheckCircle className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">HabitFlow</span>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 animate-fade-in">
        <Card className="w-full max-w-md border-border bg-card shadow-2xl rounded-2xl overflow-hidden p-2 sm:p-4">
          <CardHeader className="space-y-1.5 pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight text-center">
              Create your account
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground text-sm">
              Start building positive daily habits today.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {successMsg ? (
              <div className="space-y-4 text-center py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Verify your email</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {successMsg}
                </p>
                <Link href="/login" className="inline-block mt-4">
                  <Button variant="outline">Back to Sign In</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive font-medium animate-fade-in">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <Input
                  label="Email address"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-type your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />

                <Button
                  type="submit"
                  className="w-full mt-4"
                  isLoading={isLoading}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Create Account
                </Button>
              </form>
            )}
          </CardContent>

          {!successMsg && (
            <CardFooter className="flex flex-col items-center justify-center pt-2 pb-4 text-xs text-muted-foreground gap-1">
              <p>
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  )
}
