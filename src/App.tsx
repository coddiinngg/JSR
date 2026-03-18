import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Onboarding } from "./pages/Onboarding";
import { Home } from "./pages/Home";
import { GoalsList } from "./pages/GoalsList";
import { GoalDetail } from "./pages/GoalDetail";
import { Category } from "./pages/goal-setting/Category";
import { GoalFrequency } from "./pages/goal-setting/GoalFrequency";
import { GoalCoach } from "./pages/goal-setting/GoalCoach";
import { GoalName } from "./pages/goal-setting/GoalName";
import { Camera } from "./pages/verify/Camera";
import { Upload } from "./pages/verify/Upload";
import { Success } from "./pages/Success";
import { Stats } from "./pages/Stats";
import { Profile } from "./pages/Profile";
import { EditProfile } from "./pages/EditProfile";
import { NotificationSettings } from "./pages/NotificationSettings";
import { Challenge } from "./pages/Challenge";
import { GroupDetail } from "./pages/challenge/GroupDetail";
import { CreateGroup } from "./pages/challenge/CreateGroup";
import { Ranking } from "./pages/Ranking";
import { Gallery } from "./pages/Gallery";
import { Rewards } from "./pages/Rewards";
import { Notifications } from "./pages/Notifications";
import { WeeklyReport } from "./pages/WeeklyReport";
import { CoachChat } from "./pages/CoachChat";
import { FriendInvite } from "./pages/FriendInvite";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 바텀 네비 없는 단독 페이지 */}
        <Route element={<Layout showNav={false} />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/goal-setting/category" element={<Category />} />
          <Route path="/goal-setting/frequency" element={<GoalFrequency />} />
          <Route path="/goal-setting/coach" element={<GoalCoach />} />
          <Route path="/goal-setting/name" element={<GoalName />} />
          <Route path="/goals/:id" element={<GoalDetail />} />
          <Route path="/verify/camera" element={<Camera />} />
          <Route path="/verify/upload" element={<Upload />} />
          <Route path="/success" element={<Success />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/settings/notifications" element={<NotificationSettings />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/challenge/group/:groupId" element={<GroupDetail />} />
          <Route path="/challenge/create" element={<CreateGroup />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/stats/weekly-report" element={<WeeklyReport />} />
          <Route path="/coach/chat" element={<CoachChat />} />
          <Route path="/friends/invite" element={<FriendInvite />} />
        </Route>

        {/* 바텀 네비 있는 메인 탭 */}
        <Route element={<Layout showNav={true} />}>
          <Route path="/" element={<Home />} />
          <Route path="/goals" element={<GoalsList />} />
          <Route path="/challenge" element={<Challenge />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
