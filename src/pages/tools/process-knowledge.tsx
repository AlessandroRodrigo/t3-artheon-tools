import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FileDropzone } from "~/components/file-dropzone";
import { withNavbar } from "~/components/navbar";
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

function ProcessKnowledgePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [output, setOutput] = useState<Record<string, string>[]>([]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function handleSubmit() {
    const { prompt } = form.getValues();

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("file", file);
    });

    formData.append("prompt", prompt);

    const response = await axios.post<Array<Record<string, string>>>(
      "/api/tools/process-knowledge",
      formData,
    );

    setOutput(response.data);
  }

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
          <CardTitle>Load knowledge to be processed</CardTitle>
          <CardDescription>
            First you need to load the knowledge you want to process. You can
            load multiple JSON files at once. The AI will process each item in
            the file and return a new file with the processed knowledge.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FileDropzone
            accept={{
              "application/json": [".json"],
            }}
            validate={async (file) => {
              try {
                JSON.parse(await file.text());
                return true;
              } catch (error) {
                toast.error(`The file ${file.name} is not a valid JSON file`);
                return false;
              }
            }}
            files={files}
            onChange={setFiles}
          />

          <Form {...form}>
            <form className="flex flex-col gap-4">
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
          <Button onClick={handleSubmit}>Process</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Processed knowledge</CardTitle>
            <CardDescription>
              The processed knowledge is ready to be downloaded. You can use the
              processed knowledge to train AI models or to make it more readable
              for humans.
            </CardDescription>
          </div>

          <Button asChild>
            <a
              href={`data:application/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(output, null, 2),
              )}`}
              download="processed-knowledge.json"
            >
              Download
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto whitespace-pre-wrap break-words">
            {JSON.stringify(output, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </main>
  );
}

export default withNavbar(ProcessKnowledgePage);
