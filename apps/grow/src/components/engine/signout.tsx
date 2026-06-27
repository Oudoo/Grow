"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/engine/ui/button";
import { logoutAction } from "@/app/admin/actions";

export function SignOutButton() {
  return (
    <Button variant="ghost" size="icon" title="Sign out" onClick={() => logoutAction()}>
      <LogOut className="h-4 w-4" />
    </Button>
  );
}
