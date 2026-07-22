"use client";

import { useEffect } from "react";

/**
 * Warns the user (native browser dialog) before they close/refresh the tab
 * while a form has unsaved changes. In-app navigation is guarded separately
 * via an explicit confirm() in the back/cancel handlers.
 */
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}

export function confirmDiscardIfDirty(dirty: boolean): boolean {
  if (!dirty) return true;
  return window.confirm("יש שינויים שלא נשמרו. לצאת בכל זאת?");
}
