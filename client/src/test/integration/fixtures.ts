/**
 * 結合テスト用 — 実運用データフィクスチャ
 *
 * 実際の運用フローを想定し、シード処理で投入されるデータと
 * 同等の構造・内容を再現している。
 */

export const MOCK_PROFILE = {
  id: 1,
  name: "ぽんらめ",
  bio: "FPSとRPGが大好きなゲーマーです。最近はPCの自作にもハマっています。よろしくお願いします！",
  avatarUrl: null,
};

export const MOCK_DEVICES = [
  { id: 1, name: "Custom PC (白統一)", category: "Desktop", specs: "Core i7 13700K / RTX 4080 / 32GB RAM" },
  { id: 2, name: "Logicool G PRO X SUPERLIGHT", category: "Mouse", specs: "ワイヤレス / 63g 軽量" },
  { id: 3, name: "Wooting 60HE", category: "Keyboard", specs: "ラピッドトリガー搭載 / 60%サイズ" },
  { id: 4, name: "BenQ ZOWIE XL2546K", category: "Monitor", specs: "24.5インチ / 240Hz / TNパネル" },
];

export const MOCK_GAMES = [
  { id: 1, title: "Apex Legends", platform: "PC", description: "メインでプレイしているバトロワ。マスター目指して練習中！" },
  { id: 2, title: "Cyberpunk 2077", platform: "PC/PS5", description: "世界観とストーリーが最高。ナイトシティの探索が止まらない。" },
  { id: 3, title: "ELDEN RING", platform: "PC", description: "ビルドを考えるのが楽しいアクションRPG。DLCもクリア済み。" },
];

export const MOCK_SNS = [
  { id: 1, platform: "Twitter", url: "https://twitter.com/ponrame", displayOrder: 0 },
  { id: 2, platform: "GitHub", url: "https://github.com/ponrame", displayOrder: 1 },
  { id: 3, platform: "Discord", url: "https://discord.com/invite/test", displayOrder: 2 },
  { id: 4, platform: "YouTube", url: "https://youtube.com/@ponrame", displayOrder: 3 },
];

export const MOCK_SITE_CONFIG = {
  id: 1,
  heroSubtitle: "✨ Collection File Set ✨",
  heroTitleLine1: "Welcome to",
  heroTitleLine2: "my file🔖",
  catchphrase: "My favorites, My style.",
  description: "私の『好き』を詰め込んだデジタルコレクションファイル。",
  thankYouMessage: "Thank you for looking ദി >⩊<︎︎ ͡ 𐦯",
};

/** fetch モック：API パスに応じて適切なフィクスチャを返す */
export function setupFetchMock() {
  global.fetch = vi.fn((url: string) => {
    const path = typeof url === "string" ? url : "";
    let body: unknown = {};

    if (path.includes("/api/profile"))     body = MOCK_PROFILE;
    else if (path.includes("/api/devices")) body = MOCK_DEVICES;
    else if (path.includes("/api/games"))   body = MOCK_GAMES;
    else if (path.includes("/api/sns"))     body = MOCK_SNS;
    else if (path.includes("/api/site-config")) body = MOCK_SITE_CONFIG;

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(body),
    } as Response);
  });
}
