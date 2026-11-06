"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Upload, Image } from "lucide-react";

export default function SignaturesPage() {
  const [uploading, setUploading] = useState(false);

  return (
    <div className="page">
      <Navbar user={{ role: "CREATOR" }} />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Signatures</h1>
        <p className="text-sm text-muted-foreground mb-6">Employee and Director signatures attached to reviews.</p>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold">Upload signature</h3>
              <p className="text-xs text-muted-foreground">PNG or JPG. Stored as a file reference; never used for training.</p>
            </div>
          </div>
          <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:bg-white/5 transition cursor-pointer group">
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className="w-8 h-8 text-muted-foreground group-hover:text-indigo-400 transition" />
              <p className="text-sm text-muted-foreground">Drag & drop or browse</p>
              <p className="text-xs text-muted-foreground">PNG · JPG · Max 2 MB</p>
            </div>
            <input type="file" accept="image/png,image/jpeg" className="sr-only" />
          </div>
          {uploading && (
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 border-2 border-white/30 border-t-indigo-400 rounded-full animate-spin" /> Uploading…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
