"use client";
import Image from "next/image";
import { useState } from "react";
import { CryptoTicker } from "@/components/ui/CryptoTicker";
import { SectionTag } from "@/components/ui/SectionTag";
import { Input, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { CRYPTO_IMAGES } from "@/lib/data";
import { Mail, Clock, MapPin, Shield } from "lucide-react";
import toast from "react-hot-toast";
import endpointRoute from "@/lib/endpointRoute";
export default function SupportPage() {
  const [form, setForm] = useState({ email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.message) { toast.error("Please fill in all required fields."); return; }
    setLoading(true);
    try {
        console.log(form);

      await endpointRoute.post("/contact", form);
  setLoading(false);
    toast.success("Message sent! We'll respond within 24 hours.");
    setForm({ email: "", phone: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  
  };

  const INFO = [
    { icon: <Mail size={18} />, label: "Email Support", val: "wealtment@gmail.com" },
    { icon: <Clock size={18} />, label: "Support Hours", val: "24/7 — Always Available" },
    { icon: <MapPin size={18} />, label: "Registered Office", val: "United Kingdom" },
    { icon: <Shield size={18} />, label: "Security", val: "256-bit SSL Encrypted" },
  ];

  return (
    <>
      <CryptoTicker />
      <section className="pt-32 pb-24 px-4 sm:px-6 relative">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <SectionTag>Support</SectionTag>
            <h1 className="font-display text-5xl font-black mt-2">Get <span className="text-gold-grad">Support</span></h1>
            <p className="text-[var(--muted-2)] mt-3 max-w-md mx-auto">Our expert team is available 24/7 for any questions about your account or investments.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Info */}
            <div>
              {INFO.map((c) => (
                <div key={c.label} className="flex gap-4 mb-7">
                  <div className="w-11 h-11 rounded-xl bg-[var(--gold-glow)] border border-[rgba(212,168,67,0.2)] flex items-center justify-center text-[var(--gold)] shrink-0">
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] mb-0.5">{c.label}</p>
                    <p className="font-semibold text-sm">{c.val}</p>
                  </div>
                </div>
              ))}
              <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] mt-6">
                <Image src={CRYPTO_IMAGES.cryptoTeam} alt="Support team" width={600} height={300} className="w-full h-60 object-cover opacity-70" />
              </div>
            </div>

            {/* Form */}
            <div className="glass rounded-2xl p-8">
              <h2 className="font-display text-2xl font-bold mb-6">Send a Message</h2>
              <form onSubmit={submit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Email Address *" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <Input label="Phone Number" placeholder="your number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <Textarea label="Message *" rows={6} placeholder="Describe your question or issue..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                <Button type="submit" size="lg" loading={loading} className="w-full">Send Message</Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
