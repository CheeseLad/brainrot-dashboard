import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const images = [
  "https://via.placeholder.com/300x169",
  "https://via.placeholder.com/300x169/0000FF",
  "https://via.placeholder.com/300x169/008000",
  "https://via.placeholder.com/300x169/FF0000",
  "https://via.placeholder.com/300x169/FFFF00",
  "https://via.placeholder.com/300x169/FF00FF",
  "https://via.placeholder.com/300x169/00FFFF",
  "https://via.placeholder.com/300x169/808080",
  "https://via.placeholder.com/300x169/800000",
];

function DraggableImage({ src, id }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="w-full aspect-[16/9] bg-gray-200 rounded-lg overflow-hidden shadow-md cursor-grab"
    >
      <img src={src} alt="Draggable" className="w-full h-full object-cover" />
    </div>
  );
}

export default function DraggableGrid() {
  const [items, setItems] = useState(images);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-3 gap-4 p-4">
          {items.map((src, index) => (
            <DraggableImage key={src} id={src} src={src} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
