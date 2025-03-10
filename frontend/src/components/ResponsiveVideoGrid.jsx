import React, { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faUpload,
  faVolumeUp,
  faVolumeMute,
} from "@fortawesome/free-solid-svg-icons";

const ResponsiveGridLayout = WidthProvider(Responsive);

const ResponsiveVideoGrid = () => {
  const [allVideos, setAllVideos] = useState([]);
  const [gridVideos, setGridVideos] = useState([]);
  const [layout, setLayout] = useState([]);
  const [nextGridId, setNextGridId] = useState(0);

  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadClipName, setUploadClipName] = useState("");
  const [uploadVideoFile, setUploadVideoFile] = useState(null);

  const [allVideosMuted, setAllVideosMuted] = useState(true);
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/videos`);
      const data = await response.json();
      setAllVideos(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const handleRemoveFromGrid = (gridId) => {
    setGridVideos((prev) => prev.filter((item) => item.gridId !== gridId));
    setLayout((prevLayout) => prevLayout.filter((item) => item.i !== gridId));
  };

  const handleAddToGrid = () => {
    if (selectedVideoId) {
      const videoToAdd = allVideos.find(
        (video) => video.id.toString() === selectedVideoId
      );
      if (videoToAdd) {
        const newGridItem = {
          gridId: nextGridId.toString(),
          video: videoToAdd,
        };
        const newGridVideos = [...gridVideos, newGridItem];
        setGridVideos(newGridVideos);
        const cols = 8;
        const colWidth = 12 / cols;
        const newItemLayout = {
          i: newGridItem.gridId,
          x: ((newGridVideos.length - 1) % cols) * colWidth,
          //x: Infinity,
          y: Infinity,
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        setAllVideos([...allVideos, result.video]);
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

  const onLayoutChange = (currentLayout) => {
    setLayout(currentLayout);
  };

  const availableVideosForDropdown = allVideos;

  const handleUnmuteAll = () => {
    setAllVideosMuted((allVideosMuted) => !allVideosMuted);
  };

  const handleDeleteMode = () => {
    setDeleteMode((deleteMode) => !deleteMode);
  };

  const handleUploadModal = () => {
    setShowUploadModal((showUploadModal) => !showUploadModal);
  }

  const handleAddModal = () => {
    setShowAddDropdown((showAddDropdown) => !showAddDropdown);
  }

  return (
    <div className="w-full min-h-screen p-4 bg-gray-100 relative">
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200 }}
        cols={{ lg: 12 }}
        rowHeight={30}
        isDraggable={true}
        draggableCancel=".no-drag"
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
              muted={allVideosMuted}
              loop
              className="w-full h-full object-cover"
              src={item.video.url}
            />
            {deleteMode && (
              <button
                onClick={() => handleRemoveFromGrid(item.gridId)}
                className="no-drag absolute top-2 right-2 bg-red-500 text-white px-4 py-2 rounded z-50 cursor-pointer hover:bg-red-600"
              >
                <FontAwesomeIcon icon={faTrash} className="text-3xl" />
              </button>
            )}
          </div>
        ))}
      </ResponsiveGridLayout>

      <div className="fixed bottom-4 right-4 flex flex-col space-y-2">
        <button
          onClick={() => handleAddModal()}
          className="bg-blue-500 text-white w-16 h-16 flex items-center justify-center rounded-full shadow-lg cursor-pointer hover:bg-blue-600"
        >
          <FontAwesomeIcon icon={faPlus} className="text-3xl" />
        </button>

        <button
          onClick={() => handleUploadModal()}
          className="bg-green-500 text-white w-16 h-16 flex items-center justify-center rounded-full shadow-lg cursor-pointer hover:bg-green-600"
        >
          <FontAwesomeIcon icon={faUpload} className="text-3xl" />
        </button>

        <button
          onClick={handleUnmuteAll}
          className="bg-yellow-500 text-white w-16 h-16 flex items-center justify-center rounded-full shadow-lg cursor-pointer hover:bg-yellow-600"
        >
          {allVideosMuted ? (
            <FontAwesomeIcon icon={faVolumeMute} className="text-3xl" />
          ) : (
            <FontAwesomeIcon icon={faVolumeUp} className="text-3xl" />
          )}
        </button>

        <button
          onClick={handleDeleteMode}
          className="bg-red-500 text-white w-16 h-16 flex items-center justify-center rounded-full shadow-lg cursor-pointer hover:bg-red-600"
        >
          <FontAwesomeIcon icon={faTrash} className="text-3xl" />
        </button>
      </div>

      {showAddDropdown && (
        <div className="fixed bottom-70 right-30 bg-white shadow-lg rounded-lg p-4 w-64 border border-gray-300">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-gray-900">Add Video</h2>
          </div>
          {availableVideosForDropdown.length === 0 && (
            <p className="text-gray-900 text-sm mb-4">
              No videos available. Please upload a video first.
            </p>
            )}
          {availableVideosForDropdown.length > 0 && (
            
          <select
            value={selectedVideoId}
            onChange={(e) => setSelectedVideoId(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm mb-4 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            {availableVideosForDropdown.map((video) => (
              <option key={video.id} value={video.id}>
                {video.clip_name}
              </option>
            ))}
          </select>
          )}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddDropdown(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 cursor-pointer"
            >
              Cancel
            </button>
            {availableVideosForDropdown.length > 0 && (
            <button
              onClick={handleAddToGrid}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer"
            >
              Add
            </button>
            )}
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed bottom-10 right-30 bg-white shadow-lg rounded-lg p-4 w-64 border border-gray-300">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-gray-900">Upload Video</h2>
          </div>
          <form onSubmit={handleUpload}>
            <input
              type="text"
              placeholder="Video Name"
              value={uploadClipName}
              onChange={(e) => setUploadClipName(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-4"
            />
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setUploadVideoFile(e.target.files[0])}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-4 cursor-pointer"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 cursor-pointer"
              >
                Upload
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ResponsiveVideoGrid;
