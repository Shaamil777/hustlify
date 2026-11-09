"use client";

import React from "react";
import { Plus, Trash2, Globe, Linkedin, Twitter, Instagram, Facebook, Youtube } from "lucide-react";
import { SocialLink } from "@/types/assessment";

interface SocialLinksInputProps {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

export default function SocialLinksInput({ links, onChange }: SocialLinksInputProps) {
  const addLink = () => {
    const newLink: SocialLink = {
      id: Math.random().toString(36).substring(2, 9),
      platform: "linkedin",
      url: "",
    };
    onChange([...links, newLink]);
  };

  const updateLink = (id: string, field: "platform" | "url", value: string) => {
    const updated = links.map((link) => {
      if (link.id === id) {
        return { ...link, [field]: value };
      }
      return link;
    });
    onChange(updated);
  };

  const removeLink = (id: string) => {
    onChange(links.filter((l) => l.id !== id));
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "linkedin":
        return <Linkedin className="w-4 h-4 text-sky-600" />;
      case "x":
        return <Twitter className="w-4 h-4 text-slate-800" />;
      case "instagram":
        return <Instagram className="w-4 h-4 text-pink-600" />;
      case "facebook":
        return <Facebook className="w-4 h-4 text-blue-600" />;
      case "youtube":
        return <Youtube className="w-4 h-4 text-red-600" />;
      default:
        return <Globe className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-3">
      {links.length === 0 && (
        <p className="text-xs text-slate-400 italic">No social links added yet. Click &quot;+ Add Social Link&quot; below.</p>
      )}

      {links.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 min-w-[135px] shadow-sm">
            {getPlatformIcon(item.platform)}
            <select
              value={item.platform}
              onChange={(e) => updateLink(item.id, "platform", e.target.value)}
              className="bg-transparent border-none text-xs text-slate-700 font-semibold focus:outline-none w-full cursor-pointer"
            >
              <option value="linkedin">LinkedIn</option>
              <option value="x">X / Twitter</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="youtube">YouTube</option>
              <option value="website">Website</option>
              <option value="other">Other</option>
            </select>
          </div>

          <input
            type="url"
            value={item.url}
            onChange={(e) => updateLink(item.id, "url", e.target.value)}
            placeholder="https://..."
            className="flex-1 px-3.5 py-2 text-xs text-slate-800 input-executive rounded-xl shadow-sm"
          />

          <button
            type="button"
            onClick={() => removeLink(item.id)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Remove link"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addLink}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200/80 rounded-xl transition-all cursor-pointer shadow-sm"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Social Link
      </button>
    </div>
  );
}
