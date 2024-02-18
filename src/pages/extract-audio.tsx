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

export default function ExtractAudioPage() {
  const [files, setFiles] = useState<File[]>([]);

  async function handleConvertToMP3() {
    if (files) {
      const formData = new FormData();
      for (const file of files) {
        formData.append("file", file);
      }

      await axios
        .post("/api/extract-audio", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((data) => {
          console.log(data);
        });
    }
  }

  return (
    <main className="flex flex-col gap-4 p-4">
      <header>
        <h1 className="text-4xl font-bold">Extract Audio</h1>
        <p className="text-lg font-light text-slate-500">
          This is a page where you can extract audio from a video file.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Convert to MP3</CardTitle>
          <CardDescription>
            Select multiple MP4 files to convert to MP3.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileDropzone
            onChange={(files: File[]) => {
              setFiles(files);
            }}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleConvertToMP3} disabled={files.length === 0}>
            Convert to MP3
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
