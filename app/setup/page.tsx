"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { initializeDatabase } from "@/lib/init-db"
import { seedDatabase } from "@/lib/seed-db"

export default function SetupPage() {
  const [initStatus, setInitStatus] = useState<{
    loading: boolean
    success?: boolean
    message?: string
    error?: string
  }>({ loading: false })

  const [seedStatus, setSeedStatus] = useState<{
    loading: boolean
    success?: boolean
    message?: string
    error?: string
  }>({ loading: false })

  const handleInitialize = async () => {
    setInitStatus({ loading: true })
    try {
      const result = await initializeDatabase()
      if (result.success) {
        setInitStatus({ loading: false, success: true, message: result.message })
      } else {
        setInitStatus({ loading: false, success: false, error: result.error || "Unknown error occurred" })
      }
    } catch (error) {
      console.error("Error initializing database:", error)
      setInitStatus({
        loading: false,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      })
    }
  }

  const handleSeed = async () => {
    setSeedStatus({ loading: true })
    try {
      const result = await seedDatabase()
      if (result.success) {
        setSeedStatus({ loading: false, success: true, message: result.message })
      } else {
        setSeedStatus({ loading: false, success: false, error: result.error || "Unknown error occurred" })
      }
    } catch (error) {
      console.error("Error seeding database:", error)
      setSeedStatus({
        loading: false,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Database Setup</h1>

      <div className="grid gap-6 max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Initialize Database</CardTitle>
            <CardDescription>Create all necessary tables in the database</CardDescription>
          </CardHeader>
          <CardContent>
            {initStatus.success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Success</AlertTitle>
                <AlertDescription className="text-green-600">{initStatus.message}</AlertDescription>
              </Alert>
            )}

            {initStatus.error && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-600">Error</AlertTitle>
                <AlertDescription className="text-red-600">{initStatus.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleInitialize} disabled={initStatus.loading || initStatus.success} className="w-full">
              {initStatus.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initStatus.success ? "Initialized" : "Initialize Database"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 2: Seed Database</CardTitle>
            <CardDescription>Populate the database with initial data</CardDescription>
          </CardHeader>
          <CardContent>
            {seedStatus.success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Success</AlertTitle>
                <AlertDescription className="text-green-600">{seedStatus.message}</AlertDescription>
              </Alert>
            )}

            {seedStatus.error && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-600">Error</AlertTitle>
                <AlertDescription className="text-red-600">{seedStatus.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSeed}
              disabled={seedStatus.loading || !initStatus.success || seedStatus.success}
              className="w-full"
            >
              {seedStatus.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {seedStatus.success ? "Seeded" : "Seed Database"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
