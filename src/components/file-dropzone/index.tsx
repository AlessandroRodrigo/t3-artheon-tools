import { Upload } from "lucide-react";
import { useCallback } from "react";
import { useDropzone, type DropzoneProps } from "react-dropzone";
import { toast } from "sonner";

type Props = {
  files: File[];
  onChange?: (files: File[]) => void;
  validate?: (file: File) => Promise<boolean>;
  accept: DropzoneProps["accept"];
};

export function FileDropzone({ onChange, accept, files, validate }: Props) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter(
        async (file) => !(await validate?.(file)),
      );
      onChange?.([...files, ...validFiles]);
    },
    [files, onChange, validate],
  );
  const { getRootProps, getInputProps } = useDropzone({
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
          className="dark:hover:bg-bray-800 flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors duration-200 hover:border-gray-500 dark:border-gray-700 dark:hover:border-gray-500"
        >
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            <Upload className="mb-4 h-6 w-6 text-gray-500 dark:text-gray-400" />
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
