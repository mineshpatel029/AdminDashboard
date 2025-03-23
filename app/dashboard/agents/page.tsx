import { requireAdmin } from "@/lib/auth"
import { getAgents } from "@/lib/actions/agent-actions"
import { AgentForm } from "@/components/agent-form"
import { AgentList } from "@/components/agent-list"

export default async function AgentsPage() {
  await requireAdmin()

  const { agents = [] } = await getAgents()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Manage Agents</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-bold">Add New Agent</h2>
          <AgentForm />
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold">Existing Agents</h2>
          <AgentList agents={agents} />
        </div>
      </div>
    </div>
  )
}

