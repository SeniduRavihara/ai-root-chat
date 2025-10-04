import * as React from "react";

export interface ToastProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export interface ToastActionElement {
  altText?: string;
  action?: React.ReactNode;
}

export interface ToastProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function Toast({ children, ...props }: ToastProps) {
  return <div {...props}>{children}</div>;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function ToastViewport({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
