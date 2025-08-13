import React from "react";
import { cn } from "../../lib/utils";

export const UnorderedList = ({ children, className = "", size = "sm" }) => {
  return (
    <ul className={cn(
      "text-gray-300 ml-4",
      size === "sm" ? "text-sm" : "text-base",
      // default spacing between items; can be overridden via className
      "space-y-2",
      className
    )}>
      {children}
    </ul>
  );
};

export const ListItem = ({ children, className = "" }) => {
  return (
    <li className={cn("flex items-start gap-2", className)}>
      <span className="leading-6 text-gray-300">•</span>
      <span className="flex-1">{children}</span>
    </li>
  );
};

export default {
  UnorderedList,
  ListItem,
};