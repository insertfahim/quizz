"use client";

import { useEffect } from "react";
import { useGlobalContext } from "@/context/globalContext";
import { useRouter } from "next/navigation";
import RoleSelection from "@/components/RoleSelection";
import Loader from "@/components/Loader";

export default function RoleSelectPage() {
  const { user, userRole, loading } = useGlobalContext();
  const router = useRouter();

  useEffect(() => {
    // If user already has a role, redirect them to appropriate dashboard
    if (!loading && user && userRole) {
      if (userRole === "teacher") {
        router.push("/teacher");
      } else {
        router.push("/");
      }
    }
  }, [user, userRole, loading, router]);

  if (loading) {
    return <Loader />;
  }

  // If user has no role, show role selection
  if (user && !userRole) {
    return (
      <RoleSelection
        onRoleSelected={() => {
          // Refresh the page to reload user context
          window.location.reload();
        }}
      />
    );
  }

  // If already redirecting or no user
  return <Loader />;
}