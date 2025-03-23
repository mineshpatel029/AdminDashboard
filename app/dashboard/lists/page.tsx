import { requireAdmin } from "@/lib/auth"
import { getDistributedLists } from "@/lib/actions/list-actions"
import { UploadForm } from "@/components/upload-form"
import { DistributedLists } from "@/components/distributed-lists"

export default async function ListsPage() {
  await requireAdmin()

  const { agentData = [] } = await getDistributedLists()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Manage Lists</h1>

      <div className="space-y-8">
        <div>
          <h2 className="mb-4 text-2xl font-bold">Upload CSV</h2>
          <UploadForm />
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold">Distributed Lists</h2>
          <DistributedLists agentData={agentData} />
        </div>
      </div>
    </div>
  )
}

