"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  AlertTriangle,
  Skull,
  TrendingDown,
  TrendingUp,
  DollarSign,
} from "lucide-react";

export default function DashboardPage() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">
          Error loading dashboard. Make sure the backend server is running.
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Stock Value",
      value: `₹${stats?.totalStockValue.toLocaleString("en-IN") || 0}`,
      description: "Total inventory value (Cost Price)",
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockCount || 0,
      description: "Items below reorder threshold",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Critical Stock",
      value: stats?.criticalStockCount || 0,
      description: "Items below 30% of threshold",
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Dead Stock",
      value: stats?.deadStockCount || 0,
      description: `Frozen Capital: ₹${
        stats?.deadStockValue.toLocaleString("en-IN") || 0
      }`,
      icon: Skull,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      title: "Out of Stock",
      value: stats?.outOfStockCount || 0,
      description: "Items with zero quantity",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      description: `${stats?.totalSKUs || 0} active SKUs`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Inventory Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time inventory overview and analytics
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.bgColor} p-2 rounded-full`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common inventory management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <a
                  href="/inventory"
                  className="flex items-center justify-center p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <Package className="mr-2 h-5 w-5" />
                  <span>View Inventory</span>
                </a>
                <a
                  href="/inventory/new"
                  className="flex items-center justify-center p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <TrendingUp className="mr-2 h-5 w-5" />
                  <span>Add New Product</span>
                </a>
                <a
                  href="/orders"
                  className="flex items-center justify-center p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  <span>Manage Orders</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
