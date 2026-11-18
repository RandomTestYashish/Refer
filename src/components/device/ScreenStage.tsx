import { AnimatePresence, motion } from "framer-motion";
import { SCREENS } from "@/journeys/registry";
import { useProto } from "@/store/useProto";

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-28%", opacity: dir > 0 ? 1 : 0.6 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-28%" : "100%", opacity: dir > 0 ? 0.6 : 1 }),
};

/** Renders the current screen of the active journey with push / pop transitions. */
export function ScreenStage() {
  const journey = useProto((s) => s.journey);
  const stack = useProto((s) => s.nav[s.journey]);
  const dir = useProto((s) => s.direction);
  const top = stack[stack.length - 1];
  const Comp = SCREENS[top.id] ?? SCREENS.a_home;
  const key = `${journey}:${stack.length}:${top.id}:${top.key ?? JSON.stringify(top.params ?? {})}`;

  return (
    <AnimatePresence initial={false} custom={dir} mode="sync">
      <motion.div
        key={key}
        custom={dir}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ x: { type: "tween", ease: [0.32, 0.72, 0, 1], duration: 0.38 }, opacity: { duration: 0.25 } }}
        className="absolute inset-0 bg-white"
        style={{ zIndex: stack.length, boxShadow: "-12px 0 30px rgba(0,0,0,0.06)" }}
      >
        <Comp params={top.params} />
      </motion.div>
    </AnimatePresence>
  );
}
