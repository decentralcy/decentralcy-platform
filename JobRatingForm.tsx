import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, Send, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Job } from "@shared/schema";

const ratingFormSchema = z.object({
  overallRating: z.number().min(1).max(5),
  qualityRating: z.number().min(1).max(5),
  communicationRating: z.number().min(1).max(5),
  timelinessRating: z.number().min(1).max(5),
  review: z.string().optional(),
  wouldHireAgain: z.boolean(),
});

type RatingFormData = z.infer<typeof ratingFormSchema>;

interface JobRatingFormProps {
  job: Job;
  raterAddress: string;
  onRatingSubmitted?: () => void;
}

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  label: string;
  description?: string;
}

function StarRating({ rating, onRatingChange, label, description }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm text-muted-foreground">{rating}/5</span>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1 hover:scale-110 transition-transform"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => onRatingChange(star)}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= (hoverRating || rating)
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function JobRatingForm({ job, raterAddress, onRatingSubmitted }: JobRatingFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<RatingFormData>({
    resolver: zodResolver(ratingFormSchema),
    defaultValues: {
      overallRating: 0,
      qualityRating: 0,
      communicationRating: 0,
      timelinessRating: 0,
      review: "",
      wouldHireAgain: false,
    },
  });

  const submitRatingMutation = useMutation({
    mutationFn: (ratingData: RatingFormData) => apiRequest("/api/job-ratings", {
      method: "POST",
      body: JSON.stringify({
        jobId: job.id,
        raterAddress,
        ratedAddress: job.workerAddress!,
        ...ratingData,
      }),
    }),
    onSuccess: () => {
      setIsSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/workers", job.workerAddress, "ratings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workers", job.workerAddress, "reputation-score"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs", job.id, "ratings"] });
      toast({
        title: "Rating Submitted Successfully",
        description: "Your feedback helps build trust in the Decentralcy community.",
      });
      onRatingSubmitted?.();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Submit Rating",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RatingFormData) => {
    submitRatingMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-2xl font-bold mb-2">Rating Submitted!</h3>
          <p className="text-muted-foreground mb-4">
            Thank you for your feedback. Your rating helps maintain quality standards on Decentralcy.
          </p>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Community Trust Builder
          </Badge>
        </CardContent>
      </Card>
    );
  }

  const watchedRatings = form.watch(["overallRating", "qualityRating", "communicationRating", "timelinessRating"]);
  const averageRating = watchedRatings.reduce((sum, rating) => sum + rating, 0) / 4;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" />
          Rate Your Experience
        </CardTitle>
        <CardDescription>
          Help build trust by rating the work quality and professionalism of{" "}
          <span className="font-medium">
            {job.workerAddress?.slice(0, 6)}...{job.workerAddress?.slice(-4)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 rounded-lg bg-muted">
          <h4 className="font-medium mb-2">{job.title}</h4>
          <p className="text-sm text-muted-foreground">{job.description}</p>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <Badge variant="outline">{job.category}</Badge>
            <span className="text-muted-foreground">Payment: {job.paymentAmount} ETH</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Overall Rating */}
            <FormField
              control={form.control}
              name="overallRating"
              render={({ field }) => (
                <FormItem>
                  <StarRating
                    rating={field.value}
                    onRatingChange={field.onChange}
                    label="Overall Experience"
                    description="How would you rate this worker overall?"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Detailed Ratings */}
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="qualityRating"
                render={({ field }) => (
                  <FormItem>
                    <StarRating
                      rating={field.value}
                      onRatingChange={field.onChange}
                      label="Work Quality"
                      description="How well did they meet your requirements?"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="communicationRating"
                render={({ field }) => (
                  <FormItem>
                    <StarRating
                      rating={field.value}
                      onRatingChange={field.onChange}
                      label="Communication"
                      description="How responsive and clear were they?"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timelinessRating"
                render={({ field }) => (
                  <FormItem>
                    <StarRating
                      rating={field.value}
                      onRatingChange={field.onChange}
                      label="Timeliness"
                      description="Did they deliver on time?"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Written Review */}
            <FormField
              control={form.control}
              name="review"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Written Review (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience working with this person. What did they do well? What could be improved?"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Would Hire Again */}
            <FormField
              control={form.control}
              name="wouldHireAgain"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-gray-300"
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    I would hire this worker again
                  </FormLabel>
                </FormItem>
              )}
            />

            {/* Rating Summary */}
            {averageRating > 0 && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Rating Preview:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(averageRating)
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold">{averageRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={submitRatingMutation.isPending || averageRating === 0}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitRatingMutation.isPending ? "Submitting..." : "Submit Rating"}
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Building Trust:</strong> Your honest feedback helps workers improve and helps employers make better hiring decisions. 
            All ratings are recorded on the blockchain for transparency.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}