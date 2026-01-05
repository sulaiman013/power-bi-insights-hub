import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import SettingsModal from "@/components/SettingsModal";

const Index = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <ChatPanel />
      <SettingsModal />
    </div>
  );
};

export default Index;
