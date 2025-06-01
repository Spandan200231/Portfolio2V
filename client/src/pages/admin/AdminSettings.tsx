import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Globe } from "lucide-react";
import type { AdminSettings } from "@shared/schema";

const personalInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  resumeUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery<AdminSettings[]>({
    queryKey: ["/api/admin/settings"],
  });

  // Convert settings array to object for easier access
  const settingsMap = settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value || "";
    return acc;
  }, {} as Record<string, string>);

  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: settingsMap.name || "Spandan Majumder",
      email: settingsMap.email || "contact@spandanmajumder.com",
      phone: settingsMap.phone || "+1 (555) 123-4567",
      location: settingsMap.location || "New York, NY",
      bio: settingsMap.bio || "",
      resumeUrl: settingsMap.resumeUrl || "",
      linkedinUrl: settingsMap.linkedinUrl || "",
      githubUrl: settingsMap.githubUrl || "",
      twitterUrl: settingsMap.twitterUrl || "",
    },
  });

  // Update form values when settings load
  useState(() => {
    if (settings.length > 0) {
      form.reset({
        name: settingsMap.name || "Spandan Majumder",
        email: settingsMap.email || "contact@spandanmajumder.com",
        phone: settingsMap.phone || "+1 (555) 123-4567",
        location: settingsMap.location || "New York, NY",
        bio: settingsMap.bio || "",
        resumeUrl: settingsMap.resumeUrl || "",
        linkedinUrl: settingsMap.linkedinUrl || "",
        githubUrl: settingsMap.githubUrl || "",
        twitterUrl: settingsMap.twitterUrl || "",
      });
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: PersonalInfoFormData) => {
      // Update each setting individually
      const promises = Object.entries(data).map(([key, value]) =>
        apiRequest("PUT", "/api/admin/settings", { key, value: value || "" })
      );
      
      await Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PersonalInfoFormData) => {
    updateSettingsMutation.mutate(data);
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
            <h1 className="text-2xl font-semibold">Admin Settings</h1>
          </div>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Personal Information
              </CardTitle>
              <p className="text-sm text-gray-600">
                Update your personal information displayed on the portfolio
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input className="pl-10" placeholder="your@email.com" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input className="pl-10" placeholder="+1 (555) 123-4567" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input className="pl-10" placeholder="City, Country" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell visitors about yourself..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Globe className="mr-2 h-5 w-5" />
                      Social Links
                    </h3>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="resumeUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resume URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/resume.pdf" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="linkedinUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
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
                              <Input placeholder="https://github.com/yourusername" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="twitterUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://twitter.com/yourusername" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      disabled={updateSettingsMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Additional Settings Cards */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <p className="text-sm text-gray-600">
                Manage your account and access
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Export Data</h4>
                    <p className="text-sm text-gray-600">
                      Download all your portfolio data
                    </p>
                  </div>
                  <Button variant="outline">
                    Export
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Logout</h4>
                    <p className="text-sm text-gray-600">
                      Sign out of the admin panel
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/logout", { method: "POST" });
                        if (response.ok) {
                          window.location.href = "/";
                        }
                      } catch (error) {
                        console.error("Logout failed:", error);
                      }
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
