import type { ComponentType } from "react";
import type { ScreenId } from "@/domain/types";
import { HomeScreen } from "./referrer/HomeScreen";
import { LandingScreen } from "./referrer/LandingScreen";
import { MilestonesScreen } from "./referrer/MilestonesScreen";
import { PermissionScreen } from "./referrer/PermissionScreen";
import { ContactsScreen } from "./referrer/ContactsScreen";
import { PreviewScreen } from "./referrer/PreviewScreen";
import { SendingScreen } from "./referrer/SendingScreen";
import { DashboardScreen } from "./referrer/DashboardScreen";
import { DetailScreen } from "./referrer/DetailScreen";
import { PendingRewardScreen } from "./referrer/PendingRewardScreen";
import { UnlockedScreen } from "./referrer/UnlockedScreen";
import { SmsScreen } from "./friend/SmsScreen";
import { AppStoreScreen } from "./friend/AppStoreScreen";
import { LaunchScreen } from "./friend/LaunchScreen";
import { InvitedScreen } from "./friend/InvitedScreen";
import { RegisterScreen } from "./friend/RegisterScreen";
import { EligibilityScreen } from "./friend/EligibilityScreen";
import { FriendHomeScreen } from "./friend/FriendHomeScreen";
import { PlansScreen } from "./friend/PlansScreen";
import { PaymentScreen } from "./friend/PaymentScreen";
import { RechargeSuccessScreen } from "./friend/RechargeSuccessScreen";
import { ReferralCompleteScreen } from "./friend/ReferralCompleteScreen";
import { FriendErrorScreen } from "./friend/FriendErrorScreen";

export type ScreenProps = { params?: Record<string, string> };

export const SCREENS: Record<ScreenId, ComponentType<ScreenProps>> = {
  a_home: HomeScreen,
  a_landing: LandingScreen,
  a_milestones: MilestonesScreen,
  a_permission: PermissionScreen,
  a_contacts: ContactsScreen,
  a_preview: PreviewScreen,
  a_sending: SendingScreen,
  a_dashboard: DashboardScreen,
  a_detail: DetailScreen,
  a_pending: PendingRewardScreen,
  a_unlocked: UnlockedScreen,
  b_sms: SmsScreen,
  b_appstore: AppStoreScreen,
  b_launch: LaunchScreen,
  b_register: RegisterScreen,
  b_invited: InvitedScreen,
  b_eligibility: EligibilityScreen,
  b_home: FriendHomeScreen,
  b_plans: PlansScreen,
  b_payment: PaymentScreen,
  b_success: RechargeSuccessScreen,
  b_complete: ReferralCompleteScreen,
  b_error: FriendErrorScreen,
};
