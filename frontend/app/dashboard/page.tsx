import GreetingsCard from "./components/GreetingsCard";
import QuickMetrics from "./components/QuickMetrics";
import ActivityList from "./components/ActivityList";
import QuickActions from "./components/QuickActions";
import JournalLogger from "./components/JournalLogger";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <GreetingsCard />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <QuickMetrics />
          <JournalLogger />
        </div>

        <div className="space-y-6">
          <ActivityList />
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
