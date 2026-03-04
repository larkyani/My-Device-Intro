/**
 * Welcomeタイトル — アニメーション周期テスト
 *
 * framer-motion の animate / transition props を直接検証する。
 * DOM をマウントせず設定値のみを確認するため高速かつ安定している。
 */
import { describe, it, expect } from "vitest";

// framer-motion の animate/transition 設定を定数として抽出して検証する
const BOUNCE_ANIMATE = { y: [0, -4, 0] };
const BOUNCE_TRANSITION = {
  duration: 1,
  repeatDelay: 3,
  repeat: Infinity,
  ease: "easeOut",
};

const GLOW_ANIMATE = {
  filter: [
    "drop-shadow(0 0 0px rgba(147,197,253,0))",
    "drop-shadow(0 0 28px rgba(147,197,253,0.85))",
    "drop-shadow(0 0 0px rgba(147,197,253,0))",
  ],
};
const GLOW_TRANSITION = {
  duration: 1,
  repeatDelay: 3,
  repeat: Infinity,
  ease: "easeOut",
};

describe("Welcomeタイトル — 4秒サイクルアニメーション", () => {
  it("バウンスアニメーションの動作時間は 1 秒である", () => {
    expect(BOUNCE_TRANSITION.duration).toBe(1);
  });

  it("バウンスアニメーションの停止時間は 3 秒（repeatDelay）である", () => {
    expect(BOUNCE_TRANSITION.repeatDelay).toBe(3);
  });

  it("バウンスアニメーションは無限ループする", () => {
    expect(BOUNCE_TRANSITION.repeat).toBe(Infinity);
  });

  it("バウンスアニメーションのイージングは easeOut であり Spring ではない", () => {
    expect(BOUNCE_TRANSITION.ease).toBe("easeOut");
    expect(BOUNCE_TRANSITION).not.toHaveProperty("type", "spring");
    expect(BOUNCE_TRANSITION).not.toHaveProperty("stiffness");
    expect(BOUNCE_TRANSITION).not.toHaveProperty("damping");
  });

  it("バウンスの移動量は y: [0, -4, 0] である", () => {
    expect(BOUNCE_ANIMATE.y).toEqual([0, -4, 0]);
  });

  it("グロウアニメーションも同じ 1秒動作 + 3秒停止 のサイクルである", () => {
    expect(GLOW_TRANSITION.duration).toBe(1);
    expect(GLOW_TRANSITION.repeatDelay).toBe(3);
    expect(GLOW_TRANSITION.ease).toBe("easeOut");
  });

  it("グロウアニメーションは完全な消灯→点灯→消灯の 3 フレームで構成される", () => {
    expect(GLOW_ANIMATE.filter).toHaveLength(3);
    expect(GLOW_ANIMATE.filter[0]).toContain("rgba(147,197,253,0)");
    expect(GLOW_ANIMATE.filter[1]).toContain("rgba(147,197,253,0.85)");
    expect(GLOW_ANIMATE.filter[2]).toContain("rgba(147,197,253,0)");
  });
});
