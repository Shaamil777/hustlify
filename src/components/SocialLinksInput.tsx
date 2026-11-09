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

  return (
    <div className="space-y-2 mt-2">
      {links.length === 0 && (
        <p className="text-xs text-neutral-400 italic">No links added yet.</p>
      )}

      {links.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <select
            value={item.platform}
            onChange={(e) => updateLink(item.id, "platform", e.target.value)}
            className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-700 font-normal focus:outline-none focus:border-neutral-900 cursor-pointer min-w-[110px]"
          >
            <option value="linkedin">LinkedIn</option>
            <option value="x">X (Twitter)</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="youtube">YouTube</option>
            <option value="website">Website</option>
            <option value="other">Other</option>
          </select>

          <input
            type="url"
            value={item.url}
            onChange={(e) => updateLink(item.id, "url", e.target.value)}
            placeholder="https://..."
            className="flex-1 px-3 py-1.5 text-xs text-neutral-900 minimal-input rounded"
          />

          <button
            type="button"
            onClick={() => removeLink(item.id)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
            title="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addLink}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 pt-1 transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        Add another link
      </button>
    </div>
  );
}
