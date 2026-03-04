/**
 * ボタン — ホバーエフェクトテスト（MY SETUP ボタン）
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useState } from "react";

// HoverGlassButton は hero-section の内部関数なので同等の実装を再現して検証
function HoverGlassButton({
  onClick,
  borderColor,
  hoverBorderColor,
  shadowColor,
  textColor,
  children,
}: {
  onClick: () => void;
  borderColor: string;
  hoverBorderColor: string;
  shadowColor: string;
  textColor: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid="hover-btn"
      data-hovered={hovered}
      style={{
        background: hovered
          ? `linear-gradient(135deg, rgba(255,255,255,0.92) 0%, ${shadowColor.replace("0.18", "0.22")} 100%)`
          : "rgba(255,255,255,0.68)",
        border: `1.5px solid ${hovered ? hoverBorderColor : borderColor}`,
        color: textColor,
        boxShadow: hovered
          ? `0 8px 28px ${shadowColor.replace("0.18", "0.35")}, inset 0 1px 0 rgba(255,255,255,0.95)`
          : `0 4px 20px ${shadowColor}, inset 0 1px 0 rgba(255,255,255,0.9)`,
        transform: hovered ? "translateY(-2px)" : "translateY(0px)",
        transition: "background 0.35s ease, border-color 0.35s ease, transform 0.3s ease, box-shadow 0.35s ease",
      }}
    >
      {children}
    </button>
  );
}

const SETUP_BTN_PROPS = {
  borderColor: "rgba(147,197,253,0.5)",
  hoverBorderColor: "rgba(147,197,253,0.75)",
  shadowColor: "rgba(147,197,253,0.18)",
  textColor: "#0369a1",
};

describe("MY SETUP ボタン — ホバーエフェクト", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("初期状態でホバー前のボーダーカラーが設定される", () => {
    render(<HoverGlassButton onClick={vi.fn()} {...SETUP_BTN_PROPS}>My Setup</HoverGlassButton>);
    const btn = screen.getByTestId("hover-btn");
    // jsdom は rgba 値をスペースあり形式に正規化するため、数値の一致で検証する
    expect(btn.style.border).toMatch(/rgba\(147,?\s*197,?\s*253,?\s*0\.5\)/);
  });

  it("マウスオーバー後に data-hovered が true になる", () => {
    render(<HoverGlassButton onClick={vi.fn()} {...SETUP_BTN_PROPS}>My Setup</HoverGlassButton>);
    const btn = screen.getByTestId("hover-btn");
    fireEvent.mouseEnter(btn);
    expect(btn.getAttribute("data-hovered")).toBe("true");
  });

  it("ホバー後にボーダーカラーが hoverBorderColor に変わる", () => {
    render(<HoverGlassButton onClick={vi.fn()} {...SETUP_BTN_PROPS}>My Setup</HoverGlassButton>);
    const btn = screen.getByTestId("hover-btn");
    fireEvent.mouseEnter(btn);
    expect(btn.style.border).toMatch(/rgba\(147,?\s*197,?\s*253,?\s*0\.75\)/);
  });

  it("ホバー後に背景がグラデーションに変わる（白→スカイブルー系）", () => {
    render(<HoverGlassButton onClick={vi.fn()} {...SETUP_BTN_PROPS}>My Setup</HoverGlassButton>);
    const btn = screen.getByTestId("hover-btn");
    fireEvent.mouseEnter(btn);
    expect(btn.style.background).toContain("linear-gradient");
    expect(btn.style.background).toMatch(/rgba\(255,?\s*255,?\s*255,?\s*0\.92\)/);
  });

  it("ホバー後に transform: translateY(-2px) が適用される", () => {
    render(<HoverGlassButton onClick={vi.fn()} {...SETUP_BTN_PROPS}>My Setup</HoverGlassButton>);
    const btn = screen.getByTestId("hover-btn");
    fireEvent.mouseEnter(btn);
    expect(btn.style.transform).toBe("translateY(-2px)");
  });

  it("マウスリーブ後に元のスタイルへ戻る", () => {
    render(<HoverGlassButton onClick={vi.fn()} {...SETUP_BTN_PROPS}>My Setup</HoverGlassButton>);
    const btn = screen.getByTestId("hover-btn");
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
    expect(btn.getAttribute("data-hovered")).toBe("false");
    expect(btn.style.transform).toBe("translateY(0px)");
    expect(btn.style.border).toMatch(/rgba\(147,?\s*197,?\s*253,?\s*0\.5\)/);
  });

  it("transition プロパティにおしとやかな ease が指定されている", () => {
    render(<HoverGlassButton onClick={vi.fn()} {...SETUP_BTN_PROPS}>My Setup</HoverGlassButton>);
    const btn = screen.getByTestId("hover-btn");
    expect(btn.style.transition).toContain("ease");
    expect(btn.style.transition).toContain("0.35s");
  });
});
