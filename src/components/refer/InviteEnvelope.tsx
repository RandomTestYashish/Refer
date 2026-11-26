import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CardFront } from "./ReferralCard";

export type EnvelopeStage = "compose" | "sealing" | "flying";

const W = 300; // envelope width
const BODY_H = 200;
const BODY_TOP = 132; // space above the body for the open flap + presented card
const CARD_W = 236;
const FLAP_H = 112;

/**
 * Animated invitation envelope.
 * Intro (automatic): envelope enters → card is presented → card slides into the pocket → handwritten note is revealed.
 * Then the parent drives `stage`: "sealing" closes the flap and stamps the seal, "flying" sends it off.
 */
export function InviteEnvelope({
  friendName,
  referrerName,
  stage,
  onIntroDone,
  onFlown,
}: {
  friendName: string;
  referrerName: string;
  stage: EnvelopeStage;
  onIntroDone?: () => void;
  onFlown?: () => void;
}) {
  const reduce = useReducedMotion();
  // 0 entering · 1 card presented · 2 card inserted · 3 message written
  const [step, setStep] = useState(reduce ? 3 : 0);

  useEffect(() => {
    if (reduce) {
      onIntroDone?.();
      return;
    }
    const t = [setTimeout(() => setStep(1), 350), setTimeout(() => setStep(2), 1150), setTimeout(() => setStep(3), 1850), setTimeout(() => onIntroDone?.(), 3000)];
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sealed = stage !== "compose";
  const cardY = step === 0 ? -24 : step === 1 ? 14 : BODY_TOP + 26;

  return (
    <div className="relative mx-auto" style={{ width: W, height: BODY_TOP + BODY_H }} data-testid="invite-envelope" data-stage={stage} data-step={step}>
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { y: 60, opacity: 0 }}
        animate={
          stage === "flying"
            ? { x: [0, -10, 340], y: [0, 12, -320], rotate: [0, -3, -14], scale: [1, 1.02, 0.55], opacity: [1, 1, 0] }
            : { x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }
        }
        transition={stage === "flying" ? { duration: reduce ? 0.01 : 0.9, times: [0, 0.25, 1], ease: [0.5, 0, 0.75, 0] } : { type: "spring", stiffness: 180, damping: 22 }}
        onAnimationComplete={() => stage === "flying" && onFlown?.()}
      >
        {/* soft floor shadow */}
        <span className="absolute bottom-[-14px] left-[8%] h-6 w-[84%] rounded-[50%] bg-black/15 blur-[14px]" aria-hidden />

        {/* envelope back + liner */}
        <div
          className="absolute left-0 overflow-hidden rounded-[14px] border border-[#EADFD3] shadow-[0_10px_30px_rgba(73,32,20,0.12)]"
          style={{ top: BODY_TOP, width: W, height: BODY_H, background: "#FFFCF8" }}
        >
          <div
            className="absolute inset-x-0 top-0 h-[120px]"
            style={{ background: "repeating-linear-gradient(135deg,#C8102E 0 8px,#B00D27 8px 16px)", clipPath: `polygon(0 0, 100% 0, 100% 40px, 50% 100px, 0 40px)` }}
            aria-hidden
          />
        </div>

        {/* flap — behind the card while open, in front once closing */}
        <div className="absolute left-0" style={{ top: BODY_TOP, width: W, height: FLAP_H, perspective: 700, zIndex: sealed ? 30 : 1 }}>
          <motion.div
            className="relative size-full"
            style={{ transformOrigin: "50% 0%", transformStyle: "preserve-3d" }}
            initial={false}
            animate={{ rotateX: sealed ? 0 : 180 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 18 }}
          >
            <svg viewBox={`0 0 ${W} ${FLAP_H}`} className="absolute inset-0 size-full [backface-visibility:hidden]" aria-hidden>
              <path d={`M2 0 H${W - 2} L${W / 2 + 14} ${FLAP_H - 8} Q${W / 2} ${FLAP_H + 2} ${W / 2 - 14} ${FLAP_H - 8} Z`} fill="#FBF3EA" stroke="#E6D8C9" />
            </svg>
            <svg viewBox={`0 0 ${W} ${FLAP_H}`} className="absolute inset-0 size-full [backface-visibility:hidden]" style={{ transform: "rotateX(180deg)" }} aria-hidden>
              <defs>
                <pattern id="liner" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="16" height="16" fill="#B00D27" />
                  <rect width="8" height="16" fill="#C8102E" />
                </pattern>
              </defs>
              {/* drawn mirrored: after both rotations the wide edge sits on the hinge and the point faces up */}
              <path d={`M2 ${FLAP_H} H${W - 2} L${W / 2 + 14} 8 Q${W / 2} -2 ${W / 2 - 14} 8 Z`} fill="url(#liner)" />
            </svg>
          </motion.div>
        </div>

        {/* the referral card */}
        <motion.div
          className="absolute"
          style={{ left: (W - CARD_W) / 2, top: 0, zIndex: 10 }}
          initial={reduce ? false : { y: -24, opacity: 0, rotate: -4 }}
          animate={{ y: cardY, opacity: step === 0 ? 0 : 1, rotate: step === 1 ? -2 : 0 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 17 }}
        >
          <div className="rounded-[14px] shadow-[0_12px_28px_rgba(120,10,25,0.28)]">
            <CardFront width={CARD_W} shimmer={false} />
          </div>
        </motion.div>

        {/* front pocket */}
        <svg className="absolute left-0" style={{ top: BODY_TOP, zIndex: 20 }} width={W} height={BODY_H} viewBox={`0 0 ${W} ${BODY_H}`} aria-hidden>
          <defs>
            <linearGradient id="pocket" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFFDF9" />
              <stop offset="1" stopColor="#F6EDE3" />
            </linearGradient>
          </defs>
          <path d={`M0 44 L${W / 2} 104 L${W} 44 V${BODY_H - 14} Q${W} ${BODY_H} ${W - 14} ${BODY_H} H14 Q0 ${BODY_H} 0 ${BODY_H - 14} Z`} fill="url(#pocket)" stroke="#E8DCCF" />
          <path d={`M0 ${BODY_H - 4} L${W / 2 - 20} 112 M${W} ${BODY_H - 4} L${W / 2 + 20} 112`} stroke="#EDE2D6" strokeWidth="1.2" />
        </svg>

        {/* handwritten note */}
        <div className="pointer-events-none absolute inset-x-0 text-center" style={{ top: BODY_TOP + 118, zIndex: 25 }}>
          <AnimatePresence mode="wait">
            {step >= 3 && (
              <motion.div
                key={friendName}
                initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0% 0 0)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 1.15, ease: [0.45, 0, 0.25, 1] }}
                className="font-script text-[#5A1A20]"
                data-testid="envelope-message"
              >
                <p className="text-[27px] leading-[28px]">Hi {friendName},</p>
                <p className="mt-0.5 px-4 text-[20px] leading-[22px]">{referrerName} invited you to try Airtel!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* wax seal */}
        <AnimatePresence>
          {sealed && (
            <motion.div
              className="absolute flex size-[42px] items-center justify-center rounded-full"
              style={{
                left: W / 2 - 21,
                top: BODY_TOP + FLAP_H - 40,
                zIndex: 40,
                background: "radial-gradient(circle at 35% 30%,#F0475B,#B30E25 60%,#7E0716)",
                boxShadow: "0 4px 10px rgba(110,8,20,0.35), inset 0 -3px 0 rgba(0,0,0,0.15)",
              }}
              initial={reduce ? false : { scale: 1.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: reduce ? 0 : 0.35, type: "spring", stiffness: 400, damping: 18 }}
              aria-hidden
            >
              <svg viewBox="0 0 40 40" className="size-6">
                <path d="M11.5 25.5c2.2-7.6 9.8-12.6 15.2-10.2 3.9 1.8 2.6 7.4-2.4 8.8-3.1.9-5.6-.6-5-2.7.6-2 3.4-2.6 5.5-1.5" fill="none" stroke="#FFE3E7" strokeWidth="3.4" strokeLinecap="round" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* speed lines while flying */}
      <AnimatePresence>
        {stage === "flying" && !reduce && (
          <motion.div className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.8 }} aria-hidden>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute h-[2px] rounded-full bg-gradient-to-r from-transparent to-airtel-red/50"
                style={{ left: 40 + i * 30, top: BODY_TOP + 60 + i * 26, width: 90 }}
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 160, y: -160, opacity: [0, 1, 0] }}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.06 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
