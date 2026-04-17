import { useState } from "react";
import Upload from "./components/Upload";
import Chat from "./components/Chat";
import Quiz from "./components/Quiz";

function App() {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [changing, setChanging] = useState(false);
  const [activeTab, setActiveTab] = useState("pdf");
  const [rightTab, setRightTab] = useState("chat");

  const handleUploadSuccess = (url, name) => {
    setPdfUrl(url);
    setPdfName(name);
    setActiveTab("pdf");
    setRightTab("chat");
  };

  const handleChangePdf = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") return;

    setChanging(true);

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
        setPdfUrl(fileUrl);
        setPdfName(file.name);
        setActiveTab("pdf");
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      alert("Error connecting to server.");
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-blue-700 text-white px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">ChatPDF</h1>
        {pdfUrl && (
          <button
            onClick={() => { setPdfUrl(null); setPdfName(""); }}
            className="text-xs md:text-sm bg-white text-blue-700 px-3 md:px-4 py-1.5 rounded-lg hover:bg-blue-50 transition font-medium"
          >
            Go to Home
          </button>
        )}
      </div>

      {/* Main content */}
      {!pdfUrl ? (
        // Upload screen
        <div className="flex flex-1 items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 w-full max-w-lg">
            <div className="flex flex-col items-center mb-6 md:mb-8">
              <div className="bg-blue-100 rounded-full p-3 md:p-4 mb-3 md:mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.286 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Chat with your PDF</h2>
              <p className="text-gray-500 text-sm text-center">
                Upload any PDF document and ask questions about its content using AI
              </p>
            </div>
            <Upload onUploadSuccess={handleUploadSuccess} />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
              <span>📄 Any PDF format</span>
              <span>🤖 Powered by Gemini</span>
              <span>💬 Instant answers</span>
              <span>🧠 Auto Quiz</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile tabs — only visible on small screens */}
          <div className="flex md:hidden border-b border-gray-300 bg-white">
            <button
              onClick={() => setActiveTab("pdf")}
              className={`flex-1 py-2 text-sm font-medium transition ${
                activeTab === "pdf"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
            >
              PDF
            </button>
            <button
              onClick={() => { setActiveTab("chat"); setRightTab("chat"); }}
              className={`flex-1 py-2 text-sm font-medium transition ${
                activeTab === "chat"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => { setActiveTab("quiz"); setRightTab("quiz"); }}
              className={`flex-1 py-2 text-sm font-medium transition ${
                activeTab === "quiz"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
            >
              Quiz
            </button>
          </div>

          {/* Content area */}
          <div className="flex flex-1 overflow-hidden h-[calc(100vh-56px)] md:h-[calc(100vh-64px)]">
            {/* PDF Preview */}
            <div className={`${activeTab !== "pdf" ? "hidden" : "flex"} md:flex w-full md:w-1/2 border-r border-gray-300 flex-col bg-white`}>
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
                <span className="text-sm font-medium text-gray-600 truncate max-w-[70%]">{pdfName}</span>
                <label className="cursor-pointer text-xs text-blue-600 hover:underline whitespace-nowrap">
                  {changing ? "Uploading..." : "Change PDF"}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    disabled={changing}
                    onChange={handleChangePdf}
                  />
                </label>
              </div>
              <iframe
                src={pdfUrl}
                className="flex-1 w-full"
                title="PDF Preview"
              />
            </div>

            {/* Right panel — Chat + Quiz */}
            <div className={`${activeTab === "pdf" ? "hidden" : "flex"} md:flex w-full md:w-1/2 flex-col bg-gray-50`}>
              {/* Desktop sub-tabs */}
              <div className="hidden md:flex border-b border-gray-200 bg-white">
                <button
                  onClick={() => setRightTab("chat")}
                  className={`flex-1 py-2 text-sm font-medium transition ${
                    rightTab === "chat"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => setRightTab("quiz")}
                  className={`flex-1 py-2 text-sm font-medium transition ${
                    rightTab === "quiz"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  🧠 Quiz
                </button>
              </div>

              {/* Panel content */}
              {rightTab === "chat" ? <Chat /> : <Quiz />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
