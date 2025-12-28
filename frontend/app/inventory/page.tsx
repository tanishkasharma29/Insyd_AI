'use client';

import { useQuery } from '@tanstack/react-query';
import { api, InventoryItem } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, Package } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const getStatusBadge = (status: string, isDeadStock: boolean) => {
  if (isDeadStock) {
    return <Badge variant="outline" className="bg-gray-100 text-gray-800">Dead Stock</Badge>;
  }

  switch (status) {
    case 'CRITICAL':
      return <Badge variant="destructive">Critical</Badge>;
    case 'LOW':
      return <Badge variant="default" className="bg-orange-500">Low</Badge>;
    case 'OUT_OF_STOCK':
      return <Badge variant="destructive">Out of Stock</Badge>;
    case 'SAFE':
      return <Badge variant="default" className="bg-green-500">Safe</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['inventory', { search, category: categoryFilter, status: statusFilter }],
    queryFn: () => api.getInventory({ search, category: categoryFilter, status: statusFilter }),
  });

  const inventoryItems = data?.data || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage your product inventory and stock levels
            </p>
          </div>
          <Link href="/inventory/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter your inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by SKU or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Input
                placeholder="Category filter..."
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              />
              <Input
                placeholder="Status filter (SAFE/LOW/CRITICAL)..."
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory List</CardTitle>
            <CardDescription>
              {data?.count || 0} items found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading inventory...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Error loading inventory. Make sure the backend server is running.
              </div>
            ) : inventoryItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No inventory items found.</p>
                <Link href="/inventory/new">
                  <Button variant="outline" className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Product
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cost Price</TableHead>
                      <TableHead>Selling Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryItems.map((item: InventoryItem) => (
                      <TableRow key={item.sku}>
                        <TableCell className="font-mono font-medium">{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>{item.currentQuantity}</TableCell>
                        <TableCell>{item.minThreshold}</TableCell>
                        <TableCell>
                          {getStatusBadge(item.status, item.isDeadStock)}
                        </TableCell>
                        <TableCell>₹{item.unitCostPrice}</TableCell>
                        <TableCell>₹{item.unitSellingPrice}</TableCell>
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

