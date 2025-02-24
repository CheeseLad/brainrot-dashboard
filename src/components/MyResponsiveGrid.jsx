import React, { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faUpload  } from '@fortawesome/free-solid-svg-icons'

const ResponsiveGridLayout = WidthProvider(Responsive);

const ResponsiveVideoGrid = () => {
  // allVideos holds videos from the DB; gridVideos holds items currently shown in the grid.
  // Each grid item has a unique gridId.
  const [allVideos, setAllVideos] = useState([]);
  const [gridVideos, setGridVideos] = useState([]); // items: { gridId, video }
  const [layout, setLayout] = useState([]); // layout items for current breakpoint
  const [nextGridId, setNextGridId] = useState(0);

  // UI state for the dropdown and upload modal
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadClipName, setUploadClipName] = useState("");
  const [uploadVideoFile, setUploadVideoFile] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  // Fetch videos from the backend; grid remains empty initially.
  const fetchVideos = async () => {
    try {
      const response = await fetch("http://localhost:5000/videos");
      const data = await response.json();
      setAllVideos(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  // Remove grid item (only removes it from the grid view, not the DB)
  const handleRemoveFromGrid = (gridId) => {
    setGridVideos((prev) => prev.filter((item) => item.gridId !== gridId));
    setLayout((prevLayout) => prevLayout.filter((item) => item.i !== gridId));
  };

  // Add a video to the grid from the dropdown (duplicates allowed)
  const handleAddToGrid = () => {
    if (selectedVideoId) {
      const videoToAdd = allVideos.find(
        (video) => video.id.toString() === selectedVideoId
      );
      if (videoToAdd) {
        const newGridItem = { gridId: nextGridId.toString(), video: videoToAdd };
        const newGridVideos = [...gridVideos, newGridItem];
        setGridVideos(newGridVideos);
        // Create a default layout for this new grid item.
        const cols = 4; // for lg breakpoint
        const colWidth = 12 / cols;
        const newItemLayout = {
          i: newGridItem.gridId,
          x: ((newGridVideos.length - 1) % cols) * colWidth,
          y: Infinity, // pushes item to the bottom
          w: colWidth,
          h: 4,
        };
        setLayout([...layout, newItemLayout]);
        setNextGridId(nextGridId + 1);
      }
    }
    setSelectedVideoId("");
    setShowAddDropdown(false);
  };

  // Handle uploading a video to the DB.
  // Note: After upload, we update allVideos but do not modify gridVideos.
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadVideoFile || !uploadClipName) {
      alert("Please provide both a clip name and video file.");
      return;
    }

    const formData = new FormData();
    formData.append("video", uploadVideoFile);
    formData.append("clip_name", uploadClipName);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        // Update the global video list but leave the current grid unchanged.
        setAllVideos([...allVideos, result.video]);
        // Close the upload modal without altering the grid view.
        setUploadClipName("");
        setUploadVideoFile(null);
        setShowUploadModal(false);
      } else {
        alert("Error uploading video: " + result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  // Update layout state on changes (drag, resize)
  const onLayoutChange = (currentLayout) => {
    setLayout(currentLayout);
  };

  // All videos available for adding to grid (duplicates allowed)
  const availableVideosForDropdown = allVideos;

  return (
    <div className="w-full min-h-screen p-4 bg-gray-100 relative">
      {/*<h1 className="text-2xl font-bold mb-4">Video Grid</h1>*/}
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200 }}
        cols={{ lg: 12 }}
        rowHeight={30}
        isDraggable={true}
        isResizable={true}
        resizeHandles={["se", "sw", "ne", "nw"]}
        compactType="vertical"
        onLayoutChange={onLayoutChange}
      >
        {gridVideos.map((item) => (
          <div
            key={item.gridId}
            className="bg-white rounded shadow overflow-hidden relative"
          >
            <video
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
              src={item.video.url}
            />
            <button
              onClick={() => handleRemoveFromGrid(item.gridId)}
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
            >
              Remove
            </button>
          </div>
        ))}
      </ResponsiveGridLayout>

      {/* Fixed icons in the bottom right */}
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2">
        <button
          onClick={() => setShowAddDropdown(true)}
          className="bg-blue-500 text-white p-4 m-3 rounded-full shadow-lg"
        >
          <FontAwesomeIcon icon={faPlus} className="text-3xl" />
        </button>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-green-500 text-white p-4 m-3 rounded-full shadow-lg"
        >
          <FontAwesomeIcon icon={faUpload} className="text-3xl" />
        </button>
      </div>

      {/* Dropdown modal for adding a video to the grid */}
      {showAddDropdown && (
        <div className="absolute bottom-20 right-4 bg-white shadow-lg rounded p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold">Select Video</h2>
            <button
              onClick={() => setShowAddDropdown(false)}
              className="text-gray-500 text-xl"
            >
              &times;
            </button>
          </div>
          <select
            value={selectedVideoId}
            onChange={(e) => setSelectedVideoId(e.target.value)}
            className="border p-2 mb-2 w-full"
          >
            <option value="">--Select a video--</option>
            {availableVideosForDropdown.map((video) => (
              <option key={video.id} value={video.id}>
                {video.clip_name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddToGrid}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Add
          </button>
        </div>
      )}

      {/* Upload modal for uploading video to DB */}
      {showUploadModal && (
        <div className="absolute bottom-20 right-4 bg-white shadow-lg rounded p-4">
          <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold">Upload Video</h2>
          </div>
          <div>
            <form onSubmit={handleUpload}>
              <input
                type="text"
                placeholder="Clip Name"
                value={uploadClipName}
                onChange={(e) => setUploadClipName(e.target.value)}
                className="border p-2 w-full mb-4"
              />
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setUploadVideoFile(e.target.files[0])}
                className="border p-2 w-full mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveVideoGrid;
