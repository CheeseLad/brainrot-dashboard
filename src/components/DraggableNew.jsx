import { useState, useEffect } from "react";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { SortableContext, rectSwappingStrategy, arrayMove } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs

const allImages = [
  "/images/fm_512.png",
  "/images/mps_512.png",
  "/images/tv_512.png",
];


export default function SortableGrid() {
  const [items, setItems] = useState([]);
  const [selectedImage, setSelectedImage] = useState(allImages[0]);
  const [maxImages, setMaxImages] = useState(12); // Default max for medium screens

  // ✅ Adjust the max images based on screen size
  /* useEffect(() => {
    const updateMaxImages = () => {
      const width = window.innerWidth;
      if (width > 1200) {
        setMaxImages(12); // Large screens (16 images max)
      } else if (width > 900) {
        setMaxImages(8); // Medium screens (12 images max)
      } else if (width > 600) {
        setMaxImages(4); // Small screens (8 images max)
      } else {
        setMaxImages(2); // Very small screens (4 images max)
      }
    };

    updateMaxImages(); // Run on mount
    window.addEventListener("resize", updateMaxImages); // Listen for screen size changes

    return () => window.removeEventListener("resize", updateMaxImages);
  }, []); */

  // ✅ Set initial images based on screen size
  useEffect(() => {
    setItems(allImages.slice(0, maxImages).map((src) => ({ id: uuidv4(), src })));
  }, [maxImages]);

  // ✅ Drag & Drop Handling (fixes swapping issue)
  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    setItems(arrayMove(items, oldIndex, newIndex));
  };

  // ✅ Fix delete function (removes item by ID)
  const handleDelete = (id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // ✅ Add Image (ensures unique ID for each instance & obeys limit)
  const handleAddImage = () => {
    if (selectedImage && items.length < maxImages) {
      setItems([...items, { id: uuidv4(), src: selectedImage }]); // Unique ID for each image
    }
  };

  return (
    <div className="relative p-4">
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={rectSwappingStrategy}>
          <div className="grid grid-cols-4 gap-4">
            {items.map(({ id, src }) => (
              <SortableItem key={id} id={id} src={src} onDelete={handleDelete} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Image Selection Dropdown & Add Button */}
      <div className="fixed bottom-6 right-6 flex gap-2">
        <select
          className="p-2 border border-gray-300 rounded shadow bg-white"
          value={selectedImage}
          onChange={(e) => setSelectedImage(e.target.value)}
        >
          {allImages.map((img, index) => (
            <option key={index} value={img}>{img}</option>
          ))}
        </select>

        <button
          onClick={handleAddImage}
          disabled={items.length >= maxImages} // ✅ Prevents adding too many images
          className={`px-4 py-2 rounded shadow-lg transition ${
            items.length >= maxImages ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Add Image
        </button>
      </div>
    </div>
  );
}