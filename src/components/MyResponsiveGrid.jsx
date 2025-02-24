import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Array of video items (you can add more items as needed)
const videos = [
  { id: "0", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: "1", src: "https://www.w3schools.com/html/movie.mp4" },
  { id: "2", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: "3", src: "https://www.w3schools.com/html/movie.mp4" },
  { id: "4", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: "5", src: "https://www.w3schools.com/html/movie.mp4" },
  { id: "6", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: "7", src: "https://www.w3schools.com/html/movie.mp4" },
  { id: "8", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: "9", src: "https://www.w3schools.com/html/movie.mp4" },
  { id: "10", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: "11", src: "https://www.w3schools.com/html/movie.mp4" },
  { id: "12", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: "13", src: "https://www.w3schools.com/html/movie.mp4" },
  { id: "14", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: "15", src: "https://www.w3schools.com/html/movie.mp4" },
  // Add additional video objects here...
];

// Dynamically generate layouts for different breakpoints
const generateLayouts = (videos) => {
  return {
    lg: videos.map((video, i) => {
      const cols = 4;
      const colWidth = 12 / cols;
      return {
        i: video.id,
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
        i: video.id,
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
        i: video.id,
        x: (i % cols) * colWidth,
        y: Math.floor(i / cols) * 4,
        w: colWidth,
        h: 4,
      };
    }),
  };
};

const ResponsiveVideoGrid = () => {
  const layouts = generateLayouts(videos);

  // onDrop callback to handle external drops (if needed)
  const handleDrop = (layout, layoutItem, event) => {
    console.log("Item dropped:", layoutItem);
    // You can add logic here to add a new video based on event data.
  };

  return (
    <div className="w-full min-h-screen p-4 bg-gray-100">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 12, sm: 12 }}
        rowHeight={30}
        isDraggable={true}
        isResizable={true}
        resizeHandles={["se", "sw", "ne", "nw"]}  
        isDroppable={true}                  
        onDrop={handleDrop}                   
        compactType="vertical"           
      >
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded shadow overflow-hidden">
            <video
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
              src={video.src}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default ResponsiveVideoGrid;