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

export default function ExtractAudioPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<Blob[]>([]);

  async function handleConvertToMP3() {
    if (files) {
      setConvertedFiles([]);

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

      console.log(response.data);

      setConvertedFiles((prev) => [...prev, response.data]);
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

      {convertedFiles.map((file, index) => (
        <audio key={index} controls>
          <source src={URL.createObjectURL(file)} type="audio/mp3" />
        </audio>
      ))}
    </main>
  );
}
