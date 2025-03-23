"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import { uploadAndDistributeList } from "@/lib/actions/list-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export function UploadForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    try {
      const result = await uploadAndDistributeList(formData)

      if (result.success) {
        toast({
          title: "List uploaded",
          description: result.message,
        })

        // Reset the form
        const form = document.getElementById("upload-form") as HTMLFormElement
        form.reset()

        // Refresh the page to show the distributed lists
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          title: "Failed to upload list",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to upload list",
        description: "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form id="upload-form" action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="file">CSV File</Label>
            <div className="mt-1">
              <Input id="file" name="file" type="file" accept=".csv,.xlsx,.xls" required />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload a CSV file with FirstName, Phone, and Notes columns. The list will be distributed equally among all
              agents.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              "Uploading and distributing..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload and Distribute
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

