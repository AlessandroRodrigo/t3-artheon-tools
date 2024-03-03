import { File } from "lucide-react";
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
        className="flex w-full items-center justify-center"
      >
        <label
          htmlFor="dropzone-file"
          className="dark:hover:bg-bray-800 flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        >
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            <svg
              className="mb-3 h-10 w-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              .mp4 files only
            </p>
          </div>
          <input {...getInputProps()} />
        </label>
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
