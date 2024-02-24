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

export default function TranscriptPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [transcript, setTranscript] = useState<string>("");

  async function handleTranscript() {
    if (files) {
      setTranscript("");

      const formData = new FormData();
      for (const file of files) {
        formData.append("file", file);
      }

      const response = await axios.post<string>("/api/transcript", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "json",
      });

      setTranscript(response.data);
    }
  }

  return (
    <main className="flex flex-col gap-4 p-4">
      <header>
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
        <CardContent>
          <FileDropzone
            onChange={(files: File[]) => {
              setFiles(files);
            }}
            accept={{
              "audio/*": [".mp3", ".wav", ".flac"],
            }}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleTranscript} disabled={files.length === 0}>
            Transcribe
          </Button>
        </CardFooter>
      </Card>

      {transcript && (
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
            <CardDescription>
              Here is the transcript of the audio file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{JSON.stringify(transcript, null, 2)}</p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
