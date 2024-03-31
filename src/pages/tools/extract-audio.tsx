import { useState } from "react";
import { FileDropzone } from "~/components/file-dropzone";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import axios from "axios";
import { BackButton } from "~/components/ui/back-button";
import { Constants } from "~/constants";
import { withNavbar } from "~/components/navbar";
import { toast } from "sonner";

function ExtractAudioPage() {
  const [files, setFiles] = useState<File[]>([]);

  async function handleConvertToMP3() {
    if (files) {
      const formData = new FormData();
      for (const file of files) {
        formData.append("file", file);
      }

      const response = await axios.post<Blob>(
        "/api/tools/extract-audio",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob",
        },
      );

      toast.success("Audio extracted successfully!", {
        dismissible: false,
        action: {
          label: "Download",
          onClick: () => {
            const url = window.URL.createObjectURL(response.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = "audio.zip";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
          },
        },
      });
    }
  }

  return (
    <main className="flex flex-col gap-4 p-4">
      <header>
        <BackButton />
        <h1 className="text-4xl font-bold">Extract Audio</h1>
        <p className="text-lg font-light text-slate-500">
          Here is where you can extract audio from video files in batch.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Extract audio from video files</CardTitle>
          <CardDescription>
            Select multiple video files to extract audio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileDropzone
            files={files}
            onChange={setFiles}
            accept={{
              "video/*": Constants.ACCEPTED_VIDEO_FORMATS,
            }}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleConvertToMP3} disabled={files.length === 0}>
            Extract audio
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

export default withNavbar(ExtractAudioPage);
