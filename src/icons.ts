// SVGs exported from the Figma file as-is (node ids in comments).

// 7:260 Group 3 — merchant avatar
export const AVATAR = `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="22" cy="22" r="22" fill="#D93E40" fill-opacity="0.21"/>
<path d="M15.1154 26.8632C14.7036 27.275 14.7036 27.9427 15.1154 28.3546C15.5272 28.7664 16.1949 28.7664 16.6068 28.3546L15.8611 27.6089L15.1154 26.8632ZM28.5783 15.9462C28.5783 15.3638 28.1062 14.8917 27.5237 14.8917L18.0326 14.8917C17.4502 14.8917 16.978 15.3638 16.978 15.9462C16.978 16.5287 17.4502 17.0008 18.0326 17.0008H26.4692V25.4374C26.4692 26.0198 26.9413 26.4919 27.5237 26.4919C28.1062 26.4919 28.5783 26.0198 28.5783 25.4374L28.5783 15.9462ZM15.8611 27.6089L16.6068 28.3546L28.2694 16.6919L27.5237 15.9462L26.778 15.2005L15.1154 26.8632L15.8611 27.6089Z" fill="white"/>
</svg>`;

// 7:266 close
export const CLOSE = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="#A1A1AA" stroke-width="1.51667" stroke-linecap="round"/>
</svg>`;

// 7:269 lock (colour swapped for the disabled state)
export const lock = (color: string) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11 7.33337H5.00004C4.07957 7.33337 3.33337 8.07957 3.33337 9.00004V12.3334C3.33337 13.2538 4.07957 14 5.00004 14H11C11.9205 14 12.6667 13.2538 12.6667 12.3334V9.00004C12.6667 8.07957 11.9205 7.33337 11 7.33337Z" stroke="${color}" stroke-width="1.46667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5.33337 7.33329V5.33329C5.33337 4.62605 5.61433 3.94777 6.11442 3.44767C6.61452 2.94758 7.2928 2.66663 8.00004 2.66663C8.70728 2.66663 9.38556 2.94758 9.88566 3.44767C10.3858 3.94777 10.6667 4.62605 10.6667 5.33329V7.33329" stroke="${color}" stroke-width="1.46667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// 7:282 chevrons
export const CHEVRONS = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.6665 7.33333L9.99984 4L13.3332 7.33333M6.6665 13.6667L9.99984 17L13.3332 13.6667" stroke="#93C5FD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Scanner corner brackets 4:36, 4:65, 4:66, 4:67 (exported already rotated) + their placed box in the card.
// Moved down 37pt in the updated frame to clear the island notch.
export const CORNERS = [
  { x: 27, y: 64, w: 48, h: 49, svg: `<svg width="48" height="49" viewBox="0 0 48 49" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 48.5V42.6C1 28.0386 1 20.758 3.83383 15.1962C6.32654 10.304 10.304 6.32654 15.1962 3.83383C20.758 1 28.0386 1 42.6 1H48" stroke="#FFE479" stroke-width="2"/></svg>` },
  { x: 296, y: 64, w: 49, h: 48, svg: `<svg width="49" height="48" viewBox="0 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.4373e-06 0.999998L6.4 0.999998C20.9614 0.999999 28.242 0.999999 33.8038 3.83383C38.696 6.32654 42.6735 10.304 45.1662 15.1962C48 20.758 48 28.0386 48 42.6L48 48" stroke="#FFE479" stroke-width="2"/></svg>` },
  { x: 297, y: 297, w: 48, h: 49, svg: `<svg width="48" height="49" viewBox="0 0 48 49" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47 6.4373e-06L47 6.4C47 20.9614 47 28.242 44.1662 33.8038C41.6735 38.696 37.696 42.6735 32.8038 45.1662C27.242 48 19.9614 48 5.4 48L-5.60284e-06 48" stroke="#FFE479" stroke-width="2"/></svg>` },
  { x: 27, y: 298, w: 49, h: 48, svg: `<svg width="49" height="48" viewBox="0 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M48.5 47L42.6 47C28.0386 47 20.758 47 15.1963 44.1662C10.304 41.6735 6.32654 37.696 3.83383 32.8038C1 27.242 1 19.9614 1 5.4L1 0" stroke="#FFE479" stroke-width="2"/></svg>` },
];
