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

export default function ExtractAudioPage() {
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
          <FileDropzone />
        </CardContent>
        <CardFooter>
          <Button>Convert to MP3</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
