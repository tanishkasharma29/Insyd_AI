'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Package, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['pending-orders'],
    queryFn: api.getPendingOrders,
  });

  const reconcileMutation = useMutation({
    mutationFn: ({ orderId, actualQuantity }: { orderId: string; actualQuantity?: number }) =>
      api.reconcileOrder(orderId, actualQuantity ? { actualQuantity } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const handleReconcile = (orderId: string) => {
    if (confirm('Mark this order as received? This will automatically update inventory.')) {
      reconcileMutation.mutate({ orderId });
    }
  };

  const orders = data?.data || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pending Orders</h1>
            <p className="text-muted-foreground mt-2">
              Manage purchase orders and stock reconciliation
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Orders</CardTitle>
            <CardDescription>
              {data?.count || 0} pending orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading orders...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Error loading orders. Make sure the backend server is running.
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No pending orders.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Expected Date</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Cost Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono font-medium">{order.sku}</TableCell>
                        <TableCell>{order.productName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.category}</Badge>
                        </TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>
                          {new Date(order.expectedDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{order.supplierName}</TableCell>
                        <TableCell>₹{order.unitCostPrice || 'N/A'}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleReconcile(order.id)}
                            disabled={reconcileMutation.isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Received
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

