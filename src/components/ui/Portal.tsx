"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

const noop = () => () => {};

/**
 * Renders its children directly under <body> so pop-ups sit above every fixed bar and button,
 * whatever page section they were opened from. Renders nothing on the server.
 */
export function Portal({ children }: { children: ReactNode }) {
  const ready = useSyncExternalStore(noop, () => true, () => false);
  return ready ? createPortal(children, document.body) : null;
}
