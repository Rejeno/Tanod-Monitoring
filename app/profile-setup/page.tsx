"use client";

import app from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfileSetupPage() {
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const setupProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
    // Create user doc with default role 'tanod'
    await setDoc(userRef, {
    uid: user.uid,
    displayName: user.displayName || "",
    email: user.email || "",
    role: "tanod",  // <-- assign "tanod" by default
    createdAt: new Date(),
    });
     router.push("/tanod-dashboard");  // redirect immediately to tanod dashboard
    return;
    }


      // User doc exists, check role
      const userData = userSnap.data();
      const role = userData.role;

      if (role === "admin") {
        router.push("/admin-dashboard");
      } else if (role === "tanod") {
        router.push("/tanod-dashboard");
      } else {
        router.push("/pending"); // default for unassigned or pending role
      }
    };

    setupProfile();
  }, [auth, db, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Setting up your profile...</p>
    </div>
  );
}
