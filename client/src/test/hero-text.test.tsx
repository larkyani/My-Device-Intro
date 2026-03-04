/**
 * Welcomeタイトル — テキストの動的表示テスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// framer-motion をスタブ化（アニメーションなし）
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_t, tag: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ children, style: _s, animate: _a, ...rest }: any) =>
          React.createElement(tag === "div" ? "div" : tag, rest, children),
    }
  ),
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: (_v: unknown, _i: unknown, output: unknown[]) => ({ get: () => output[0] }),
  useMotionTemplate: (...args: unknown[]) => args.join(""),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// useAdmin — 非管理者として固定
vi.mock("@/contexts/admin-context", () => ({
  useAdmin: () => ({ isAdmin: false, login: vi.fn(), logout: vi.fn() }),
}));

// useToast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// useSiteConfig をカスタム値で差し替え
const mockConfig = {
  heroSubtitle: "✨ TEST SUBTITLE ✨",
  heroTitleLine1: "Hello to",
  heroTitleLine2: "test world📝",
  catchphrase: "テスト用キャッチフレーズ。",
  description: "これはテスト用の説明文です。",
  thankYouMessage: "Thanks for testing",
};

vi.mock("@/hooks/use-site-config", () => ({
  useSiteConfig: () => ({ data: mockConfig }),
  useUpdateSiteConfig: () => ({ mutate: vi.fn(), isPending: false }),
}));

import { HeroSection } from "@/components/hero-section";

describe("Welcomeタイトル — テキストの動的表示", () => {
  beforeEach(() => {
    // scrollIntoView はjsdomに未実装のためスタブ
    Element.prototype.scrollIntoView = vi.fn();
    // scrollYProgress を使う useScroll のスタブ対応
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    Object.defineProperty(window, "innerWidth", { value: 1440, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 900, writable: true });
  });

  it("heroSubtitle がサブタイトルとして表示される", () => {
    render(<HeroSection />);
    expect(screen.getByText("✨ TEST SUBTITLE ✨")).toBeInTheDocument();
  });

  it("heroTitleLine1 がタイトル1行目として表示される", () => {
    render(<HeroSection />);
    expect(screen.getByText("Hello to")).toBeInTheDocument();
  });

  it("heroTitleLine2 がタイトル2行目として表示される", () => {
    render(<HeroSection />);
    expect(screen.getByText("test world📝")).toBeInTheDocument();
  });

  it("catchphrase が表示される", () => {
    render(<HeroSection />);
    expect(screen.getByText("テスト用キャッチフレーズ。")).toBeInTheDocument();
  });

  it("description が表示される", () => {
    render(<HeroSection />);
    expect(screen.getByText("これはテスト用の説明文です。")).toBeInTheDocument();
  });
});
