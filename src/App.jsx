import "./App.css";

import React, { useState } from "react";

import imageCompression from "browser-image-compression";

function App() {
  const [originalFile, setOriginalFile] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setOriginalFile(file);
    setCompressedFile(null);
    setOriginalSize((file.size / 1024).toFixed(2));
    setCompressedSize(null);
    setProgress(0);
  };

  const handleCompress = async () => {
    if (!originalFile) return;

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
      fileType: originalFile.type,
      onProgress: (p) => setProgress(p),
    };

    setIsCompressing(true);
    try {
      const compressed = await imageCompression(originalFile, options);
      const compressedBlobURL = URL.createObjectURL(compressed);
      setCompressedFile({
        blobURL: compressedBlobURL,
        file: compressed,
      });
      setCompressedSize((compressed.size / 1024).toFixed(2));
    } catch (err) {
      console.error("Compression error:", err);
    } finally {
      setIsCompressing(false);
    }
  };

  const getCompressionRate = () => {
    if (!originalSize || !compressedSize) return null;
    const percent = 100 - (compressedSize / originalSize) * 100;
    return percent.toFixed(2);
  };

  const getCompressedFileName = (originalName = "image.jpg") => {
    const dotIndex = originalName.lastIndexOf(".");
    if (dotIndex === -1) return originalName + "-compressed";
    const name = originalName.substring(0, dotIndex);
    const extension = originalName.substring(dotIndex);
    return `${name}-compressed${extension}`;
  };

  return (
    <div className="App">
      <h1>Image Compressor</h1>
      <div className="card">
        <p className="note">
          Allowed file types: <strong>.jpg, .jpeg, .png, .webp</strong>
        </p>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleImageUpload}
        />

        {originalFile && (
          <div className="info-box">
            <p><strong>File:</strong> {originalFile.name}</p>
            <p><strong>Original Size:</strong> {originalSize} KB</p>
          </div>
        )}

        {originalFile && (
          <button onClick={handleCompress} disabled={isCompressing}>
            {isCompressing ? "Compressing..." : "Compress Image"}
          </button>
        )}

        {isCompressing && (
          <div style={{ marginTop: "1rem", width: "100%" }}>
            <p>Progress: {progress.toFixed(0)}%</p>
            <progress value={progress} max="100" />
          </div>
        )}

        {compressedFile && (
          <div className="info-box">
            <p><strong>Compressed Size:</strong> {compressedSize} KB</p>
            <p><strong>Compression Saved:</strong> {getCompressionRate()}%</p>
            <a
              href={compressedFile.blobURL}
              download={getCompressedFileName(originalFile?.name)}
              className="download-link"
            >
              ⬇️ Download Compressed Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
