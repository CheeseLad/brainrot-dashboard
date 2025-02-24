import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItem({ id, src, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="relative w-full aspect-[16/9] rounded-lg overflow-hidden cursor-grab group"
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {/* Image */}
      <img
        src={src}
        alt="sortable"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Bigger Delete Button */}
      <button
        onClick={(event) => {
          event.stopPropagation(); // Prevents drag from interfering with click
          onDelete(id);
        }}
        className="cursor-pointer absolute top-2 right-2 bg-red-500 text-white px-4 py-2 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition transform hover:scale-110 pointer-events-auto"
      >
        ✕
      </button>
    </div>
  );
}
