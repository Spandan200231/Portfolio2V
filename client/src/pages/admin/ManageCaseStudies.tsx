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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCaseStudySchema } from "@shared/schema";
import { Plus, Edit, Trash2, ArrowLeft, Star } from "lucide-react";
import type { CaseStudy, InsertCaseStudy } from "@shared/schema";

export default function ManageCaseStudies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudy, setEditingStudy] = useState<CaseStudy | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: caseStudies = [], isLoading } = useQuery<CaseStudy[]>({
    queryKey: ["/api/admin/case-studies"],
  });

  const form = useForm<InsertCaseStudy>({
    resolver: zodResolver(insertCaseStudySchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      imageUrl: "",
      tags: [],
      clientName: "",
      projectDuration: "",
      outcome: "",
      featured: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCaseStudy) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "tags") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value?.toString() || "");
        }
      });
      
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const response = await fetch("/api/admin/case-studies", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create case study");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Case study created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCaseStudy> }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "tags") {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const response = await fetch(`/api/admin/case-studies/${id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update case study");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Case study updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
      setDialogOpen(false);
      setEditingStudy(null);
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
      await apiRequest("DELETE", `/api/admin/case-studies/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Case study deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCaseStudy) => {
    if (editingStudy) {
      updateMutation.mutate({ id: editingStudy.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (study: CaseStudy) => {
    setEditingStudy(study);
    form.reset({
      title: study.title,
      excerpt: study.excerpt,
      content: study.content,
      imageUrl: study.imageUrl || "",
      tags: study.tags || [],
      clientName: study.clientName || "",
      projectDuration: study.projectDuration || "",
      outcome: study.outcome || "",
      featured: study.featured || false,
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingStudy(null);
    form.reset();
    setSelectedFile(null);
    setDialogOpen(true);
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(",").map(tag => tag.trim()).filter(Boolean);
    form.setValue("tags", tags);
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
            <h1 className="text-2xl font-semibold">Manage Case Studies</h1>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Case Study
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingStudy ? "Edit Case Study" : "Add Case Study"}
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
                          <Input placeholder="Case study title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief summary for the case study card" {...field} />
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
                        <FormLabel>Content (HTML)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Full case study content with HTML formatting"
                            rows={8}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Client or company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="projectDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Duration</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 3 months" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tags (comma-separated)
                    </label>
                    <Input
                      placeholder="UX Research, Design System, Performance"
                      defaultValue={form.getValues("tags")?.join(", ")}
                      onChange={(e) => handleTagsChange(e.target.value)}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="outcome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Outcome</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Project outcomes and results"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Featured Case Study
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Mark this case study as featured to highlight it
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FileUpload
                    onFileSelect={setSelectedFile}
                    label="Case Study Image"
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
                      {editingStudy ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {caseStudies.map((study) => (
            <Card key={study.id} className="overflow-hidden">
              {study.imageUrl && (
                <img 
                  src={study.imageUrl} 
                  alt={study.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{study.title}</span>
                  <div className="flex items-center space-x-2">
                    {study.featured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {study.excerpt}
                </p>
                
                {(study.clientName || study.projectDuration) && (
                  <div className="text-xs text-gray-500 mb-4 space-y-1">
                    {study.clientName && <div>Client: {study.clientName}</div>}
                    {study.projectDuration && <div>Duration: {study.projectDuration}</div>}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {study.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {study.tags && study.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{study.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(study)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(study.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {new Date(study.createdAt!).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {caseStudies.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">No case studies yet</h3>
              <p className="text-gray-600 mb-4">
                Start by adding your first case study to showcase your detailed project work.
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Case Study
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
