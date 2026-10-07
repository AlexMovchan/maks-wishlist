const LOGIN_DOMAIN = 'wishlist.invalid';

const sha256Hex = async (text: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Supabase Auth requires an email, but guests only enter a name.
 * The name is turned into a stable synthetic address on the reserved `.invalid` TLD (RFC 2606),
 * so no real mailbox is ever involved. Hashing keeps it ASCII (names may be Cyrillic)
 * and within the 64-char local-part limit. Case-insensitive, like nickname uniqueness in the DB.
 */
export const loginEmail = async (name: string): Promise<string> => {
  const hash = await sha256Hex(name.trim().normalize('NFC').toLowerCase());
  return `${hash.slice(0, 32)}@${LOGIN_DOMAIN}`;
};
