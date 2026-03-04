/**
 * 結合テスト 1 — スクロール演出：タイトルのフェードアウト
 *
 * 実運用フロー：ユーザーがページを開き、下へスクロールすると
 * ヒーロータイトルが blur を伴いながらフェードアウトする。
 *
 * framer-motion の useTransform に渡される入力範囲・出力範囲を
 * 検証し、スクロール進捗 0→0.45 の区間で正確に消えること、
 * かつ blur 値が 0→4px へ増加することを確認する。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import React from "react";
import { setupFetchMock, MOCK_SITE_CONFIG } from "./fixtures";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ── useTransform 呼び出しを記録するスパイ ──────────────────────────────
const transformCalls: Array<{ inputRange: number[]; outputRange: number[] }> = [];

vi.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_t, tag: string) =>
      ({ children, style, animate: _a, initial: _i, transition: _tr,
         whileInView: _wiv, viewport: _vp, ...rest }: any) =>
        React.createElement(tag as string, { ...rest, style }, children),
  }),
  useScroll: () => ({
    scrollYProgress: { get: () => 0 },
    scrollY: { get: () => 0 },
  }),
  useTransform: (_mv: unknown, inputRange: number[], outputRange: number[]) => {
    if (Array.isArray(inputRange) && Array.isArray(outputRange)) {
      transformCalls.push({ inputRange, outputRange });
    }
    return { get: () => outputRange[0] };
  },
  useSpring: (v: unknown) => v,
  useMotionTemplate: (...args: unknown[]) => ({ get: () => args.join("") }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/contexts/admin-context", () => ({
  useAdmin: () => ({ isAdmin: false }),
}));
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));
vi.mock("@/hooks/use-site-config", () => ({
  useSiteConfig: () => ({ data: MOCK_SITE_CONFIG }),
  useUpdateSiteConfig: () => ({ mutate: vi.fn(), isPending: false }),
}));

import { HeroSection } from "@/components/hero-section";

/** framer-motion の線形補間を再現して transform の振る舞いを検証する */
function interpolate(progress: number, inputRange: [number, number], outputRange: [number, number]) {
  const t = Math.max(0, Math.min(1, (progress - inputRange[0]) / (inputRange[1] - inputRange[0])));
  return outputRange[0] + t * (outputRange[1] - outputRange[0]);
}

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("スクロール演出 — タイトルのフェードアウト（結合テスト）", () => {
  beforeEach(() => {
    setupFetchMock();
    transformCalls.length = 0;
    Element.prototype.scrollIntoView = vi.fn();
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    Object.defineProperty(window, "innerWidth", { value: 1440, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 900, writable: true });
  });

  afterEach(() => vi.restoreAllMocks());

  it("HeroSection がマウントされ、コンテンツが表示される", () => {
    const { getByText } = render(<HeroSection />, { wrapper });
    expect(getByText(MOCK_SITE_CONFIG.heroTitleLine1)).toBeTruthy();
  });

  it("opacity のトランスフォームはスクロール進捗 0→0.45 の区間で 1→0 に変化するよう設定される", () => {
    render(<HeroSection />, { wrapper });
    const opacityTransform = transformCalls.find(
      ({ inputRange, outputRange }) =>
        inputRange[0] === 0 && inputRange[1] === 0.45 &&
        outputRange[0] === 1 && outputRange[1] === 0
    );
    expect(opacityTransform).toBeDefined();
  });

  it("スクロール開始時（progress=0）の opacity は 1 である", () => {
    render(<HeroSection />, { wrapper });
    const t = transformCalls.find(c => c.outputRange[0] === 1 && c.outputRange[1] === 0);
    expect(t).toBeDefined();
    expect(interpolate(0, [0, 0.45], [1, 0])).toBe(1);
  });

  it("スクロール終了時（progress=0.45）の opacity は 0 である", () => {
    render(<HeroSection />, { wrapper });
    expect(interpolate(0.45, [0, 0.45], [1, 0])).toBe(0);
  });

  it("中間（progress=0.225）の opacity は約 0.5 で滑らかに減衰する", () => {
    render(<HeroSection />, { wrapper });
    const mid = interpolate(0.225, [0, 0.45], [1, 0]);
    expect(mid).toBeCloseTo(0.5, 1);
  });

  it("blur のトランスフォームはスクロール進捗 0→0.45 で 0px→4px に変化するよう設定される", () => {
    render(<HeroSection />, { wrapper });
    const blurTransform = transformCalls.find(
      ({ inputRange, outputRange }) =>
        inputRange[0] === 0 && inputRange[1] === 0.45 &&
        outputRange[0] === 0 && outputRange[1] === 4
    );
    expect(blurTransform).toBeDefined();
  });

  it("スクロール完了時の blur は 4px になる", () => {
    render(<HeroSection />, { wrapper });
    expect(interpolate(0.45, [0, 0.45], [0, 4])).toBe(4);
  });

  it("opacity と blur は同じスクロール区間（0〜0.45）で連動して変化する", () => {
    render(<HeroSection />, { wrapper });
    const opacityT = transformCalls.find(c => c.outputRange[0] === 1 && c.outputRange[1] === 0);
    const blurT    = transformCalls.find(c => c.outputRange[0] === 0 && c.outputRange[1] === 4);
    expect(opacityT?.inputRange).toEqual(blurT?.inputRange);
  });
});
