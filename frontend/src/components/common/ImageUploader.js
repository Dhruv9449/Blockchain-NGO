import { useDropzone } from "react-dropzone";
import { useCallback, useEffect } from "react";
import { uploadToImgur } from "../../services/imgur";

export function ImageUploader({
  onImageUploaded,
  currentImage,
  uploading,
  setUploading,
  placeholder = "Drop image here, paste from clipboard, or click to select",
  className = "",
}) {
  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      const imgurUrl = await uploadToImgur(file);
      onImageUploaded(imgurUrl);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles?.[0]) {
      await handleImageUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    multiple: false,
    onDrop,
  });

  // Handle clipboard paste
  useEffect(() => {
    const handlePaste = async (e) => {
      const items = e.clipboardData?.items;
      const imageItem = Array.from(items).find(
        (item) => item.type.indexOf("image") !== -1
      );

      if (imageItem) {
        const file = imageItem.getAsFile();
        await handleImageUpload(file);
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
        } hover:border-indigo-500 cursor-pointer ${className}`}
      >
        <input {...getInputProps()} />

        {currentImage ? (
          <div className="flex flex-col items-center">
            <img
              src={currentImage}
              alt="Uploaded"
              className="w-full h-48 object-contain mb-2"
              onError={(e) => {
                e.target.src = "/placeholder-image.png";
                e.target.className =
                  "w-full h-48 object-contain p-4 bg-gray-100";
              }}
            />
            <p className="text-sm text-gray-500">Click or drag to replace</p>
          </div>
        ) : (
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">{placeholder}</p>
            <p className="text-xs text-gray-500 mt-1">
              Supports: drag & drop, clipboard paste, or click to select
            </p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
          <span className="ml-2 text-sm text-gray-600">Uploading...</span>
        </div>
      )}
    </div>
  );
}
