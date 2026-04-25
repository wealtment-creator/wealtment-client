"use client";
import { useState } from "react";
import { CryptoTicker } from "@/components/ui/CryptoTicker";
import { SectionTag } from "@/components/ui/SectionTag";
import { Input, Select, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", department: "general", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error("Please fill in all required fields."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    toast.success("Message received! We'll be in touch soon.");
    setForm({ name: "", email: "", department: "general", message: "" });
  };

  return (
    <>
      <CryptoTicker />
      <section className="pt-32 pb-24 px-4 sm:px-6 relative">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <SectionTag>Contact</SectionTag>
            <h1 className="font-display text-5xl font-black mt-2">
              Contact <span className="text-gold-grad">Us</span>
            </h1>
            <p className="text-[var(--muted-2)] mt-3 max-w-md mx-auto">
              Have a question? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cards */}
            <div className="space-y-4">
              {[
                { icon: <Mail size={20} />, title: "Email Us", lines: ["wealtment@gmail.com"] },
                { icon: <Globe size={20} />, title: "Online", lines: ["www.wealtment.com", "Available 24/7"] },
                { icon: <MapPin size={20} />, title: "Registered", lines: ["United Kingdom", "England & Wales"] },
              ].map((c) => (
                <div key={c.title} className="glass rounded-xl p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--gold-glow)] flex items-center justify-center text-[var(--gold)] shrink-0">
                    {c.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">{c.title}</p>
                    {c.lines.map((l) => <p key={l} className="text-xs text-[var(--muted)]">{l}</p>)}
                  </div>
                </div>
              ))}

              {/* Map placeholder */}
              <div className="glass rounded-xl p-8 text-center">
                <MapPin size={32} className="text-[var(--gold)] mx-auto mb-3" />
                <p className="text-sm font-semibold">Wealtment Limited</p>
                <p className="text-xs text-[var(--muted)] mt-1">Registered in England & Wales</p>
                <p className="text-xs text-[var(--muted)]">United Kingdom</p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 glass rounded-2xl p-8">
              <h2 className="font-display text-2xl font-bold mb-6">Send Us a Message</h2>
              <form onSubmit={submit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Your Name *" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <Input label="Email Address *" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <Select label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                  <option value="general">General Inquiry</option>
                  <option value="deposits">Deposits & Withdrawals</option>
                  <option value="technical">Technical Support</option>
                  <option value="accounts">Account Management</option>
                  <option value="compliance">Compliance</option>
                </Select>
                <Textarea label="Message *" rows={7} placeholder="How can we help you today?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                <Button type="submit" size="lg" loading={loading} className="w-full">Send Message</Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
