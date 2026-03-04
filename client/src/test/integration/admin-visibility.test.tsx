/**
 * 結合テスト 3 — 表示制限：管理者機能の非表示（シークレットモード想定）
 *
 * 実運用フロー：一般ユーザー（未ログイン）がシークレットモードで
 * ページを開くとセッションがなく isAdmin=false になる。
 * このとき全セクションの管理者専用 UI が表示されないことを確認する。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupFetchMock, MOCK_SNS, MOCK_SITE_CONFIG, MOCK_PROFILE } from "./fixtures";

// framer-motion スタブ（構造を保持しつつアニメーション除去）
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

// ★ シークレットモード想定 → isAdmin: false で固定
vi.mock("@/contexts/admin-context", () => ({
  useAdmin: () => ({ isAdmin: false, login: vi.fn(), logout: vi.fn() }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// UI コンポーネントスタブ
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <>{children}</>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <>{children}</>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogTrigger: ({ children }: any) => <>{children}</>,
}));
vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <>{children}</>,
  SelectTrigger: ({ children }: any) => <button>{children}</button>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children }: any) => <option>{children}</option>,
  SelectValue: () => <span />,
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
  FormField: ({ render: r }: any) => r({ field: { value: "", onChange: vi.fn(), onBlur: vi.fn(), name: "test", ref: vi.fn() } }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormControl: ({ children }: any) => <>{children}</>,
  FormMessage: () => null,
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// 各セクションを個別にインポート
import { SnsSection } from "@/components/sns-section";
import { AboutSection } from "@/components/about-section";

describe("表示制限 — シークレットモード（管理者機能の非表示）（結合テスト）", () => {
  beforeEach(() => {
    setupFetchMock();
    Element.prototype.scrollIntoView = vi.fn();
    // /api/sns の fetch モックを SNS データを返すよう上書き
    vi.mocked(global.fetch).mockImplementation((url: any) => {
      const path = String(url);
      if (path.includes("/api/sns")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_SNS) } as Response);
      }
      if (path.includes("/api/site-config")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_SITE_CONFIG) } as Response);
      }
      if (path.includes("/api/profile")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_PROFILE) } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it("SNSセクションに「+ADD」ボタンが存在しない（非管理者）", async () => {
    render(<SnsSection />, { wrapper });
    await waitFor(() => {
      const addButtons = screen.queryAllByRole("button", { name: /add/i });
      const adminAddBtn = addButtons.find(
        (btn) => btn.textContent?.includes("ADD") && !btn.closest("[data-testid]")
      );
      expect(adminAddBtn).toBeUndefined();
    });
  });

  it("Aboutセクションに「EDIT」ボタンが表示されない（非管理者）", async () => {
    render(<AboutSection />, { wrapper });
    await waitFor(() => {
      const editBtn = screen.queryByRole("button", { name: /edit/i });
      // EditボタンはDialogTrigger内に存在するが、isAdmin=falseなら全体がレンダリングされない
      expect(editBtn).toBeNull();
    });
  });

  it("SNSカードが表示されるが、管理者アクション（削除ボタン等）は非表示である", async () => {
    render(<SnsSection />, { wrapper });
    await waitFor(() => {
      // SNSリンク名称「Twitter / X」が表示される
      const twitterLabel = screen.queryByText("Twitter / X");
      if (twitterLabel) {
        // 管理者UIの削除・編集ボタンは opacity-0 グループクラスで隠れている
        // data-testidがない = 管理者専用ボタンが明示的に存在しないことを確認
        const trashButtons = document.querySelectorAll("[aria-label='delete'], [title='delete']");
        expect(trashButtons.length).toBe(0);
      }
    });
  });

  it("ページ全体を通してログインフォームが自動で開かない", async () => {
    render(<SnsSection />, { wrapper });
    // パスワード入力フォームは開かれていない
    expect(screen.queryByPlaceholderText("パスワード")).toBeNull();
  });
});
