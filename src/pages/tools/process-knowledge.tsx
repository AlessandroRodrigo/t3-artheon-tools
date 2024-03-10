import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BackButton } from "~/components/ui/back-button";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";

const FormSchema = z.object({
  baseKnowledge: z.string(),
  prompt: z.string(),
});

export default function ProcessKnowledgePage() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  return (
    <main className="flex flex-col gap-4 p-4">
      <header>
        <BackButton />
        <h1 className="text-4xl font-bold">Process Knowledge</h1>
        <p className="text-lg font-light text-slate-500">
          Process your knowledge to make it more readable and easier to AI
          understand
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Process knowledge</CardTitle>
          <CardDescription>
            Process your knowledge to make it more readable and easier to AI
            understand
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Form {...form}>
            <form className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="baseKnowledge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base knowledge</FormLabel>
                    <FormDescription>
                      Enter the knowledge you want to process
                    </FormDescription>
                    <Textarea onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt</FormLabel>
                    <FormDescription>
                      Enter a prompt with instructions for the AI to process the
                      knowledge
                    </FormDescription>
                    <Textarea onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex items-center justify-end gap-2">
          <Button>Process</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
