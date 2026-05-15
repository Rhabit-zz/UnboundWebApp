import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "../../utils.js";
import { Sparkles, BookOpen, Lightbulb, PenLine, Home, BookMarked, Globe2, Users, Heart, Apple } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "./ui/sidebar";

const navigationItems = [
  { title: "Home", url: createPageUrl("Home"), icon: Home },
  { title: "Species", url: createPageUrl("Species"), icon: Sparkles },
  { title: "Characters", url: createPageUrl("Characters"), icon: BookOpen },
  { title: "Gathering", url: createPageUrl("Gathering"), icon: BookMarked },
  { title: "Crafting", url: createPageUrl("Crafting"), icon: Lightbulb },
  { title: "Arena", url: createPageUrl("Arena"), icon: Heart },
  { title: "Market", url: createPageUrl("Market"), icon: Apple },
  { title: "Admin", url: createPageUrl("Admin"), icon: Globe2 },
  { title: "Profile", url: createPageUrl("Profile"), icon: Users },
  { title: "References", url: createPageUrl("References"), icon: PenLine },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary-50: #faf5ff;
          --primary-100: #f3e8ff;
          --primary-200: #e9d5ff;
          --primary-300: #d8b4fe;
          --primary-400: #c084fc;
          --primary-500: #a855f7;
          --primary-600: #9333ea;
          --primary-700: #7e22ce;
          --primary-800: #6b21a8;
          --primary-900: #581c87;
          --gold-400: #fbbf24;
          --gold-500: #f59e0b;
          --gold-600: #d97706;
        }
      `}</style>

      <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900">
        <Sidebar className="border-r border-purple-800/30 bg-black/20 backdrop-blur-xl">
          <SidebarHeader className="border-b border-purple-800/30 p-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold-400/20 to-transparent animate-pulse" />
                  <Sparkles className="w-6 h-6 text-white relative z-10" />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-xl text-white">Hermetic Wisdom</h2>
                <p className="text-xs text-purple-300">The Path of Knowledge</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-purple-800/30 transition-all duration-200 rounded-lg mb-1 ${
                          location.pathname === item.url
                            ? "bg-gradient-to-r from-purple-600/40 to-pink-600/40 text-white border border-purple-500/50"
                            : "text-purple-200"
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-purple-800/30 p-4">
            <div className="p-4 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg border border-purple-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-gold-400" />
                <span className="text-xs font-semibold text-purple-200">Daily Wisdom</span>
              </div>
              <p className="text-xs text-purple-300 italic">"As above, so below; as within, so without."</p>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-black/20 backdrop-blur-xl border-b border-purple-800/30 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-purple-800/30 p-2 rounded-lg transition-colors duration-200 text-white" />
              <h1 className="text-xl font-semibold text-white">Hermetic Wisdom</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

