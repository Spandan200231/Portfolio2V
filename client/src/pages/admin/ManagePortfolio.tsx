import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPortfolioItemSchema } from "@shared/schema";
import { Plus, Edit, Trash2, ExternalLink, ArrowLeft } from "lucide-react";
import type { PortfolioItem, InsertPortfolioItem } from "@shared/schema";

export default function ManagePortfolio() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: portfolioItems = [], isLoading } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/admin/portfolio"],
  });

  const form = useForm<InsertPortfolioItem>({
    resolver: zodResolver(insertPortfolioItemSchema),
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      imageUrl: "",
      technologies: [],
      projectUrl: "",
      githubUrl: "",
      content: "",
      featured: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertPortfolioItem) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "technologies") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value?.toString() || "");
        }
      });
      
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const response = await fetch("/api/admin/portfolio", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create portfolio item");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Portfolio item created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio"] });
      setDialogOpen(false);
      form.reset();
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertPortfolioItem> }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "technologies") {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const response = await fetch(`/api/admin/portfolio/${id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update portfolio item");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Portfolio item updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio"] });
      setDialogOpen(false);
      setEditingItem(null);
      form.reset();
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/portfolio/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Portfolio item deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPortfolioItem) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (item: PortfolioItem) => {
    setEditingItem(item);
    form.reset({
      title: item.title,
      description: item.description,
      shortDescription: item.shortDescription || "",
      imageUrl: item.imageUrl || "",
      technologies: item.technologies || [],
      projectUrl: item.projectUrl || "",
      githubUrl: item.githubUrl || "",
      content: item.content || "",
      featured: item.featured || false,
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    form.reset();
    setSelectedFile(null);
    setDialogOpen(true);
  };

  const handleTechnologiesChange = (value: string) => {
    const technologies = value.split(",").map(tech => tech.trim()).filter(Boolean);
    form.setValue("technologies", technologies);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Manage Portfolio</h1>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Portfolio Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Portfolio Item" : "Add Portfolio Item"}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Project title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description for cards" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Detailed project description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Technologies (comma-separated)
                    </label>
                    <Input
                      placeholder="React, TypeScript, Node.js"
                      defaultValue={form.getValues("technologies")?.join(", ")}
                      onChange={(e) => handleTechnologiesChange(e.target.value)}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="projectUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="githubUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/user/repo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detailed Content (HTML)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed project content with HTML"
                            rows={6}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FileUpload
                    onFileSelect={setSelectedFile}
                    label="Project Image"
                    accept="image/*"
                    maxSize={5}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingItem ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.imageUrl && (
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{item.title}</span>
                  {item.featured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {item.shortDescription || item.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {item.technologies?.slice(0, 3).map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {item.technologies && item.technologies.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.technologies.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(item.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {item.projectUrl && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={item.projectUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {portfolioItems.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">No portfolio items yet</h3>
              <p className="text-gray-600 mb-4">
                Start by adding your first portfolio item to showcase your work.
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Portfolio Item
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
