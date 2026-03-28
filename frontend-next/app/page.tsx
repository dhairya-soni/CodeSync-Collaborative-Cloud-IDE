'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Code2, Zap, Users, Shield, Globe, Terminal, GitBranch,
  ArrowRight, Play, Copy, Check, Star, ChevronRight,
  Cpu, Lock, Layers, Sparkles, ExternalLink
} from 'lucide-react';

// ─── Animated code demo lines ────────────────────────────────────────────────
const CODE_LINES = [
  { tokens: [{ t: 'def ', c: 'token-keyword' }, { t: 'fibonacci', c: 'token-function' }, { t: '(n: int) -> int:', c: 'token-operator' }], indent: 0 },
  { tokens: [{ t: '    ', c: '' }, { t: 'if', c: 'token-keyword' }, { t: ' n <= 1:', c: 'token-operator' }], indent: 1 },
  { tokens: [{ t: '        ', c: '' }, { t: 'return', c: 'token-keyword' }, { t: ' n', c: 'token-number' }], indent: 2 },
  { tokens: [{ t: '    ', c: '' }, { t: 'return', c: 'token-keyword' }, { t: ' fibonacci(n-', c: 'token-function' }, { t: '1', c: 'token-number' }, { t: ') + fibonacci(n-', c: 'token-function' }, { t: '2', c: 'token-number' }, { t: ')', c: '' }], indent: 1 },
  { tokens: [], indent: 0 },
  { tokens: [{ t: '# Live collaboration — 3 users connected', c: 'token-comment' }], indent: 0 },
  { tokens: [{ t: 'result', c: 'token-operator' }, { t: ' = fibonacci(', c: '' }, { t: '10', c: 'token-number' }, { t: ')', c: '' }], indent: 0 },
  { tokens: [{ t: 'print', c: 'token-builtin' }, { t: '(', c: '' }, { t: 'f"fib(10) = {result}"', c: 'token-string' }, { t: ')', c: '' }], indent: 0 },
];

const FEATURES = [
  {
    icon: Users,
    title: 'Real-Time Collaboration',
    desc: 'Multiple developers, one codebase. See cursors, edits, and presence live with zero conflicts.',
    color: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: Play,
    title: 'Multi-Language Execution',
    desc: 'Run Python, JavaScript, TypeScript, Go, C++, Java, and Rust in isolated Docker containers.',
    color: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/20',
    iconColor: 'text-green-400',
  },
  {
    icon: Cpu,
    title: 'Complexity Analysis',
    desc: 'Instant Big-O analysis via AST parsing. Understand algorithm performance without running code.',
    color: 'from-purple-500/20 to-violet-500/20',
    border: 'border-purple-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: Shield,
    title: 'Secure Sandboxing',
    desc: 'Every execution runs in an air-gapped Docker container with memory and CPU limits.',
    color: 'from-red-500/20 to-orange-500/20',
    border: 'border-red-500/20',
    iconColor: 'text-red-400',
  },
  {
    icon: Zap,
    title: 'VS Code Experience',
    desc: 'Powered by Monaco Editor — the same engine behind VS Code. Full IntelliSense and syntax support.',
    color: 'from-yellow-500/20 to-amber-500/20',
    border: 'border-yellow-500/20',
    iconColor: 'text-yellow-400',
  },
  {
    icon: Globe,
    title: 'Instant Share',
    desc: 'One link, instant collaboration. No install, no setup. Just share and start coding together.',
    color: 'from-cyan-500/20 to-teal-500/20',
    border: 'border-cyan-500/20',
    iconColor: 'text-cyan-400',
  },
];

const LANGUAGES = ['Python', 'JavaScript', 'TypeScript', 'Go', 'C++', 'Java', 'Rust'];

const STATS = [
  { value: '7', label: 'Languages', suffix: '+' },
  { value: '128', label: 'MB Sandbox', suffix: '' },
  { value: '5s', label: 'Execution Limit', suffix: '' },
  { value: '∞', label: 'Collaborators', suffix: '' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-ide-border' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-ide-text font-bold text-lg tracking-tight">
            Code<span className="gradient-text">Sync</span>
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Languages', 'How it Works'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm text-ide-muted hover:text-ide-text transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/dhairya-soni/CodeSync-Collaborative-Cloud-IDE"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 text-sm text-ide-muted hover:text-ide-text transition-colors"
          >
            <GitBranch className="w-4 h-4" />
            GitHub
          </a>
          <Link
            href="/editor"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:from-blue-500 hover:to-purple-500 transition-all duration-200 glow-blue"
          >
            <Zap className="w-3.5 h-3.5" />
            Launch IDE
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

function CodeDemo() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [output, setOutput] = useState('');

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < CODE_LINES.length) {
        setVisibleLines(i + 1);
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => setOutput('fib(10) = 55'), 500);
      }
    }, 350);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative rounded-xl overflow-hidden border border-ide-border shadow-2xl shadow-black/50">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-ide-surface border-b border-ide-border">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs text-ide-muted font-mono">fibonacci.py — CodeSync</span>
        </div>
        {/* Live badge */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">3 users</span>
        </div>
      </div>

      {/* Editor area */}
      <div className="bg-ide-bg p-5 font-mono text-sm min-h-[260px]">
        {CODE_LINES.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={visibleLines > i ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-4 leading-relaxed"
          >
            <span className="text-ide-muted text-xs w-4 text-right select-none">{i + 1}</span>
            <span>
              {line.tokens.map((token, j) => (
                <span key={j} className={token.c}>{token.t}</span>
              ))}
              {visibleLines === i + 1 && i < CODE_LINES.length - 1 && (
                <span className="inline-block w-0.5 h-4 bg-ide-accent ml-0.5 animate-pulse" />
              )}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Output panel */}
      <AnimatePresence>
        {output && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-ide-border bg-ide-surface px-5 py-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <Terminal className="w-3.5 h-3.5 text-ide-muted" />
              <span className="text-xs text-ide-muted">Output</span>
            </div>
            <span className="font-mono text-sm text-green-400">{output}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Peer cursors overlay */}
      <div className="absolute top-20 right-8 pointer-events-none">
        <div className="flex flex-col gap-1">
          {[
            { name: 'Alex', color: '#58a6ff', line: 2 },
            { name: 'Priya', color: '#bc8cff', line: 6 },
          ].map((peer) => (
            <motion.div
              key={peer.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (peer.line * 0.35) + 0.5 }}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium text-white"
              style={{ background: peer.color + '30', border: `1px solid ${peer.color}50` }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: peer.color }} />
              {peer.name}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative group p-6 rounded-xl border ${feature.border} bg-gradient-to-br ${feature.color} backdrop-blur-sm cursor-default overflow-hidden`}
    >
      {/* Shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700" />

      <div className={`w-10 h-10 rounded-lg bg-ide-surface flex items-center justify-center mb-4 ${feature.iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-ide-text font-semibold text-base mb-2">{feature.title}</h3>
      <p className="text-ide-muted text-sm leading-relaxed">{feature.desc}</p>
    </motion.div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -60]);

  const [langIndex, setLangIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLangIndex((i) => (i + 1) % LANGUAGES.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div ref={containerRef} className="landing-page bg-ide-bg text-ide-text">
      <NavBar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden px-6 pt-16">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="blob absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="blob blob-delay-2 absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl" />
          <div className="blob blob-delay-4 absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-cyan-600/8 blur-3xl" />
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(#58a6ff 1px, transparent 1px), linear-gradient(90deg, #58a6ff 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center py-20">
          {/* Left — copy */}
          <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-6"
            >
              <Sparkles className="w-3 h-3" />
              Real-time collaborative IDE
              <ChevronRight className="w-3 h-3" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight mb-6"
            >
              Code Together.{' '}
              <span className="gradient-text">Build Faster.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-ide-muted leading-relaxed mb-4 max-w-lg"
            >
              A real-time collaborative cloud IDE with secure sandboxed execution,
              Big-O complexity analysis, and VS Code's Monaco editor.
            </motion.p>

            {/* Language ticker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 mb-8"
            >
              <span className="text-sm text-ide-muted">Runs:</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={langIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-mono font-medium text-ide-accent px-2 py-0.5 rounded bg-ide-accent/10 border border-ide-accent/20"
                >
                  {LANGUAGES[langIndex]}
                </motion.span>
              </AnimatePresence>
              <span className="text-sm text-ide-muted">and 6 more</span>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/editor"
                className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-200 glow-blue text-sm"
              >
                <Zap className="w-4 h-4" />
                Start Coding Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://github.com/dhairya-soni/CodeSync-Collaborative-Cloud-IDE"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-ide-border bg-ide-surface text-ide-text hover:border-ide-accent/50 hover:bg-ide-surface-2 transition-all duration-200 font-medium text-sm"
              >
                <GitBranch className="w-4 h-4" />
                View on GitHub
                <ExternalLink className="w-3.5 h-3.5 text-ide-muted" />
              </a>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex gap-8 mt-12 pt-8 border-t border-ide-border/50"
            >
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-ide-text">
                    {s.value}<span className="text-ide-accent text-lg">{s.suffix}</span>
                  </div>
                  <div className="text-xs text-ide-muted mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — code demo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="relative"
          >
            <CodeDemo />
            {/* Floating complexity badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3.5 }}
              className="absolute -bottom-4 -left-4 glass rounded-xl p-3 border border-purple-500/30 shadow-glow-purple"
            >
              <div className="text-xs text-ide-muted mb-1 flex items-center gap-1">
                <Cpu className="w-3 h-3" /> Complexity
              </div>
              <div className="text-sm font-bold text-purple-400">O(2ⁿ)</div>
              <div className="text-xs text-ide-muted">Exponential — fibonacci</div>
            </motion.div>
            {/* Floating execution badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 4 }}
              className="absolute -top-4 -right-4 glass rounded-xl p-3 border border-green-500/30 shadow-glow-green"
            >
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-green-400 font-medium">Docker Sandbox</span>
              </div>
              <div className="text-xs text-ide-muted mt-0.5">128MB · 5s limit · no network</div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ide-muted"
        >
          <span className="text-xs">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 rounded-full border border-ide-border flex items-start justify-center pt-1"
          >
            <div className="w-1 h-2 rounded-full bg-ide-muted" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="py-28 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs font-semibold text-blue-400 tracking-widest uppercase mb-3">
              Everything you need
            </span>
            <h2 className="text-4xl font-black mb-4">Built for real development</h2>
            <p className="text-ide-muted text-lg max-w-xl mx-auto">
              Not a toy editor. A full collaborative development environment that runs your code securely.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── Languages ────────────────────────────────────────── */}
      <section id="languages" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block text-xs font-semibold text-purple-400 tracking-widest uppercase mb-3">
              Multi-language
            </span>
            <h2 className="text-4xl font-black mb-4">Run anything</h2>
            <p className="text-ide-muted text-lg max-w-lg mx-auto">
              Docker-isolated containers for every language. Full standard library, zero setup.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'Python',     color: '#3b82f6', badge: 'Py'  },
              { name: 'JavaScript', color: '#f59e0b', badge: 'JS'  },
              { name: 'TypeScript', color: '#3b82f6', badge: 'TS'  },
              { name: 'Go',         color: '#06b6d4', badge: 'Go'  },
              { name: 'C++',        color: '#6366f1', badge: 'C++' },
              { name: 'Java',       color: '#ef4444', badge: 'Jv'  },
              { name: 'Rust',       color: '#f97316', badge: 'Rs'  },
            ].map((lang, i) => (
              <motion.div
                key={lang.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="flex items-center gap-3 px-5 py-3 rounded-xl border border-ide-border bg-ide-surface hover:border-ide-accent/30 transition-all duration-200 cursor-default"
              >
                <span
                  className="w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-black font-mono flex-shrink-0"
                  style={{ background: lang.color + '20', color: lang.color, border: `1px solid ${lang.color}40` }}
                >
                  {lang.badge}
                </span>
                <span className="font-semibold text-ide-text">{lang.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs font-semibold text-green-400 tracking-widest uppercase mb-3">Simple</span>
            <h2 className="text-4xl font-black mb-4">Zero friction, instant collab</h2>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-8 top-10 bottom-10 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-green-500/50 hidden md:block" />

            {[
              {
                step: '01',
                title: 'Open the IDE',
                desc: 'Click "Start Coding" — no account needed. A unique room is created instantly.',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10 border-blue-500/30',
              },
              {
                step: '02',
                title: 'Share the link',
                desc: 'Copy your room URL and send it to teammates. They join live in seconds.',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10 border-purple-500/30',
              },
              {
                step: '03',
                title: 'Code & run together',
                desc: 'Edit simultaneously, see each other\'s cursors, run code in Docker, analyze complexity — all in real-time.',
                color: 'text-green-400',
                bg: 'bg-green-500/10 border-green-500/30',
              },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex gap-6 mb-10 items-start"
              >
                <div className={`flex-shrink-0 w-16 h-16 rounded-xl border ${step.bg} flex items-center justify-center relative z-10`}>
                  <span className={`text-xl font-black font-mono ${step.color}`}>{step.step}</span>
                </div>
                <div className="pt-3">
                  <h3 className="text-xl font-bold text-ide-text mb-2">{step.title}</h3>
                  <p className="text-ide-muted leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden border border-ide-border p-12 text-center"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-purple-950/40 to-ide-surface" />
            <div className="absolute inset-0 bg-mesh-gradient opacity-50" />

            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <h2 className="text-4xl font-black mb-4">Ready to build together?</h2>
              <p className="text-ide-muted text-lg mb-8 max-w-md mx-auto">
                No signup required. Open the IDE, share the link, start coding.
              </p>
              <Link
                href="/editor"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:from-blue-500 hover:to-purple-500 transition-all duration-200 glow-blue text-base"
              >
                <Zap className="w-5 h-5" />
                Launch CodeSync IDE
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-ide-border py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Code2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-ide-text font-bold">CodeSync</span>
          </div>
          <p className="text-sm text-ide-muted">
            Built with Next.js, FastAPI, Monaco Editor, Docker · Open source
          </p>
          <a
            href="https://github.com/dhairya-soni/CodeSync-Collaborative-Cloud-IDE"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-ide-muted hover:text-ide-text transition-colors"
          >
            <GitBranch className="w-4 h-4" />
            dhairya-soni
          </a>
        </div>
      </footer>
    </div>
  );
}
