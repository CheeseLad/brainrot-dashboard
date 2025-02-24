import React, { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const ResponsiveVideoGrid = () => {
  const [videos, setVideos] = useState([]);
  const [clipName, setClipName] = useState("");
  const [videoFile, setVideoFile] = useState(null);

  // Fetch videos from the backend on mount
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch("http://localhost:5000/videos");
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  // Handle uploading a new video
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!videoFile || !clipName) {
      alert("Please provide both a clip name and video file.");
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("clip_name", clipName);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        setVideos([...videos, result.video]);
        setClipName("");
        setVideoFile(null);
      } else {
        alert("Error uploading video: " + result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  // Handle deleting a video
  const handleDelete = async (videoId) => {
    try {
      const response = await fetch(`http://localhost:5000/video/${videoId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (response.ok) {
        setVideos(videos.filter((video) => video.id !== videoId));
      } else {
        alert("Error deleting video: " + result.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Dynamically generate layouts based on the number of videos
  const generateLayouts = (videos) => {
    return {
      lg: videos.map((video, i) => {
        const cols = 4;
        const colWidth = 12 / cols;
        return {
          i: video.id.toString(),
          x: (i % cols) * colWidth,
          y: Math.floor(i / cols) * 4,
          w: colWidth,
          h: 4,
        };
      }),
      md: videos.map((video, i) => {
        const cols = 3;
        const colWidth = 12 / cols;
        return {
          i: video.id.toString(),
          x: (i % cols) * colWidth,
          y: Math.floor(i / cols) * 4,
          w: colWidth,
          h: 4,
        };
      }),
      sm: videos.map((video, i) => {
        const cols = 2;
        const colWidth = 12 / cols;
        return {
          i: video.id.toString(),
          x: (i % cols) * colWidth,
          y: Math.floor(i / cols) * 4,
          w: colWidth,
          h: 4,
        };
      }),
    };
  };

  const layouts = generateLayouts(videos);

  return (
    <div className="w-full min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Video Grid</h1>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="Clip Name"
          value={clipName}
          onChange={(e) => setClipName(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files[0])}
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Upload Video
        </button>
      </form>

      {/* Video Grid */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 12, sm: 12 }}
        rowHeight={30}
        isDraggable={true}
        isResizable={true}
        resizeHandles={["se", "sw", "ne", "nw"]}
        compactType="vertical"
      >
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded shadow overflow-hidden relative">
            <video
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
              src={video.url}
            />
            {/* Delete Button 
            <button
              onClick={() => handleDelete(video.id)}
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>*/}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default ResponsiveVideoGrid;
