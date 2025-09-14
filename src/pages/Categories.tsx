import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAppContext } from "@/context/AppContext";
import { Category } from "@/types";
import { Plus, MoreHorizontal, Edit, Trash2, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

const Categories = () => {
  const { state, dispatch } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    isActive: true
  });

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', 
    '#EF4444', '#06B6D4', '#F97316', '#84CC16',
    '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
  ];

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      isActive: category.isActive
    });
    setShowForm(true);
  };

  const handleDelete = (categoryId: string) => {
    // Check if category is being used in budgets or expenses
    const usedInBudgets = state.budgets.some(b => b.category === state.categories.find(c => c.id === categoryId)?.name);
    const usedInExpenses = state.expenses.some(e => e.category === state.categories.find(c => c.id === categoryId)?.name);
    
    if (usedInBudgets || usedInExpenses) {
      toast({
        title: "Cannot delete category",
        description: "This category is being used in budgets or expenses.",
        variant: "destructive"
      });
      return;
    }

    const categories = state.categories.filter(c => c.id !== categoryId);
    dispatch({ type: 'SET_CATEGORIES', payload: categories });
    toast({
      title: "Category deleted",
      description: "The category has been removed successfully.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const category: Category = {
      id: editingCategory?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      color: formData.color,
      isActive: formData.isActive
    };

    if (editingCategory) {
      const categories = state.categories.map(c => c.id === category.id ? category : c);
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
      toast({
        title: "Category updated",
        description: "The category has been updated successfully.",
      });
    } else {
      dispatch({ type: 'ADD_CATEGORY', payload: category });
      toast({
        title: "Category created",
        description: "The new category has been created successfully.",
      });
    }

    setShowForm(false);
    setEditingCategory(undefined);
    setFormData({ name: '', description: '', color: '#3B82F6', isActive: true });
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "Category Name",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full border" 
              style={{ backgroundColor: category.color }}
            />
            <span className="font-medium">{category.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return description ? (
          <div className="max-w-[300px] truncate text-muted-foreground">
            {description}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "color",
      header: "Color",
      cell: ({ row }) => {
        const color = row.getValue("color") as string;
        return (
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded border shadow-sm" 
              style={{ backgroundColor: color }}
            />
            <code className="text-xs text-muted-foreground font-mono">
              {color}
            </code>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "usage",
      header: "Usage",
      cell: ({ row }) => {
        const category = row.original;
        const budgetCount = state.budgets.filter(b => b.category === category.name).length;
        const expenseCount = state.expenses.filter(e => e.category === category.name).length;
        
        return (
          <div className="text-sm text-muted-foreground">
            {budgetCount} budgets, {expenseCount} expenses
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const category = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEdit(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Category
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(category.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Category Management</h1>
          <p className="text-muted-foreground animate-fade-in">
            Organize your budgets and expenses with custom categories.
          </p>
        </div>
        
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="gap-2 animate-bounce-gentle">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Marketing"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Marketing and advertising expenses"
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <div className="flex flex-wrap gap-1">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform"
                        style={{ 
                          backgroundColor: color,
                          borderColor: formData.color === color ? '#000' : 'transparent'
                        }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active Category</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={state.categories}
        searchKey="name"
        searchPlaceholder="Search categories..."
      />
    </div>
  );
};

export default Categories;