"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  KeyRound,
  MapPin,
  Layers,
  Bell,
  History as HistoryIcon,
  UserCheck,
  Smile,
  Download,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

const appScreens = [
  {
    id: "welcome",
    title: "Welcome Screen",
    bg: "from-primary-green to-secondary-green",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-white p-4 text-center">
        <div className="p-4 bg-white/20 rounded-full mb-4 animate-bounce">
          <Smile className="h-10 w-10 text-white" />
        </div>
        <h4 className="text-sm font-black uppercase tracking-wider">Green City</h4>
        <p className="text-[10px] opacity-80 mt-1">Smart Municipal Waste System</p>
        <div className="mt-8 w-full bg-white text-primary-green font-bold text-[10px] py-2.5 rounded-full shadow-md">
          Get Started
        </div>
      </div>
    ),
  },
  {
    id: "register",
    title: "Resident Registration",
    bg: "from-background to-muted-bg",
    content: (
      <div className="p-4 text-left flex flex-col justify-between h-full bg-background dark:bg-[#0c1410]">
        <div>
          <h4 className="text-xs font-bold text-gradient-green uppercase">Create Account</h4>
          <p className="text-[9px] text-muted-text mt-0.5">Register as a citizen</p>
          <div className="space-y-2 mt-4">
            <div className="w-full h-6 rounded-full bg-muted-bg dark:bg-[#1a2c22] border border-card-border p-1.5 text-[8px] text-muted-text">Full Name</div>
            <div className="w-full h-6 rounded-full bg-muted-bg dark:bg-[#1a2c22] border border-card-border p-1.5 text-[8px] text-muted-text">Phone Number</div>
            <div className="w-full h-6 rounded-full bg-muted-bg dark:bg-[#1a2c22] border border-card-border p-1.5 text-[8px] text-muted-text">Address</div>
          </div>
        </div>
        <div className="w-full bg-primary-green text-white text-center font-bold text-[9px] py-2 rounded-full mt-2">
          Register
        </div>
      </div>
    ),
  },
  {
    id: "login",
    title: "Secure Login",
    bg: "from-background to-muted-bg",
    content: (
      <div className="p-4 text-left flex flex-col justify-between h-full bg-background dark:bg-[#0c1410]">
        <div>
          <h4 className="text-xs font-bold text-gradient-green uppercase">Sign In</h4>
          <p className="text-[9px] text-muted-text mt-0.5">Access your waste panel</p>
          <div className="space-y-2 mt-6">
            <div className="w-full h-6 rounded-full bg-muted-bg dark:bg-[#1a2c22] border border-card-border p-1.5 text-[8px] text-muted-text">Email Address</div>
            <div className="w-full h-6 rounded-full bg-muted-bg dark:bg-[#1a2c22] border border-card-border p-1.5 text-[8px] text-muted-text">Password</div>
          </div>
        </div>
        <div className="w-full bg-primary-green text-white text-center font-bold text-[9px] py-2 rounded-full mt-2">
          Sign In
        </div>
      </div>
    ),
  },
  {
    id: "home",
    title: "Citizen Dashboard",
    bg: "from-background to-muted-bg",
    content: (
      <div className="p-4 text-left flex flex-col justify-between h-full bg-background dark:bg-[#0c1410] text-[9px]">
        <div>
          <div className="flex justify-between items-center pb-2 border-b border-card-border">
            <div>
              <p className="text-[8px] text-muted-text">Welcome Back</p>
              <h5 className="font-bold text-foreground">Amara Perera</h5>
            </div>
            <div className="h-6 w-6 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green text-[8px] font-bold">AP</div>
          </div>
          <div className="mt-4 p-3 bg-primary-green/5 rounded-2xl border border-primary-green/15 text-center">
            <h6 className="font-bold text-primary-green dark:text-accent-green">Waste Request status</h6>
            <p className="text-[8px] text-muted-text mt-1">Next Pickup: Monday</p>
            <div className="inline-block bg-primary-green text-white text-[8px] px-2 py-0.5 rounded-full mt-2">Scheduled</div>
          </div>
        </div>
        <div className="w-full bg-primary-green text-white text-center font-bold py-2 rounded-full">
          New Request
        </div>
      </div>
    ),
  },
  {
    id: "categories",
    title: "Waste Category Selection",
    bg: "from-background to-muted-bg",
    content: (
      <div className="p-4 text-left h-full bg-background dark:bg-[#0c1410] text-[9px]">
        <h4 className="text-xs font-bold text-gradient-green uppercase">Select Waste</h4>
        <p className="text-[8px] text-muted-text mt-0.5">Which waste are you disposing?</p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="p-2 border border-primary-green rounded-xl bg-primary-green/5 text-center cursor-pointer">
            <Smile className="h-4 w-4 mx-auto text-primary-green mb-1" />
            <span className="font-bold">Organic</span>
          </div>
          <div className="p-2 border border-card-border rounded-xl text-center cursor-pointer">
            <Layers className="h-4 w-4 mx-auto text-muted-text mb-1" />
            <span className="font-bold text-muted-text">Plastic</span>
          </div>
          <div className="p-2 border border-card-border rounded-xl text-center cursor-pointer">
            <Layers className="h-4 w-4 mx-auto text-muted-text mb-1" />
            <span className="font-bold text-muted-text">Paper</span>
          </div>
          <div className="p-2 border border-card-border rounded-xl text-center cursor-pointer">
            <Layers className="h-4 w-4 mx-auto text-muted-text mb-1" />
            <span className="font-bold text-muted-text">Glass</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "map",
    title: "GPS Map Marker",
    bg: "from-background to-muted-bg",
    content: (
      <div className="relative h-full w-full bg-[#E5E3DF] dark:bg-[#1a221f] text-[9px]">
        {/* Mock Map Background Grids */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-6 pointer-events-none">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-black/5 dark:border-white/5" />
          ))}
        </div>
        {/* Mock Map Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <MapPin className="h-6 w-6 text-red-500 fill-red-500/20 animate-bounce" />
          <div className="bg-background text-foreground text-[8px] font-bold p-1 rounded-md border border-card-border shadow-md whitespace-nowrap mt-1">
            Home Bin
          </div>
        </div>
        {/* Floating panel */}
        <div className="absolute bottom-3 inset-x-3 bg-background dark:bg-[#0c1410] border border-card-border rounded-2xl p-2 flex items-center justify-between">
          <span className="font-bold">Locating...</span>
          <div className="bg-primary-green text-white text-[8px] px-2.5 py-1 rounded-full font-bold">
            Confirm
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "history",
    title: "Collection History",
    bg: "from-background to-muted-bg",
    content: (
      <div className="p-4 text-left h-full bg-background dark:bg-[#0c1410] text-[9px] flex flex-col gap-2">
        <div>
          <h4 className="text-xs font-bold text-gradient-green uppercase">History</h4>
          <p className="text-[8px] text-muted-text mt-0.5">Your past garbage collections</p>
        </div>
        <div className="space-y-2 mt-2 overflow-y-auto max-h-[140px] no-scrollbar">
          <div className="flex justify-between items-center p-2 bg-muted-bg dark:bg-[#13221a] rounded-xl border border-card-border">
            <div>
              <p className="font-bold">Organic Waste</p>
              <p className="text-[7px] text-muted-text">July 15, 2026</p>
            </div>
            <span className="text-[8px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-full font-bold">Collected</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted-bg dark:bg-[#13221a] rounded-xl border border-card-border">
            <div>
              <p className="font-bold">Plastic Waste</p>
              <p className="text-[7px] text-muted-text">July 08, 2026</p>
            </div>
            <span className="text-[8px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-full font-bold">Collected</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "profile",
    title: "Resident Profile",
    bg: "from-background to-muted-bg",
    content: (
      <div className="p-4 text-center h-full bg-background dark:bg-[#0c1410] text-[9px] flex flex-col items-center justify-between">
        <div className="w-full flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary-green/10 border border-primary-green/20 text-primary-green flex items-center justify-center text-sm font-bold mt-2">
            AP
          </div>
          <h5 className="font-bold text-foreground mt-2 text-xs">Amara Perera</h5>
          <p className="text-[7px] text-muted-text uppercase tracking-wider">BMC Citizen ID: BMC-392</p>

          <div className="w-full space-y-1.5 mt-4 text-left">
            <div className="flex justify-between items-center py-1.5 border-b border-card-border/60">
              <span className="text-muted-text">Zone</span>
              <span className="font-bold text-foreground">Badulla Ward 03</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-card-border/60">
              <span className="text-muted-text">Phone</span>
              <span className="font-bold text-foreground">077-123-4567</span>
            </div>
          </div>
        </div>
        <div className="w-full bg-muted-bg dark:bg-[#13221a] text-muted-text text-center py-1.5 rounded-full font-bold border border-card-border">
          Logout
        </div>
      </div>
    ),
  },
];

const featuresList = [
  { icon: <User className="h-5 w-5 text-primary-green" />, text: "Resident Registration" },
  { icon: <KeyRound className="h-5 w-5 text-primary-green" />, text: "Secure Login" },
  { icon: <MapPin className="h-5 w-5 text-primary-green" />, text: "Mark Waste Location" },
  { icon: <Layers className="h-5 w-5 text-primary-green" />, text: "Waste Category Selection" },
  { icon: <Bell className="h-5 w-5 text-primary-green" />, text: "Collection Notifications" },
  { icon: <HistoryIcon className="h-5 w-5 text-primary-green" />, text: "Collection History" },
  { icon: <UserCheck className="h-5 w-5 text-primary-green" />, text: "User Profile" },
  { icon: <Smile className="h-5 w-5 text-primary-green" />, text: "Simple and Easy Interface" },
];

export function MobileApp() {
  const [screenIndex, setScreenIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScreenIndex((prev) => (prev + 1) % appScreens.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="mobile-app" className="py-24 bg-[#F2F7F4] relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-primary-green/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Dynamic CSS Phone Mockup */}
          <div className="flex flex-col items-center justify-center order-2 lg:order-1">
            <div className="relative w-[280px] h-[560px] bg-black rounded-[42px] p-3 shadow-2xl border-[6px] border-zinc-800 dark:border-zinc-900 select-none">
              
              {/* Dynamic screen background */}
              <div
                className={`w-full h-full rounded-[34px] overflow-hidden bg-gradient-to-br ${appScreens[screenIndex].bg} border border-zinc-700/30 flex flex-col relative`}
              >
                {/* Dynamic Content */}
                <div className="flex-1 pt-6">
                  {appScreens[screenIndex].content}
                </div>

                {/* Simulated Home Indicator */}
                <div className="h-1 w-28 bg-foreground/30 rounded-full mx-auto mb-2" />
              </div>

              {/* Speaker grill / Camera Notch */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-b-2xl z-20 flex items-center justify-center">
                <div className="w-10 h-1 bg-zinc-800 rounded-full" />
              </div>
            </div>

            {/* Screen indicator dots */}
            <div className="flex gap-1.5 mt-6">
              {appScreens.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setScreenIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === screenIndex ? "w-6 bg-primary-green" : "w-2 bg-muted-text/30"
                  }`}
                  aria-label={`Show app screen ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-[10px] uppercase font-bold text-muted-text mt-2.5">
              Active: {appScreens[screenIndex].title}
            </span>
          </div>

          {/* Right Side: Features List & Details */}
          <div className="flex flex-col gap-6 order-1 lg:order-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-green dark:text-accent-green">
              Resident Application
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">
              Green City <span className="text-gradient-green">Mobile App</span>
            </h2>
            <p className="text-sm text-muted-text leading-relaxed font-medium">
              Manage your household waste collection easily. Mark your bin locations, select the correct garbage category, and get notified in real-time when the driver approaches your block.
            </p>

            {/* Features Badge Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {featuresList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 items-center p-3 rounded-2xl border border-card-border bg-card-bg/20 backdrop-blur-sm"
                >
                  <div className="p-2 bg-primary-green/5 dark:bg-accent-green/10 border border-primary-green/10 rounded-xl">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Downloads Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button variant="primary" className="w-full sm:w-auto text-xs py-3">
                <Download className="h-4 w-4" />
                Download App (Android .APK)
              </Button>
              <Button variant="outline" className="w-full sm:w-auto text-xs py-3">
                <BookOpen className="h-4 w-4" />
                View Registration Guide
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
