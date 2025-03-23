import { requireAdmin } from "@/lib/auth"
import { getAgents } from "@/lib/actions/agent-actions"
import { getDistributedLists } from "@/lib/actions/list-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  await requireAdmin()

  const { agents = [] } = await getAgents()
  const { agentData = [] } = await getDistributedLists()

  const totalAgents = agents.length
  const totalItems = agentData.reduce((acc, agent) => acc + agent.items.length, 0)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Agents</CardTitle>
            <CardDescription>Number of registered agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalAgents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total List Items</CardTitle>
            <CardDescription>Number of distributed items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold"></h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Manage Agents</CardTitle>
              <CardDescription>Add, view, or remove agents</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="/dashboard/agents"
                className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Go to Agents
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Lists</CardTitle>
              <CardDescription>Upload and distribute CSV lists</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="/dashboard/lists"
                className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Go to Lists
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

