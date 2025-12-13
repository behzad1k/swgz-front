// src/hooks/useDragAndDrop.ts
import React, { useState, useRef } from 'react';

export const useDragAndDrop = <T>(initialItems: T[]) => {
  const [items, setItems] = useState<T[]>(initialItems);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null);
  const touchStartY = useRef<number>(0);
  const currentTouchY = useRef<number>(0);

  // Desktop drag handlers
  const handleDragStart = (event: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event: React.DragEvent, dropIndex: number) => {
    event.preventDefault();
    event.stopPropagation();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    setItems(newItems);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Mobile touch handlers
  const handleTouchStart = (event: React.TouchEvent, index: number) => {
    setTouchDragIndex(index);
    touchStartY.current = event.touches[0].clientY;
    currentTouchY.current = event.touches[0].clientY;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (touchDragIndex === null) return;

    // Prevent scrolling while dragging
    event.preventDefault();
    currentTouchY.current = event.touches[0].clientY;
  };

  const handleTouchEnd = (event: React.TouchEvent, dropIndex: number) => {
    if (touchDragIndex === null) return;

    // Calculate which item we're dropping on based on touch position
    const target = document.elementFromPoint(
      event.changedTouches[0].clientX,
      event.changedTouches[0].clientY
    );

    const songItem = target?.closest('[data-song-index]');
    const finalDropIndex = songItem
      ? parseInt(songItem.getAttribute('data-song-index') || String(dropIndex))
      : dropIndex;

    if (touchDragIndex !== finalDropIndex) {
      const newItems = [...items];
      const draggedItem = newItems[touchDragIndex];
      newItems.splice(touchDragIndex, 1);
      newItems.splice(finalDropIndex, 0, draggedItem);
      setItems(newItems);
    }

    setTouchDragIndex(null);
    touchStartY.current = 0;
    currentTouchY.current = 0;
  };

  return {
    items,
    setItems,
    draggedIndex,
    touchDragIndex,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};

export default useDragAndDrop;
