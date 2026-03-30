import LogOutButton from "@/components/ui/LogOutButton";
import * as motion from "motion/react-client";

import { textmotion } from "../../src/types/animation.types";

export default function ProfilePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-background to-muted/20 p-8">
      <motion.h1
        initial={textmotion.initial}
        animate={textmotion.animate}
        transition={textmotion.transition}
        className="text-5xl font-bold tracking-tight text-foreground drop-shadow-sm"
      >
        Welcome, you are logged in!
      </motion.h1>
      <LogOutButton className="mt-8" />
    </main>
  );
}
