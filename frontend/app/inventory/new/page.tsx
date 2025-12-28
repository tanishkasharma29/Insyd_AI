'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewInventoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitCostPrice: '',
    unitSellingPrice: '',
    supplierId: '',
    minThreshold: '10',
    initialQuantity: '0',
    storageLocation: '',
  });

  const createMutation = useMutation({
    mutationFn: api.createInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      router.push('/inventory');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      unitCostPrice: parseFloat(formData.unitCostPrice),
      unitSellingPrice: parseFloat(formData.unitSellingPrice),
      supplierId: formData.supplierId,
      minThreshold: parseInt(formData.minThreshold) || 10,
      initialQuantity: parseInt(formData.initialQuantity) || 0,
      storageLocation: formData.storageLocation || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <Link href="/inventory">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
        </Link>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
            <CardDescription>Create a new product and inventory entry</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    placeholder="e.g., TILE-MARBLE-001"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    placeholder="e.g., flooring, lighting"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierId">Supplier ID *</Label>
                  <Input
                    id="supplierId"
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    required
                    placeholder="UUID of supplier"
                  />
                  <p className="text-xs text-muted-foreground">
                    Create supplier via Prisma Studio first
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="unitCostPrice">Cost Price (₹) *</Label>
                  <Input
                    id="unitCostPrice"
                    type="number"
                    step="0.01"
                    value={formData.unitCostPrice}
                    onChange={(e) => setFormData({ ...formData, unitCostPrice: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitSellingPrice">Selling Price (₹) *</Label>
                  <Input
                    id="unitSellingPrice"
                    type="number"
                    step="0.01"
                    value={formData.unitSellingPrice}
                    onChange={(e) => setFormData({ ...formData, unitSellingPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minThreshold">Min Threshold *</Label>
                  <Input
                    id="minThreshold"
                    type="number"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initialQuantity">Initial Quantity</Label>
                  <Input
                    id="initialQuantity"
                    type="number"
                    value={formData.initialQuantity}
                    onChange={(e) => setFormData({ ...formData, initialQuantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storageLocation">Storage Location</Label>
                <Input
                  id="storageLocation"
                  value={formData.storageLocation}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  placeholder="e.g., Warehouse A, Aisle 4"
                />
              </div>

              {createMutation.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  Error: {createMutation.error instanceof Error ? createMutation.error.message : 'Failed to create product'}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

