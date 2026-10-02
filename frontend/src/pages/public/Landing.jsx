import React from 'react';
import { NavLink } from 'react-router-dom';
import { Send, Shield, Zap, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function Landing() {
  const sampleRates = [
    { pair: 'USD / INR', rate: '83.45', change: '+0.12%' },
    { pair: 'EUR / USD', rate: '1.085', change: '-0.05%' },
    { pair: 'GBP / EUR', rate: '1.172', change: '+0.18%' },
    { pair: 'USD / NGN', rate: '1520.00', change: '+0.50%' },
    { pair: 'CAD / INR', rate: '61.20', change: '+0.08%' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-brand-500/20">
            GP
          </div>
          <span className="font-extrabold text-2xl tracking-tight">
            Global<span className="text-brand-400">Pay</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <NavLink to="/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              Log In
            </Button>
          </NavLink>
          <NavLink to="/register">
            <Button variant="primary">Get Started</Button>
          </NavLink>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-800 text-brand-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-brand-400" />
            <span>Next-Gen Real-Time Cross-Border Transfers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Send money across borders, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-teal-300">tracked in real time</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl">
            GlobalPay powers instant money transfers with zero hidden fees, live exchange rates, automated compliance checking, and live Socket.io timeline updates.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <NavLink to="/register">
              <Button size="lg" className="w-full sm:w-auto text-base">
                Send Money Now <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </NavLink>
            <NavLink to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800">
                Admin Console Login
              </Button>
            </NavLink>
          </div>

          <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-xs text-slate-400">
            <div>
              <p className="text-xl font-bold text-white font-money">150+</p>
              <p>Supported Countries</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white font-money">&lt; 30s</p>
              <p>Instant Realtime Tracking</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white font-money">0.5%</p>
              <p>Transparent Low Fees</p>
            </div>
          </div>
        </div>

        {/* Live Ticker & Preview Card */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-slate-800/60 border-slate-700/80 backdrop-blur-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Live Rates Ticker</h3>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3">
              {sampleRates.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <span className="font-semibold text-white text-sm">{r.pair}</span>
                  <div className="text-right">
                    <span className="font-money font-bold text-slate-100 text-sm">{r.rate}</span>
                    <span className={`text-[10px] ml-2 font-medium ${r.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {r.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <p className="text-xs text-slate-400">Rates updated continuously via live ECB feed.</p>
            </div>
          </Card>
        </div>
      </main>

      {/* Explainer Section */}
      <section className="bg-slate-950 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white">How GlobalPay Works</h2>
            <p className="text-slate-400 text-sm">Three fast steps to transfer money anywhere in the world.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xl">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Add Funds & Select Recipient</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deposit funds to your active multi-currency wallet and save your verified recipient bank details.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xl">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Lock Rate & Confirm</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Preview exact exchange rates and itemized fees. Your rate is locked instantly at submission.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xl">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Track Live Updates</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Follow your transfer status on a live timeline powered by Socket.io and instant Web Push notifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <p>© 2026 GlobalPay Inc. All rights reserved. Built with React, Vite, Socket.io, and Firebase.</p>
      </footer>
    </div>
  );
}
