"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { orderService, type Order } from "@/lib/order-service"

interface SellerOrdersTableProps {
  orders: Order[]
  onOrderUpdated?: (order: Order) => void
}

const statusColors = {
  pending: "default",
  confirmed: "secondary",
  shipped: "outline",
  delivered: "secondary",
  cancelled: "destructive",
} as const

const nextStatus: Partial<Record<Order["status"], { label: string; value: Order["status"] }>> = {
  pending: { label: "Mark as Confirmed", value: "confirmed" },
  confirmed: { label: "Mark as Shipped", value: "shipped" },
  shipped: { label: "Mark as Delivered", value: "delivered" },
}

export function SellerOrdersTable({ orders, onOrderUpdated }: SellerOrdersTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No orders yet.</p>
      </div>
    )
  }

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  const handleStatusUpdate = async (orderId: string, status: Order["status"]) => {
    setUpdatingId(orderId)
    try {
      const updated = await orderService.updateOrderStatus(orderId, status)
      onOrderUpdated?.(updated)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedOrders.map((order) => {
            const transition = nextStatus[order.status]
            return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>
                  <span className="text-sm">
                    {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  </span>
                </TableCell>
                <TableCell className="font-medium">${order.total_price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[order.status]} className="capitalize">
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    {transition ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" disabled={updatingId === order.id}>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, transition.value)}>
                            {transition.label}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-xs text-muted-foreground px-2">—</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
