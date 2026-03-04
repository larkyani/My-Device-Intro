/**
 * ナビゲーション — 各リンクの遷移先テスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_t, tag: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ children, ...rest }: any) =>
          React.createElement(tag as string, rest, children),
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/contexts/admin-context", () => ({
  useAdmin: () => ({ isAdmin: false, login: vi.fn(), logout: vi.fn() }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Dialog スタブ（ログインダイアログが DOM に影響しないよう）
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) =>
    <button {...props}>{children}</button>,
}));

import { Header } from "@/components/header";

const NAV_ITEMS = [
  { label: "About",  id: "about" },
  { label: "Setup",  id: "setup" },
  { label: "Games",  id: "games" },
  { label: "SNS",    id: "sns"   },
];

describe("ナビゲーション — クリックで対応セクションへスクロール", () => {
  beforeEach(() => {
    // 各セクション要素をDOMに追加
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.createElement("section");
      el.id = id;
      document.body.appendChild(el);
    });
    // scrollIntoView と window.scrollTo をスタブ
    Element.prototype.scrollIntoView = vi.fn();
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  });

  afterEach(() => {
    // セクション要素をクリーンアップ
    NAV_ITEMS.forEach(({ id }) => {
      document.getElementById(id)?.remove();
    });
    vi.restoreAllMocks();
  });

  it.each(NAV_ITEMS)(
    "「$label」クリック → #$id の scrollIntoView が呼ばれる",
    async ({ label, id }) => {
      render(<Header />);
      const btn = screen.getByRole("button", { name: new RegExp(label, "i") });
      await userEvent.click(btn);

      const target = document.getElementById(id)!;
      expect(target.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      });
    }
  );
});
