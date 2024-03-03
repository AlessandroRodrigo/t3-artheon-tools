import { zodResolver } from "@hookform/resolvers/zod";
import { Accordion } from "@radix-ui/react-accordion";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FileDropzone } from "~/components/file-dropzone";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
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
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";

type TranscriptData = {
  fileName: string;
  transcript: string;
};

const FormSchema = z.object({
  language: z.string().optional(),
  responseFormat: z.string().optional(),
  prompt: z.string().optional(),
});

export default function TranscriptPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [transcripting, setTranscripting] = useState(false);
  const [transcriptData, setTranscriptData] = useState<TranscriptData[]>([]);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function handleTranscript() {
    if (files) {
      setTranscriptData([]);
      setTranscripting(true);

      const formData = new FormData();
      for (const file of files) {
        formData.append("file", file);
      }

      const response = await axios.post<TranscriptData[]>(
        "/api/transcript",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setTranscriptData(response.data);
      setTranscripting(false);
    }
  }

  return (
    <main className="flex flex-col gap-4 p-4">
      <header>
        <BackButton />
        <h1 className="text-4xl font-bold">Transcript Audio</h1>
        <p className="text-lg font-light text-slate-500">
          This is a page where you can transcribe audio from a file.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Transcript Audio</CardTitle>
          <CardDescription>Select an audio file to transcribe.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FileDropzone
            onChange={(files: File[]) => {
              setFiles(files);
            }}
            accept={{
              "audio/*": [".mp3", ".wav", ".flac"],
            }}
          />

          <Form {...form}>
            <form className="grid w-full grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language (optional)</FormLabel>
                    <FormDescription>
                      The language of the audio file.
                    </FormDescription>
                    <Input onChange={field.onChange} placeholder="en-US" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responseFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response format</FormLabel>
                    <FormDescription>
                      The format in which the response will be returned.
                    </FormDescription>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a response format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="json">json</SelectItem>
                        <SelectItem value="srt">srt</SelectItem>
                        <SelectItem value="txt">txt</SelectItem>
                        <SelectItem value="verbose_json">
                          verbose_json
                        </SelectItem>
                        <SelectItem value="vtt">vtt</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Prompt (optional)</FormLabel>
                    <FormDescription>
                      An optional text to guide the model&apos;s style or
                      continue a previous audio segment. The prompt should match
                      the audio language.
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
          <Button variant="outline">Clear</Button>

          <Button
            onClick={handleTranscript}
            disabled={files.length === 0}
            loading={transcripting}
          >
            Transcribe
          </Button>
        </CardFooter>
      </Card>

      {transcriptData && (
        <Card>
          <CardHeader className="sticky top-0 flex flex-row items-center justify-between bg-card">
            <div>
              <CardTitle>Transcript</CardTitle>
              <CardDescription>
                Here is the transcript of the audio file.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setTranscriptData([])}
                disabled={transcriptData.length === 0 || transcripting}
              >
                Clear
              </Button>

              <Button disabled={transcriptData.length === 0 || transcripting}>
                <a
                  href={`data:application/json,${encodeURIComponent(
                    JSON.stringify(transcriptData, null, 2),
                  )}`}
                  download="transcript.json"
                >
                  Download Transcript
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple">
              {transcriptData.map((data, index) => (
                <AccordionItem value={index.toString()} key={index}>
                  <AccordionTrigger>{data.fileName}</AccordionTrigger>
                  <AccordionContent>
                    <p>{data.transcript}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
