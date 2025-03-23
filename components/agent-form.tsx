"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createAgent } from "@/lib/actions/agent-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Country codes array
const countryCodes = [
  { code: "+1", country: "USA" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "India" },
  { code: "+61", country: "Australia" },
  { code: "+86", country: "China" },
]

export function AgentForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [countryCode, setCountryCode] = useState("+1")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Validate phone number
  const validatePhone = (phone: string) => {
    // Basic validation - only numbers allowed
    const phoneRegex = /^\d+$/
    if (!phoneRegex.test(phone)) {
      setPhoneError("Phone number should contain only digits")
      return false
    }

    // Check length (adjust as needed for different countries)
    if (phone.length < 7 || phone.length > 15) {
      setPhoneError(" Invalid Phone number ")
      return false
    }

    setPhoneError("")
    return true
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPhoneNumber(value)
    validatePhone(value)
  }

  async function handleSubmit(formData: FormData) {
    // Validate phone before submission
    if (!validatePhone(phoneNumber)) {
      return
    }

    setIsLoading(true)

    try {
      // Combine country code and phone number
      formData.set("mobile", `${countryCode}${phoneNumber}`)

      const result = await createAgent(formData)

      if (result.success) {
        toast({
          title: "Agent created",
          description: "The agent has been created successfully",
        })

        // Reset the form
        const form = document.getElementById("agent-form") as HTMLFormElement
        form.reset()
        setPhoneNumber("")
        setCountryCode("+1")

        // Refresh the page to show the new agent
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          title: "Failed to create agent",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create agent",
        description: "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form id="agent-form" action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required className="mt-1" />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required className="mt-1" />
          </div>

          <div>
            <Label htmlFor="mobile">Mobile Number</Label>
            <div className="flex mt-1 gap-2">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.code} {country.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="Phone number"
                className="flex-1"
              />
            </div>
            {phoneError && <p className="text-sm text-destructive mt-1">{phoneError}</p>}
            <input type="hidden" name="mobile" value={`${countryCode}${phoneNumber}`} />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required className="mt-1" />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !!phoneError}>
            {isLoading ? "Creating..." : "Create Agent"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

