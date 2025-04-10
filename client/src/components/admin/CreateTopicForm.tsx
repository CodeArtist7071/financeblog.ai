import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Slider 
} from "@/components/ui/slider";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Category } from "@shared/schema";
import { Loader2 } from "lucide-react";

// Form validation schema
const topicFormSchema = z.object({
  name: z.string().min(3, "Topic name must be at least 3 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  keywords: z.string().min(3, "Please enter at least one keyword"),
  tone: z.enum(["professional", "casual", "technical", "conversational", "optimistic"]),
  contentLength: z.number().min(300).max(3000),
  additionalNotes: z.string().optional(),
});

type TopicFormValues = z.infer<typeof topicFormSchema>;

// Default values for the form
const defaultValues: Partial<TopicFormValues> = {
  name: "",
  categoryId: "",
  keywords: "",
  tone: "professional",
  contentLength: 1200,
  additionalNotes: "",
};

interface CreateTopicFormProps {
  categories: Category[];
}

export function CreateTopicForm({ categories }: CreateTopicFormProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize form
  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicFormSchema),
    defaultValues,
  });

  // Create topic mutation
  const createTopicMutation = useMutation({
    mutationFn: async (data: TopicFormValues) => {
      const response = await apiRequest("POST", "/api/content-prompts", {
        name: data.name,
        categoryId: parseInt(data.categoryId),
        promptTemplate: generatePromptTemplate(data),
        // Other fields as needed by your backend
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Topic created",
        description: "Your topic has been created successfully",
      });
      // Reset form
      form.reset(defaultValues);
      // Refresh content prompts data
      queryClient.invalidateQueries({ queryKey: ["/api/content-prompts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create topic",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate a post using the topic
  const generateContentMutation = useMutation({
    mutationFn: async (data: TopicFormValues) => {
      setIsGenerating(true);
      const response = await apiRequest("POST", "/api/generate-content", {
        name: data.name,
        categoryId: parseInt(data.categoryId),
        keywords: data.keywords.split(",").map(k => k.trim()),
        tone: data.tone,
        contentLength: data.contentLength,
        additionalNotes: data.additionalNotes,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Content generated",
        description: "Your content has been generated successfully",
      });
      // Refresh posts data
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setIsGenerating(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate content",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  // Helper function to generate prompt template
  function generatePromptTemplate(data: TopicFormValues): string {
    return `Create a ${data.tone} article about ${data.name} in the financial/crypto space. 
Include keywords: ${data.keywords}. 
The article should be approximately ${data.contentLength} words in length.
${data.additionalNotes ? `Additional notes: ${data.additionalNotes}` : ""}`;
  }

  // Form submission handler
  function onSubmit(data: TopicFormValues) {
    createTopicMutation.mutate(data);
  }

  // Generate content handler
  function onGenerate() {
    const isValid = form.trigger();
    if (isValid) {
      const data = form.getValues();
      generateContentMutation.mutate(data);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Topic Information</h2>
            
            {/* Topic Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Topic Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Bitcoin Investment Strategies" {...field} />
                  </FormControl>
                  <FormDescription>
                    The main topic for the content
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Category */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Financial Categories</SelectLabel>
                        {categories.map((category) => (
                          <SelectItem 
                            key={category.id} 
                            value={category.id.toString()}
                          >
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The category this topic belongs to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Keywords */}
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., investment, crypto, blockchain, finance" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated keywords relevant to the topic
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Content Style</h2>
            
            {/* Tone */}
            <FormField
              control={form.control}
              name="tone"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Content Tone</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="professional" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Professional
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="casual" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Casual
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="technical" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Technical
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="conversational" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Conversational
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="optimistic" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Optimistic
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Content Length */}
            <FormField
              control={form.control}
              name="contentLength"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Content Length (words): {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={300}
                      max={3000}
                      step={100}
                      defaultValue={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>300</span>
                    <span>1500</span>
                    <span>3000</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Additional Notes */}
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any specific instructions or focus areas for the content"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes to guide the content generation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            onClick={onGenerate}
            disabled={createTopicMutation.isPending || isGenerating}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGenerating ? "Generating..." : "Generate Content Now"}
          </Button>
          
          <Button 
            type="submit" 
            disabled={createTopicMutation.isPending || isGenerating}
          >
            {createTopicMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Topic
          </Button>
        </div>
      </form>
    </Form>
  );
}