import { AppError, toAppError } from './lib/errors';
import { loginEmail } from './lib/identity';
import { compressImage } from './lib/images';
import { IMAGES_BUCKET, isConfigured, supabase } from './lib/supabase';
import type { Gift, GiftInput, Guest, Me, Settings, SignUpInput, SiteInfo } from './types';

const rpc = async <T>(fn: string, args?: Record<string, unknown>): Promise<T> => {
  if (!isConfigured) throw new AppError('Сайт ще не підключено до бази даних');
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw toAppError(error);
  return data as T;
};

const storagePathFromUrl = (url: string): string | null => {
  const marker = `/storage/v1/object/public/${IMAGES_BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
};

const images = () => supabase.storage.from(IMAGES_BUCKET);

export const api = {
  siteInfo: () => rpc<SiteInfo>('site_info'),
  listGifts: () => rpc<Gift[]>('list_gifts'),
  me: () => rpc<Me | null>('me'),
  reserve: (giftId: string) => rpc<void>('reserve', { p_gift_id: giftId }),
  unreserve: (giftId: string) => rpc<void>('unreserve', { p_gift_id: giftId }),

  signUp: async ({ nickname, password, invite }: SignUpInput) => {
    // Pre-check only to show a friendly error message.
    // The real invite code check happens in the database during sign-up.
    const problem = await rpc<string | null>('check_signup', { p_invite: invite, p_nickname: nickname });
    if (problem) throw toAppError({ message: problem });

    const { error } = await supabase.auth.signUp({
      email: await loginEmail(nickname),
      password,
      options: { data: { nickname: nickname.trim(), invite_code: invite.trim() } },
    });
    if (error) throw toAppError(error);
  },

  signIn: async (nickname: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: await loginEmail(nickname), password });
    if (error) throw toAppError(error);
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },

  admin: {
    saveGift: (gift: GiftInput) =>
      rpc<string>('admin_save_gift', {
        p_id: gift.id,
        p_title: gift.title,
        p_url: gift.url,
        p_image_url: gift.image_url,
        p_price: gift.price,
        p_note: gift.note,
        p_sort_order: gift.sort_order,
      }),
    deleteGift: (id: string) => rpc<void>('admin_delete_gift', { p_id: id }),

    getSettings: () => rpc<Settings>('admin_get_settings'),
    updateSettings: (s: Settings) =>
      rpc<void>('admin_update_settings', {
        p_title: s.title,
        p_subtitle: s.subtitle,
        p_invite_code: s.invite_code,
        p_max_reservations: s.max_reservations,
      }),

    listGuests: () => rpc<Guest[]>('admin_list_guests'),
    deleteGuest: (id: string) => rpc<void>('admin_delete_guest', { p_user_id: id }),

    uploadImage: async (file: File): Promise<string> => {
      const { blob, extension } = await compressImage(file);
      const path = `${crypto.randomUUID()}.${extension}`;
      const { error } = await images().upload(path, blob, { contentType: blob.type, cacheControl: '31536000' });
      if (error) throw toAppError(error);
      return images().getPublicUrl(path).data.publicUrl;
    },

    /** Removes the image from storage if it lives there. Never throws — it's just cleanup. */
    removeImage: async (url: string | null) => {
      const path = url && storagePathFromUrl(url);
      if (!path) return;
      await images()
        .remove([path])
        .catch(() => {});
    },
  },
};
