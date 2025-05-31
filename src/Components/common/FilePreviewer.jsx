import React, { useState } from "react";
import { FiEye, FiDownload, FiX } from "react-icons/fi";

const FilePreviewer = ({ filePath, apiBaseUrl }) => {
  const [showPreview, setShowPreview] = useState(false);

  if (!filePath) return <span className="text-red-400 text-xs">No URL</span>;

  const sanitizedPath = filePath.replace("/public", "");
  const fileUrl = `${apiBaseUrl}${sanitizedPath}`;
  const extension = filePath.split(".").pop().toLowerCase();

  const previewableTypes = {
    pdf: "pdf",
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    txt: "text",
    csv: "text"
  };

  const previewType = previewableTypes[extension] || "unsupported";

  const handleTogglePreview = () => setShowPreview(!showPreview);

  return (
    <div className="relative">
      <button
        onClick={handleTogglePreview}
        className="text-blue-500 hover:underline text-xs sm:text-sm flex items-center gap-1"
      >
        <FiEye size={16} /> Preview
      </button>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] p-4 overflow-auto relative">
            <button
              onClick={handleTogglePreview}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              <FiX size={20} />
            </button>

            <div className="text-center mb-4 font-medium text-gray-800">Preview - {fileUrl.split('/').pop()}</div>

            {previewType === "pdf" && (
              <iframe
                src={fileUrl}
                width="100%"
                height="600px"
                title="PDF Preview"
                className="rounded border"
              />
            )}

            {previewType === "image" && (
              <img src={fileUrl} alt="Image Preview" className="max-w-full max-h-[70vh] mx-auto" />
            )}

            {previewType === "text" && (
              <iframe
                src={fileUrl}
                title="Text File Preview"
                width="100%"
                height="400px"
                className="border rounded"
              />
            )}

            {previewType === "unsupported" && (
              <div className="text-sm text-gray-600">
                Preview not supported for this file type.{" "}
                <a href={fileUrl} download className="text-blue-500 underline flex items-center gap-1 mt-2">
                  <FiDownload size={14} /> Download instead
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilePreviewer;
