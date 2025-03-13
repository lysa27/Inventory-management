// src/app/dashboard/inventory/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

// Type definitions
type InventoryItem = {
  id: string;
  name: string;
  category: string;
  serialNumber: string | null;
  condition: string;
  status: string;
  createdAt: string;
};

// Form schema for adding new item
const itemFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.enum(["DEVICE", "FURNITURE", "CLEANING_MATERIAL", "FOOD_UTENSIL"], {
    required_error: "Please select a category",
  }),
  serialNumber: z.string().optional(),
  condition: z.enum(["NEW", "GOOD", "WORN_OUT", "BROKEN"], {
    required_error: "Please select a condition",
  }),
});

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Initialize form
  const form = useForm<z.infer<typeof itemFormSchema>>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      category: "DEVICE",
      serialNumber: "",
      condition: "NEW",
    },
  });

  // Fetch user data to check role
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, []);

  // Fetch inventory items
  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        let url = "/api/items";
        const params = new URLSearchParams();
        
        if (categoryFilter) {
          params.append("category", categoryFilter);
        }
        
        if (statusFilter) {
          params.append("status", statusFilter);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch inventory items");
        }
        
        const data = await response.json();
        setItems(data);
      } catch (error) {
        toast.error("Error loading inventory items");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [categoryFilter, statusFilter]);

  // Submit handler for adding new item
  async function onSubmitAddItem(values: z.infer<typeof itemFormSchema>) {
    if (user?.role !== "INVENTORY_MANAGER") {
      toast.error("Only Inventory Managers can add new items");
      return;
    }
    
    setIsAddingItem(true);
    
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to add item");
      }
      
      // Add the new item to the list
      setItems((prevItems) => [data, ...prevItems]);
      
      toast.success("Item added successfully");
      
      // Close dialog and reset form
      setIsAddDialogOpen(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Error adding item");
    } finally {
      setIsAddingItem(false);
    }
  }

  // Filter items by search term
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.serialNumber && item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800";
      case "BORROWED":
        return "bg-blue-100 text-blue-800";
      case "DAMAGED":
        return "bg-red-100 text-red-800";
      case "DISPOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get condition badge color
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "NEW":
        return "bg-emerald-100 text-emerald-800";
      case "GOOD":
        return "bg-green-100 text-green-800";
      case "WORN_OUT":
        return "bg-yellow-100 text-yellow-800";
      case "BROKEN":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Inventory Items</h2>
        
        {user?.role === "INVENTORY_MANAGER" && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add New Item</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>
                  Enter the details for the new inventory item.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitAddItem)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter item name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DEVICE">Device</SelectItem>
                            <SelectItem value="FURNITURE">Furniture</SelectItem>
                            <SelectItem value="CLEANING_MATERIAL">Cleaning Material</SelectItem>
                            <SelectItem value="FOOD_UTENSIL">Food Utensil</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter serial number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NEW">New</SelectItem>
                            <SelectItem value="GOOD">Good</SelectItem>
                            <SelectItem value="WORN_OUT">Worn Out</SelectItem>
                            <SelectItem value="BROKEN">Broken</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isAddingItem}>
                      {isAddingItem ? "Adding..." : "Add Item"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search by name or serial number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-1/3">
          <Select 
            value={categoryFilter || ""}
            onValueChange={(value) => setCategoryFilter(value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="DEVICE">Device</SelectItem>
              <SelectItem value="FURNITURE">Furniture</SelectItem>
              <SelectItem value="CLEANING_MATERIAL">Cleaning Material</SelectItem>
              <SelectItem value="FOOD_UTENSIL">Food Utensil</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-1/3">
          <Select 
            value={statusFilter || ""}
            onValueChange={(value) => setStatusFilter(value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="BORROWED">Borrowed</SelectItem>
              <SelectItem value="DAMAGED">Damaged</SelectItem>
              <SelectItem value="DISPOSED">Disposed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Items Table */}
      <div className="rounded-md border">
        <Table>
          <TableCaption>List of inventory items</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Loading items...
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  No items found
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/dashboard/inventory/${item.id}`)}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    {item.category === "DEVICE" && "Device"}
                    {item.category === "FURNITURE" && "Furniture"}
                    {item.category === "CLEANING_MATERIAL" && "Cleaning Material"}
                    {item.category === "FOOD_UTENSIL" && "Food Utensil"}
                  </TableCell>
                  <TableCell>{item.serialNumber || "-"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status === "AVAILABLE" && "Available"}
                      {item.status === "BORROWED" && "Borrowed"}
                      {item.status === "DAMAGED" && "Damaged"}
                      {item.status === "DISPOSED" && "Disposed"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getConditionColor(item.condition)}>
                      {item.condition === "NEW" && "New"}
                      {item.condition === "GOOD" && "Good"}
                      {item.condition === "WORN_OUT" && "Worn Out"}
                      {item.condition === "BROKEN" && "Broken"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/inventory/${item.id}`);
                    }}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}