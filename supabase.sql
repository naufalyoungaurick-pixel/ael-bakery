-- Jalankan di Supabase > SQL Editor > New query > Run

create table if not exists products (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  price integer not null,
  image_url text,
  is_available boolean default true,
  created_at timestamptz default now()
);

create table if not exists orders (
  id bigint generated always as identity primary key,
  customer_name text not null,
  phone text not null,
  address text,
  items jsonb not null,
  total integer not null,
  status text default 'baru',
  created_at timestamptz default now()
);

alter table products enable row level security;
alter table orders enable row level security;

-- Pengunjung boleh melihat produk dan membuat pesanan
create policy "produk bisa dilihat semua" on products for select using (true);
create policy "pesanan bisa dibuat semua" on orders for insert with check (true);

-- Contoh produk
insert into products (name, description, price, image_url) values
('Roti Tawar Premium', 'Lembut, cocok untuk sarapan keluarga', 25000, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600'),
('Croissant Butter', 'Berlapis renyah dengan butter asli', 18000, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600'),
('Roti Cokelat', 'Isian cokelat lumer', 12000, 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600'),
('Donat Gula', 'Donat empuk dengan taburan gula halus', 8000, 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600');
