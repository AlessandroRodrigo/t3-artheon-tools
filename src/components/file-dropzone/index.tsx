import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

type Props = {
  onChange?: (files: File[]) => void;
};

export function FileDropzone({ onChange }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();

        reader.onabort = () => console.log("file reading was aborted");
        reader.onerror = () => console.log("file reading has failed");
        reader.onload = () => {
          // Do whatever you want with the file contents
          const binaryStr = reader.result;
          console.log(binaryStr);
        };
        reader.readAsArrayBuffer(file);

        setFiles((prevFiles) => [...prevFiles, file]);
        onChange?.([...files, file]);
      });
    },
    [files, onChange],
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    onDropRejected: () => {
      toast.error("Invalid file type", {
        description: "You need to upload a .mp4 video file.",
      });
    },
    accept: {
      "video/mp4": [".mp4"],
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-gray-500"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag and drop some video files here, or click to select files</p>
        )}
      </div>
      <Thumbs files={files} />
    </div>
  );
}

function Thumbs({ files }: { files: File[] }) {
  const fileUrls = files.map((file) => URL.createObjectURL(file));

  return (
    <div className="flex gap-2">
      {fileUrls.map((fileUrl) => (
        <video
          src={fileUrl}
          key={fileUrl}
          width={150}
          height={150}
          controls
          className="aspect-square rounded-md bg-slate-800"
        />
      ))}
    </div>
  );
}
