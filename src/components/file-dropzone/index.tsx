import { useCallback } from "react";
import { useDropzone, type DropzoneProps } from "react-dropzone";
import { toast } from "sonner";

type Props = {
  files: File[];
  onChange?: (files: File[]) => void;
  accept: DropzoneProps["accept"];
};

export function FileDropzone({ onChange, accept, files }: Props) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onChange?.([...files, ...acceptedFiles]);
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
    accept,
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

      <div>
        {files.length} files loaded with a total size of{" "}
        {Math.round(
          files.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024),
        )}{" "}
        MB
      </div>
    </div>
  );
}

function Thumbs({ files }: { files: File[] }) {
  const fileUrls = files.map((file) => URL.createObjectURL(file));

  return (
    <div className="grid grid-cols-8 gap-4">
      {fileUrls.map((fileUrl) => (
        <video
          src={fileUrl}
          key={fileUrl}
          controls
          className="aspect-square rounded-md bg-slate-800"
        />
      ))}
    </div>
  );
}
