"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ListItem {
  id: string
  firstName: string
  phone: string
  notes: string
}

interface AgentData {
  id: string
  name: string
  email: string
  items: ListItem[]
}

export function DistributedLists({ agentData }: { agentData: AgentData[] }) {
  const [activeTab, setActiveTab] = useState(agentData[0]?.id || "")

  if (agentData.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No lists have been distributed yet. Upload a CSV file to distribute lists.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lists by Agent</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {agentData.map((agent) => (
              <TabsTrigger key={agent.id} value={agent.id}>
                {agent.name} ({agent.items.length})
              </TabsTrigger>
            ))}
          </TabsList>

          {agentData.map((agent) => (
            <TabsContent key={agent.id} value={agent.id}>
              {agent.items.length === 0 ? (
                <p className="text-center text-muted-foreground">No items assigned to this agent</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>First Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agent.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.firstName}</TableCell>
                        <TableCell>{item.phone}</TableCell>
                        <TableCell>{item.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

