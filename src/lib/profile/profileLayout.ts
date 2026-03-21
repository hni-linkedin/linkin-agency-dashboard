import type { CSSProperties } from "react";

/** ~max-w-5xl: keeps profile readable on ultra-wide viewports */
export const PROFILE_PAGE_SHELL: CSSProperties = {
  width: "100%",
  maxWidth: "min(64rem, 100%)",
  marginInline: "auto",
};
