
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useThemeStore } from "@/stores/useThemeStore";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Sessions from "./pages/Sessions";
import Blocks from "./pages/Blocks";
import Todos from "./pages/Todos";
import Notes from "./pages/Notes";
import Timers from "./pages/Timers";
import Settings from "./pages/Settings";
import Timeline from "./pages/Timeline";
import Analytics from "./pages/Analytics";
import ActivityHistory from "./pages/ActivityHistory";
// import AIAssistant from "./pages/AIAssistant";
// import AIChat from "./pages/AIChat";
import NotFound from "./pages/NotFound";
import Apps from "./pages/Apps";
import AppView from "./pages/AppView";
import Categories from "./pages/Categories";
import CategoryView from "./pages/CategoryView";
import URLs from "./pages/URLs";
import ChatBotHome from "./pages/chatbot/home";
import ChatBotChat from "./pages/chatbot/chat";
import VoiceBotHome from "./pages/chatbot/voice.home";


const queryClient = new QueryClient();

const App = () => {
  const { fontSize, applyTheme } = useThemeStore();

  useEffect(() => {
    // Apply theme and accent color
    applyTheme();
    
    // Apply font size
    document.documentElement.style.fontSize = `${fontSize}px`;

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme();
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [fontSize, applyTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/blocks" element={<Blocks />} />
            <Route path="/todos" element={<Todos />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/apps" element={<Apps />} />
            <Route path="/apps/:appId" element={<AppView />} />
            <Route path="/urls" element={<URLs />} />
            {/* <Route path="/urls/:urlId" element={<URLView />} /> */}
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryIdb64" element={<CategoryView />} />
            <Route path="/timers" element={<Timers />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/activity-history" element={<ActivityHistory />} />
            {/* <Route path="/ai-assistant" element={<AIAssistant />} /> */}
            {/* <Route path="/chat" element={<AIChat />} /> */}
            <Route path="/settings" element={<Settings />} />

            <Route path="/chat" element={<ChatBotHome />} />
            <Route path="/chat/voice" element={<VoiceBotHome />} />
            <Route path="/chat/:chatId" element={<ChatBotChat />} />
            
            {/* Catch-all route for 404 errors */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
