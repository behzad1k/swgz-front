import React, { useState } from 'react';

export const useDragAndDrop = <T>(initialItems: T[]) => {
  const [items, setItems] = useState<T[]>(initialItems);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (_event: React.DragEvent, index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (_event: React.DragEvent, dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    setItems(newItems);
    setDraggedIndex(null);
  };

  return {
    items,
    setItems,
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
};

export default useDragAndDrop;