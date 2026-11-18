import { AirtelHome, PackStatusTop } from "@/components/app/AirtelHome";
import { useProto } from "@/store/useProto";

/** A01 — Referrer's Airtel home: Pack Status on top, Refer & Earn entry points throughout. */
export function HomeScreen() {
  const navigate = useProto((s) => s.navigate);
  return (
    <AirtelHome
      top={<PackStatusTop />}
      onRefer={(entry) => navigate("a_landing", { entry })}
      onMyReferrals={() => navigate("a_dashboard")}
    />
  );
}
