import { Accordion } from "@radix-ui/react-accordion";
import axios from "axios";
import { useState } from "react";
import { FileDropzone } from "~/components/file-dropzone";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type TranscriptData = {
  fileName: string;
  transcript: string;
};

export default function TranscriptPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [transcripting, setTranscripting] = useState(false);
  const [transcriptData, setTranscriptData] = useState<TranscriptData[]>([]);

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
