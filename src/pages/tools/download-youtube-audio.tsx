import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@radix-ui/react-select";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
  urls: z.string(),
});

function DownloadYoutubeAudioPage() {
  const [resultFiles, setResultFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function handleSubmit() {
    const { urls } = form.getValues();
    const parsedUrls = urls.split(",").map((url) => url?.trim());

    const response = await axios.post<Blob>(
      "/api/tools/download-youtube-audio",
      {
        urls: parsedUrls,
      },
      {
        responseType: "blob",
      },
    );

    const file = new File([response.data], "audio.mp3", {
      type: "audio/mp3",
    });

    setResultFiles([file]);
  }

  return (
    <main className="flex flex-col gap-4 p-4">
      <header>
        <BackButton />
        <h1 className="text-4xl font-bold">Extract Youtube Audio</h1>
        <p className="text-lg font-light text-slate-500">
          Extract audio from Youtube videos
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Extract audio from Youtube videos</CardTitle>
          <CardDescription>
            Extract audio from Youtube videos by pasting the videos URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="urls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Youtube videos URL</FormLabel>
                    <FormDescription>
                      Paste the URL of the Youtube videos you want to extract
                      audio from (separator by comma)
                    </FormDescription>
                    <Textarea onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button
            disabled={!form.formState.isValid}
            loading={form.formState.isSubmitting}
            onClick={form.handleSubmit(handleSubmit)}
          >
            Extract audio
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Download audio</CardTitle>
          <CardDescription>
            Download the extracted audio from the Youtube videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 gap-4">
            {resultFiles.map((file) => (
              <li key={file.name}>
                <audio
                  controls
                  src={URL.createObjectURL(file)}
                  style={{ width: "100%" }}
                />

                <a href={URL.createObjectURL(file)} download={file.name}>
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}

export default withNavbar(DownloadYoutubeAudioPage);
