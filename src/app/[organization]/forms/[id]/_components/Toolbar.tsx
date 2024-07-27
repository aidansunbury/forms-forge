import React, { useEffect, useRef, useState } from "react";
import { useSelectedItem } from "@/app/hooks/useSelectedItem";

// Refactor this to just return the toolbar ref
// Then in the component itself, you can display the ref
// And the floating toolbar can just be fixed

export const Toolbar: React.FC = () => {
  const { selectedItemId: selectedFieldId } = useSelectedItem();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const updateToolbarPosition = () => {
    if (!selectedFieldId || !toolbarRef.current) return;

    const selectedField = document.getElementById(selectedFieldId);
    if (!selectedField) return;

    const fieldRect = selectedField.getBoundingClientRect();
    const toolbarElement = toolbarRef.current;
    toolbarRef.current.style.transition = "all 300ms ease-in-out";

    // Adjust position for large screens
    toolbarElement.style.position = "absolute";
    toolbarElement.style.top = `${fieldRect.top + window.scrollY}px`;
    toolbarElement.style.left = `${fieldRect.right + 10}px`; // 10px offset from the field
  };

  useEffect(() => {
    if (selectedFieldId) {
      updateToolbarPosition();
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }

    // Update position on scroll and resize
    const handleResize = () => {
      updateToolbarPosition();

      // Remove transition on resize
      if (toolbarRef.current) {
        toolbarRef.current.style.transition = "none";
      }
    };

    window.addEventListener("scroll", updateToolbarPosition);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", updateToolbarPosition);
      window.removeEventListener("resize", handleResize);
    };
  }, [selectedFieldId]);

  // Reapply transition when the toolbar is visible
  useEffect(() => {
    if (toolbarRef.current) {
      toolbarRef.current.style.transition = "all 300ms ease-in-out";
    }
  }, [isVisible]);

  if (!selectedFieldId) return null;

  return (
    <div ref={toolbarRef} className={`toolbar`}>
      <div className="opacity-0 lg:opacity-100">
        <h1>toolbar</h1>
      </div>{" "}
    </div>
  );
};
