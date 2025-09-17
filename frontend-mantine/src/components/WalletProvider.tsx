"use client";

import { ReactNode } from "react";

// Simplified wallet provider - focusing on server wallet only
// Browser wallet integration can be added later if needed
export function WalletProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
