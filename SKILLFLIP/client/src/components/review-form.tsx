import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, X, CheckCircle, Heart, ThumbsUp } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertReviewSchema } from "@shared/schema";
import { z } from "zod";
import { isUnauthorizedError } from "@/lib/authUtils";

const formSchema = insertReviewSchema.extend({
  rating: z.number().min(1, "Please select a rating").max(5),
});

type FormData = z.infer<typeof formSchema>;

interface ReviewFormProps {
  booking: {
    id: number;
    skill: {
      id: number;
      title: string;
      category: {
        name: string;
      };
    };
    creator: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
    };
    sessionDate: string;
    duration: number;
    totalAmount: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewForm({ booking, onClose, onSuccess }: ReviewFormProps) {
  const { toast } = useToast();
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookingId: booking.id,
      rating: 0,
      comment: "",
      isPublic: true,
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback. It helps other learners discover great creators.",
      });
      onSuccess();
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
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createReviewMutation.mutate(data);
  };

  const currentRating = form.watch("rating");
  const displayRating = hoveredRating || currentRating;

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "Select Rating";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return "text-red-500";
    if (rating === 3) return "text-yellow-500";
    if (rating === 4) return "text-blue-500";
    return "text-green-500";
  };

  const creatorName = `${booking.creator.firstName} ${booking.creator.lastName}`;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Review Your Experience</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Summary */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {booking.creator.profileImageUrl ? (
                    <img 
                      src={booking.creator.profileImageUrl} 
                      alt={creatorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-sm">
                      {booking.creator.firstName[0]}{booking.creator.lastName[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{booking.skill.title}</h3>
                  <p className="text-gray-600 text-sm">with {creatorName}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{new Date(booking.sessionDate).toLocaleDateString()}</span>
                    <span>{booking.duration} minutes</span>
                    <Badge variant="secondary">{booking.skill.category.name}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">${booking.totalAmount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Rating */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      How would you rate your experience?
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              className="p-1 hover:scale-110 transition-transform"
                              onMouseEnter={() => setHoveredRating(rating)}
                              onMouseLeave={() => setHoveredRating(0)}
                              onClick={() => field.onChange(rating)}
                            >
                              <Star
                                className={`h-8 w-8 ${
                                  rating <= displayRating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <div className={`text-lg font-medium ${getRatingColor(displayRating)}`}>
                          {getRatingText(displayRating)}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Comment */}
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Share your experience (optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell others about your learning experience. What did you like? What could be improved? Your feedback helps both the creator and future learners."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <div className="text-sm text-gray-500">
                      {field.value?.length || 0} / 500 characters
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Public Review Toggle */}
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Make this review public
                      </FormLabel>
                      <div className="text-sm text-gray-600">
                        Help other learners by sharing your experience publicly on the creator's profile
                      </div>
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

              {/* Quick Tips */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Writing a helpful review
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Describe what you learned and how the creator helped you</li>
                    <li>• Mention the creator's teaching style and communication</li>
                    <li>• Share any specific improvements you experienced</li>
                    <li>• Be honest and constructive in your feedback</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createReviewMutation.isPending || currentRating === 0}
                  className="min-w-[120px]"
                >
                  {createReviewMutation.isPending ? (
                    "Submitting..."
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
