"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { deleteAgent } from "@/lib/actions/agent-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface Agent {
  id: string
  name: string
  email: string
  mobile: string
}

export function AgentList({ agents }: { agents: Agent[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  async function handleDelete(id: string) {
    setIsDeleting(id)

    try {
      const formData = new FormData()
      formData.append("id", id)

      const result = await deleteAgent(formData)

      if (result.success) {
        toast({
          title: "Agent deleted",
          description: "The agent has been deleted successfully",
        })

        // Refresh the page to update the agent list
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          title: "Failed to delete agent",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete agent",
        description: "An unexpected error occurred",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  if (agents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No agents found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {agents.map((agent) => (
        <Card key={agent.id}>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <h3 className="font-medium">{agent.name}</h3>
              <p className="text-sm text-muted-foreground">{agent.email}</p>
              <p className="text-sm text-muted-foreground">{agent.mobile}</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(agent.id)}
              disabled={isDeleting === agent.id}
            >
              {isDeleting === agent.id ? "Deleting..." : <Trash2 className="h-4 w-4" />}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

