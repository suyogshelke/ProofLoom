"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { getSessionServer } from "@/app/contracts/new/_session";

export default function NewContractPage() {
  return (
    <div className="page">
      <Navbar user={{}} />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Compile a new Brand Contract</h1>
        <p className="text-muted-foreground mb-6">Upload a guideline document; candidate rules are extracted with page citations for your approval.</p>
        <div className="card p-8">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); }}>
            <div className="space-y-2">
              <label className="text-sm font-medium block">Contract name</label>
              <input name="name" defaultValue="Brand Guidelines v1" className="w-full glass rounded-xl px-4 py-2.5 border border-white/30 focus:ring-2 ring-indigo-500/50 focus:border-transparent outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium block">Brand</label>
              <input name="brand" defaultValue="Acme" className="w-full glass rounded-xl px-4 py-2.5 border border-white/30 focus:ring-2 ring-indigo-500/50 focus:border-transparent outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium block">Guideline document (PDF/DOCX)</label>
              <input type="file" accept=".pdf,.docx" className="w-full block text-sm text-muted-foreground" />
            </div>
            <button type="submit" className="w-full px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25">
              Compile contract
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
