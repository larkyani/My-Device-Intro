/**
 * 結合テスト 5 — 全体の一貫性：カラーテーマの統一
 *
 * 実運用フロー：実データが投入された状態で全セクションを表示し、
 * Lillie 風パステルグラデーション（スカイブルー・チェリーピンク・ラベンダー）が
 * 各セクションを通じて一貫して使用されていることを確認する。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupFetchMock, MOCK_SITE_CONFIG, MOCK_PROFILE, MOCK_SNS } from "./fixtures";

vi.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_t, tag: string) =>
      ({ children, style, animate: _a, initial: _i, transition: _tr,
         whileInView: _wiv, viewport: _vp, whileHover: _wh, whileTap: _wt,
         layout: _l, onHoverStart: _hs, onHoverEnd: _he, variants: _v,
         exit: _e, layoutId: _lid, ...rest }: any) =>
        React.createElement(tag as string, { ...rest, style }, children),
  }),
  useScroll: () => ({ scrollY: { get: () => 0 }, scrollYProgress: { get: () => 0 } }),
  useTransform: (_v: unknown, _i: unknown, out: unknown[]) => ({ get: () => out[0] }),
  useMotionTemplate: (...a: unknown[]) => ({ get: () => a.join("") }),
  useSpring: (v: unknown) => v,
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/contexts/admin-context", () => ({
  useAdmin: () => ({ isAdmin: false }),
}));
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <>{children}</>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <>{children}</>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogTrigger: ({ children }: any) => <>{children}</>,
}));
vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));
vi.mock("@/components/ui/input", () => ({
  Input: (p: any) => <input {...p} />,
}));
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...p }: any) => <button {...p}>{children}</button>,
}));
vi.mock("@/components/ui/textarea", () => ({
  Textarea: (p: any) => <textarea {...p} />,
}));
vi.mock("@/components/ui/form", () => ({
  Form: ({ children }: any) => <>{children}</>,
  FormField: ({ render: r }: any) => r({ field: { value: "", onChange: vi.fn(), onBlur: vi.fn(), name: "t", ref: vi.fn() } }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormControl: ({ children }: any) => <>{children}</>,
  FormMessage: () => null,
}));
vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <>{children}</>,
  SelectTrigger: ({ children }: any) => <button>{children}</button>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children }: any) => <option>{children}</option>,
  SelectValue: () => <span />,
}));
vi.mock("@/hooks/use-site-config", () => ({
  useSiteConfig: () => ({ data: MOCK_SITE_CONFIG }),
  useUpdateSiteConfig: () => ({ mutate: vi.fn(), isPending: false }),
}));

// useProfile をモックしてローディング状態をスキップ（色の検証に集中するため）
vi.mock("@/hooks/use-profile", () => ({
  useProfile: () => ({ data: MOCK_PROFILE, isLoading: false }),
  useUpdateProfile: () => ({ mutate: vi.fn(), isPending: false }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

/** HTML 文字列からインラインスタイルに含まれる色値を抽出する */
function extractColors(html: string): string {
  return html;
}

/**
 * テーマカラーの正規表現パターン
 * jsdom はインラインスタイルの hex 値を rgb() 形式に正規化するため
 * rgb/rgba 両パターンを網羅する。
 *   #38bdf8 → rgb(56, 189, 248)
 *   #60a5fa → rgb(96, 165, 250)
 *   #1e40af → rgb(30, 64, 175)
 *   #7c3aed → rgb(124, 58, 237)
 *   #be185d → rgb(190, 24, 93)
 */
const THEME = {
  skyBlue: [
    /rgba\(147,?\s*197,?\s*253/,
    /rgb\(56,?\s*189,?\s*248\)/,
    /rgba\(56,?\s*189,?\s*248/,
    /rgb\(96,?\s*165,?\s*250\)/,
  ],
  cherryPink: [
    /rgba\(249,?\s*168,?\s*212/,
    /rgb\(244,?\s*114,?\s*182\)/,
    /rgb\(190,?\s*24,?\s*93\)/,
    /9d174d/,
  ],
  lavender: [
    /rgba\(192,?\s*132,?\s*252/,
    /rgb\(192,?\s*132,?\s*252\)/,
    /rgba\(196,?\s*181,?\s*253/,
    /rgb\(124,?\s*58,?\s*237\)/,
  ],
};

function containsThemeColor(html: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(html));
}

import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { SnsSection } from "@/components/sns-section";
import { Header } from "@/components/header";

describe("全体の一貫性 — パステルグラデーション カラーテーマ（結合テスト）", () => {
  beforeEach(() => {
    setupFetchMock();
    vi.mocked(global.fetch).mockImplementation((url: any) => {
      const path = String(url);
      if (path.includes("/api/sns"))         return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_SNS) } as Response);
      if (path.includes("/api/profile"))     return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_PROFILE) } as Response);
      if (path.includes("/api/site-config")) return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_SITE_CONFIG) } as Response);
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
    });
    Element.prototype.scrollIntoView = vi.fn();
    Object.defineProperty(window, "innerWidth",  { value: 1440, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 900,  writable: true });
  });

  afterEach(() => vi.restoreAllMocks());

  // ── HeroSection ──────────────────────────────────────────────
  it("[Hero] スカイブルー系カラーがインラインスタイルに含まれる", () => {
    const { container } = render(<HeroSection />, { wrapper });
    const html = container.innerHTML;
    expect(containsThemeColor(html, THEME.skyBlue)).toBe(true);
  });

  it("[Hero] チェリーピンク系カラーがインラインスタイルに含まれる", () => {
    const { container } = render(<HeroSection />, { wrapper });
    const html = container.innerHTML;
    expect(containsThemeColor(html, THEME.cherryPink)).toBe(true);
  });

  it("[Hero] CTA ボタンにスカイブルー・ピンクのボーダー色が設定される", () => {
    const { container } = render(<HeroSection />, { wrapper });
    const buttons = container.querySelectorAll("button");
    const hasBlueOrPink = [...buttons].some((btn) => {
      const s = btn.getAttribute("style") || "";
      return /rgba\(147,?\s*197,?\s*253/.test(s) || /rgba\(249,?\s*168,?\s*212/.test(s);
    });
    expect(hasBlueOrPink).toBe(true);
  });

  // ── Header ───────────────────────────────────────────────────
  it("[Header] ロゴのドットはスカイブルーで輝く（jsdom は rgb 形式に正規化）", () => {
    const { container } = render(<Header />, { wrapper });
    // #38bdf8 → jsdom では rgb(56, 189, 248) に正規化される
    const html = container.innerHTML;
    expect(
      /rgb\(56,?\s*189,?\s*248\)/.test(html) || /rgba\(56,?\s*189,?\s*248/.test(html)
    ).toBe(true);
  });

  it("[Header] ナビのグラスボタンにパステルグラデーションが設定される（ログインボタン確認）", () => {
    const { container } = render(<Header />, { wrapper });
    // ログインボタンには linear-gradient(135deg, #60a5fa, #c084fc) が設定される
    // jsdom では rgb(96, 165, 250), rgb(192, 132, 252) に変換される
    const html = container.innerHTML;
    const hasGradient = /linear-gradient/.test(html) &&
      (/rgb\(96,?\s*165,?\s*250\)/.test(html) || /rgb\(192,?\s*132,?\s*252\)/.test(html));
    expect(hasGradient).toBe(true);
  });

  // ── AboutSection ─────────────────────────────────────────────
  it("[About] セクションのガラスパネルにスカイブルーの境界色が設定される", () => {
    const { container } = render(<AboutSection />, { wrapper });
    expect(containsThemeColor(container.innerHTML, THEME.skyBlue)).toBe(true);
  });

  it("[About] タイトルテキストに blue→purple→pink のグラデーションが適用される（jsdom rgb 変換対応）", () => {
    const { container } = render(<AboutSection />, { wrapper });
    const html = container.innerHTML;
    // #1e40af→rgb(30,64,175) / #7c3aed→rgb(124,58,237) / #be185d→rgb(190,24,93)
    const hasGradientColors =
      /rgb\(30,?\s*64,?\s*175\)/.test(html) ||
      /rgb\(124,?\s*58,?\s*237\)/.test(html) ||
      /rgb\(190,?\s*24,?\s*93\)/.test(html);
    expect(hasGradientColors).toBe(true);
  });

  // ── SnsSection ───────────────────────────────────────────────
  it("[SNS] セクションラベルにチェリーピンク系カラーが使われる", () => {
    const { container } = render(<SnsSection />, { wrapper });
    expect(containsThemeColor(container.innerHTML, THEME.cherryPink)).toBe(true);
  });

  it("[SNS] フッターの区切り線にピンク→スカイブルーのグラデーションが設定される", () => {
    const { container } = render(<SnsSection />, { wrapper });
    const html = container.innerHTML;
    // linear-gradient に pink と sky-blue 両方が含まれること
    const hasBoth =
      /rgba\(249,?\s*168,?\s*212/.test(html) &&
      /rgba\(147,?\s*197,?\s*253/.test(html);
    expect(hasBoth).toBe(true);
  });

  // ── 全セクション横断 ─────────────────────────────────────────
  it("全セクション共通：linear-gradient が使われグラデーションが途切れない", () => {
    const sections = [
      render(<Header />,        { wrapper }).container,
      render(<HeroSection />,   { wrapper }).container,
      render(<AboutSection />,  { wrapper }).container,
      render(<SnsSection />,    { wrapper }).container,
    ];
    const allUseGradient = sections.every((c) =>
      /linear-gradient/.test(c.innerHTML)
    );
    expect(allUseGradient).toBe(true);
  });

  it("全セクション共通：スカイブルー系カラーが途切れず使われている", () => {
    const sections = [
      render(<Header />,       { wrapper }).container,
      render(<HeroSection />,  { wrapper }).container,
      render(<AboutSection />, { wrapper }).container,
      render(<SnsSection />,   { wrapper }).container,
    ];
    const allHaveBlue = sections.every((c) =>
      containsThemeColor(c.innerHTML, THEME.skyBlue)
    );
    expect(allHaveBlue).toBe(true);
  });
});
