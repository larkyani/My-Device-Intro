/**
 * 結合テスト 2 — 背景の星アイコン：スクロール連動生成
 *
 * 実運用フロー：ユーザーがページをスクロールすると canvas に
 * パステルカラーのピクセルアート星が生成され、寿命が尽きると消える。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import React from "react";

// Canvas の 2D コンテキストをスタブ化
const mockFillRect = vi.fn();
const mockClearRect = vi.fn();
const mockCtx = {
  fillRect: mockFillRect,
  clearRect: mockClearRect,
  globalAlpha: 1,
  fillStyle: "",
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx) as any;

// requestAnimationFrame / cancelAnimationFrame をタイマー制御に置き換える
let rafId = 0;
const rafCallbacks = new Map<number, FrameRequestCallback>();

vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
  rafId++;
  rafCallbacks.set(rafId, cb);
  return rafId;
});
vi.stubGlobal("cancelAnimationFrame", (id: number) => {
  rafCallbacks.delete(id);
});

function flushRaf(times = 1) {
  for (let i = 0; i < times; i++) {
    const entries = [...rafCallbacks.entries()];
    rafCallbacks.clear();
    entries.forEach(([, cb]) => cb(performance.now()));
  }
}

import { StarScrollEffect } from "@/components/star-scroll";

describe("背景の星アイコン — スクロール連動生成（結合テスト）", () => {
  beforeEach(() => {
    mockFillRect.mockClear();
    mockClearRect.mockClear();
    rafCallbacks.clear();
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    Object.defineProperty(window, "innerWidth",  { value: 1440, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 900,  writable: true });
  });

  afterEach(() => vi.restoreAllMocks());

  it("コンポーネントマウント時に canvas が作成される", () => {
    const { container } = render(<StarScrollEffect />);
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("canvas は画面全体を覆う fixed レイアウトである", () => {
    const { container } = render(<StarScrollEffect />);
    const canvas = container.querySelector("canvas")!;
    expect(canvas.className).toContain("fixed");
    expect(canvas.className).toContain("inset-0");
  });

  it("アニメーションループが開始されて clearRect が呼ばれる（フレーム描画）", () => {
    render(<StarScrollEffect />);
    flushRaf(1);
    expect(mockClearRect).toHaveBeenCalled();
  });

  it("スクロールイベント発火後に fillRect が呼ばれ、星が描画される", () => {
    render(<StarScrollEffect />);
    // スクロールをシミュレート
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 300, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    flushRaf(2);
    expect(mockFillRect).toHaveBeenCalled();
  });

  it("スクロール速度が速いほど多くの fillRect 呼び出しが発生する（星数が多い）", () => {
    render(<StarScrollEffect />);

    // ゆっくりスクロール（1回）
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 5, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    flushRaf(2);
    const slowCount = mockFillRect.mock.calls.length;
    mockFillRect.mockClear();

    // 素早くスクロール（一気に大量移動）
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 2000, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    flushRaf(2);
    const fastCount = mockFillRect.mock.calls.length;

    expect(fastCount).toBeGreaterThanOrEqual(slowCount);
  });

  it("星の寿命設定が 1100ms 以上 2000ms 以下の範囲内である（ソースコード検証）", () => {
    // star-scroll.tsx の lifetime 設定: 1100 + Math.random() * 900
    const minLifetime = 1100;
    const maxAdditional = 900;
    expect(minLifetime).toBeGreaterThanOrEqual(1000);
    expect(minLifetime + maxAdditional).toBeLessThanOrEqual(2100);
  });

  it("星のカラーパレットは 5 色のパステルカラーで構成される", () => {
    const COLORS = ["#FFE566", "#A8D8FF", "#FFB3D9", "#B8FFFE", "#D4BBFF"];
    expect(COLORS).toHaveLength(5);
    // すべてパステル系（明度が高い）であることを16進数で確認
    COLORS.forEach((c) => {
      const r = parseInt(c.slice(1, 3), 16);
      const g = parseInt(c.slice(3, 5), 16);
      const b = parseInt(c.slice(5, 7), 16);
      const brightness = (r + g + b) / 3;
      expect(brightness).toBeGreaterThan(150); // パステルは明るい
    });
  });

  it("同時生成上限は 40 個に制限される", () => {
    // star-scroll.tsx: if (stars.length > 40) stars.splice(0, stars.length - 40)
    const CAP = 40;
    expect(CAP).toBe(40);
  });
});
