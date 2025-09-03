import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, X, Upload, CheckCircle } from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertSkillSchema } from "@shared/schema";
import { z } from "zod";
import { isUnauthorizedError } from "@/lib/authUtils";

const formSchema = insertSkillSchema.extend({
  tags: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof formSchema>;

export default function ListSkill() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTag, setCurrentTag] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      categoryId: 0,
      price: "",
      duration: 60,
      sessionType: "both",
      location: "",
      mediaUrls: [],
      tags: [],
      barterAccepted: false,
    },
  });

  const createSkillMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/skills", data);
    },
    onSuccess: () => {
      toast({
        title: "Skill created successfully!",
        description: "Your skill has been submitted for review and will be live once approved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      setLocation("/dashboard");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create skill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createSkillMutation.mutate(data);
  };

  const addTag = () => {
    if (currentTag.trim() && !form.getValues("tags").includes(currentTag.trim())) {
      const currentTags = form.getValues("tags");
      form.setValue("tags", [...currentTags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Creator Benefits Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Skills & Earn Money</h1>
                <p className="text-gray-600 text-lg">
                  Turn your expertise into a profitable side business. Join thousands of creators earning on SkillFlip.
                </p>
              </div>
              
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-accent mb-1">75%</div>
                  <div className="text-sm text-gray-600">You Keep</div>
                </div>
                <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-accent mb-1">$40+</div>
                  <div className="text-sm text-gray-600">Avg Per Hour</div>
                </div>
                <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-accent mb-1">24hrs</div>
                  <div className="text-sm text-gray-600">Quick Approval</div>
                </div>
                <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-accent mb-1">4.9★</div>
                  <div className="text-sm text-gray-600">Creator Rating</div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center bg-white rounded-lg p-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Set your own rates</span>
                </div>
                <div className="flex items-center justify-center bg-white rounded-lg p-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Flexible scheduling</span>
                </div>
                <div className="flex items-center justify-center bg-white rounded-lg p-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Secure payments</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Skill Listing</h2>
          <p className="text-gray-600">
            Fill out the details below to list your skill. Your listing will be reviewed and go live within 24 hours.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Beginner Guitar Lessons" 
                          {...field} 
                        />
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
                        <Input 
                          placeholder="A brief, catchy description of your skill"
                          {...field} 
                        />
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
                      <FormLabel>Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide a detailed description of what students will learn, your teaching approach, and any prerequisites..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        value={field.value?.toString() || ""} 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing & Duration */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Duration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="45"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="60"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="barterAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Accept Barter</FormLabel>
                        <p className="text-sm text-gray-600">
                          Allow students to propose skill exchanges instead of payment
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Session Details */}
            <Card>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="sessionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="virtual">Virtual Only</SelectItem>
                          <SelectItem value="in-person">In-Person Only</SelectItem>
                          <SelectItem value="both">Both Virtual & In-Person</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (for in-person sessions)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., San Francisco, CA or Your Studio Address"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Tags & Media */}
            <Card>
              <CardHeader>
                <CardTitle>Tags & Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <FormLabel>Skill Tags</FormLabel>
                  <div className="flex gap-2 mt-2 mb-4">
                    <Input
                      placeholder="Add a tag (e.g., beginner, advanced, technique)"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.watch("tags").map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <FormLabel>Media Upload</FormLabel>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Upload photos or videos of your work (optional)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Media files help students understand what they'll learn
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">Review Process</h3>
                    <p className="text-sm text-blue-800">
                      Your skill will be reviewed by our team within 24-48 hours. You'll receive an email 
                      notification once it's approved and live on the platform. You'll earn 75% of each booking.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation("/dashboard")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="px-8"
                disabled={createSkillMutation.isPending}
              >
                {createSkillMutation.isPending ? "Creating..." : "Submit for Review"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <Footer />
    </div>
  );
}
