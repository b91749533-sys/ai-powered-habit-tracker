'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { getDescriptiveErrorMessage } from '@/utils/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Footer } from '@/components/layout/Footer'

export default function ResetPasswordPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!email) {
      setErrorMsg('Please enter your email address.')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/update`,
      })

      if (error) {
        setErrorMsg(getDescriptiveErrorMessage(error))
      } else {
        setSuccessMsg('If an account exists for this email, we have sent password reset instructions.')
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
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md border-border bg-card shadow-2xl rounded-2xl overflow-hidden p-2 sm:p-4">
          <CardHeader className="space-y-1.5 pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight text-center">
              Reset password
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground text-sm">
              We'll email you instructions to reset your password.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {successMsg ? (
              <div className="space-y-4 text-center py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Check your email</h3>
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

                <Button
                  type="submit"
                  className="w-full mt-4"
                  isLoading={isLoading}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Send Reset Link
                </Button>
              </form>
            )}
          </CardContent>

          {!successMsg && (
            <CardFooter className="flex justify-center pt-2 pb-4 text-xs text-muted-foreground">
              <Link href="/login" className="flex items-center gap-1.5 hover:text-foreground font-semibold">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to login
              </Link>
            </CardFooter>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  )
}
