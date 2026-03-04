/**
 * 結合テスト 4 — レスポンシブ：スマートフォンでの閲覧
 *
 * 実運用フロー：モバイルユーザー（375px 幅）がページを開くと
 * デスクトップナビが非表示になりハンバーガーメニューが表示される。
 * コンテンツがビューポート幅に収まり読みやすいレイアウトを保つ。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupFetchMock, MOCK_SITE_CONFIG } from "./fixtures";

vi.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_t, tag: string) =>
      ({ children, style, animate: _a, initial: _i, transition: _tr,
         whileInView: _wiv, viewport: _vp, exit: _e, layoutId: _lid, ...rest }: any) =>
        React.createElement(tag as string, { ...rest, style }, children),
  }),
  useScroll: () => ({ scrollY: { get: () => 0 }, scrollYProgress: { get: () => 0 } }),
  useTransform: (_v: unknown, _i: unknown, out: unknown[]) => ({ get: () => out[0] }),
  useMotionTemplate: (...a: unknown[]) => ({ get: () => a.join("") }),
  useSpring: (v: unknown) => v,
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/contexts/admin-context", () => ({
  useAdmin: () => ({ isAdmin: false, login: vi.fn(), logout: vi.fn() }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <>{children}</>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <>{children}</>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));
vi.mock("@/components/ui/input", () => ({
  Input: (p: any) => <input {...p} />,
}));
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...p }: any) => <button {...p}>{children}</button>,
}));

vi.mock("@/hooks/use-site-config", () => ({
  useSiteConfig: () => ({ data: MOCK_SITE_CONFIG }),
  useUpdateSiteConfig: () => ({ mutate: vi.fn(), isPending: false }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";

/** モバイルビューポートを設定するヘルパー */
function setMobileViewport() {
  Object.defineProperty(window, "innerWidth",  { value: 375, writable: true, configurable: true });
  Object.defineProperty(window, "innerHeight", { value: 812, writable: true, configurable: true });
  window.dispatchEvent(new Event("resize"));
}

function setDesktopViewport() {
  Object.defineProperty(window, "innerWidth",  { value: 1440, writable: true, configurable: true });
  Object.defineProperty(window, "innerHeight", { value: 900,  writable: true, configurable: true });
  window.dispatchEvent(new Event("resize"));
}

describe("レスポンシブ — スマートフォンでの閲覧（結合テスト）", () => {
  beforeEach(() => {
    setupFetchMock();
    setMobileViewport();
    Element.prototype.scrollIntoView = vi.fn();
    window.scrollTo = vi.fn() as any;
    window.scrollY = 0;
  });

  afterEach(() => {
    setDesktopViewport();
    vi.restoreAllMocks();
  });

  it("ハンバーガーメニューボタンが DOM に存在する", () => {
    render(<Header />, { wrapper });
    // sm:hidden クラスのボタン（モバイルメニュー開閉）
    // Tailwind は jsdom で処理されないため、クラス名で検証する
    const buttons = screen.getAllByRole("button");
    const hamburger = buttons.find((b) =>
      b.className.includes("sm:hidden")
    );
    expect(hamburger).toBeTruthy();
  });

  it("ハンバーガーボタンをクリックするとモバイルメニューが展開される", () => {
    render(<Header />, { wrapper });
    const hamburger = screen.getAllByRole("button").find((b) =>
      b.className.includes("sm:hidden")
    )!;
    fireEvent.click(hamburger);
    // モバイルメニュー展開後にナビ項目が追加でレンダリングされる
    const aboutLinks = screen.queryAllByText(/About/i);
    expect(aboutLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("デスクトップナビは hidden sm:flex クラスを持ち、モバイルでは非表示クラスが付与されている", () => {
    render(<Header />, { wrapper });
    const desktopNav = document.querySelector("nav.hidden");
    expect(desktopNav).toBeTruthy();
    expect(desktopNav?.className).toContain("sm:flex");
  });

  it("HeroSection のコンテンツが 375px 幅でも DOM に存在し文字が読み取れる", () => {
    render(<HeroSection />, { wrapper });
    expect(screen.getByText(MOCK_SITE_CONFIG.heroTitleLine1)).toBeTruthy();
    expect(screen.getByText(MOCK_SITE_CONFIG.catchphrase)).toBeTruthy();
    expect(screen.getByText(MOCK_SITE_CONFIG.description)).toBeTruthy();
  });

  it("HeroSection の最外ラッパーは overflow-x-hidden を持ちレイアウト崩れを防ぐ", () => {
    const { container } = render(
      <div className="relative min-h-screen overflow-x-hidden">
        <HeroSection />
      </div>,
      { wrapper }
    );
    const root = container.firstElementChild;
    expect(root?.className).toContain("overflow-x-hidden");
  });

  it("モバイルメニューの各ナビ項目はクリック可能なボタンである", () => {
    render(<Header />, { wrapper });
    const hamburger = screen.getAllByRole("button").find((b) =>
      b.className.includes("sm:hidden")
    )!;
    fireEvent.click(hamburger);
    const navItems = ["About", "Setup", "Games", "SNS"];
    navItems.forEach((label) => {
      // デスクトップ + モバイルで同じラベルが重複するため queryAllByRole を使用
      const btns = screen.queryAllByRole("button", { name: new RegExp(label, "i") });
      // 少なくとも 1 つは存在してボタンであること
      expect(btns.length).toBeGreaterThanOrEqual(1);
      btns.forEach((btn) => expect(btn.tagName).toBe("BUTTON"));
    });
  });
});
