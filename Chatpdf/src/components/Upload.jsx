import { useState } from "react";

function Upload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file || file.type !== "application/pdf") {
      setMessage("Please select a valid PDF file.");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const fileUrl = URL.createObjectURL(file);
        setMessage(`✓ "${file.name}" uploaded! (${data.pages} pages)`);
        onUploadSuccess(fileUrl, file.name);
      } else {
        setMessage("Upload failed: " + data.error);
      }
    } catch (error) {
      setMessage("Error connecting to server.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-xl p-6 bg-blue-50 w-full">
      <p className="text-lg font-semibold text-blue-700 mb-3">Upload your PDF</p>

      <label className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
        {uploading ? "Uploading..." : "Choose PDF"}
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      </label>

      {message && (
        <p className="mt-3 text-sm text-gray-700">{message}</p>
      )}
    </div>
  );
}

export default Upload;
