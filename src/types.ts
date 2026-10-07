export type Gift = {
  id: string;
  title: string;
  url: string | null;
  image_url: string | null;
  price: number | null;
  note: string | null;
  sort_order: number;
  is_reserved: boolean;
  is_mine: boolean;
  reserved_by: string | null;
};

export type GiftInput = {
  id: string | null;
  title: string;
  url: string;
  image_url: string;
  price: number | null;
  note: string;
  sort_order: number;
};

export type Me = { nickname: string; is_admin: boolean };

export type SiteInfo = { title: string; subtitle: string; max_reservations: number };

export type Settings = { title: string; subtitle: string; invite_code: string; max_reservations: number };

export type Guest = {
  id: string;
  nickname: string;
  is_admin: boolean;
  created_at: string;
  reservations: number;
};

export type SignUpInput = { nickname: string; password: string; invite: string };
