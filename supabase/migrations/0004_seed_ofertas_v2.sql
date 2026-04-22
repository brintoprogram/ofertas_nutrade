-- Seed com 10 ofertas fictícias (novo schema).
-- Opcional: rode apenas se quiser ver gráficos com dados desde o início.

insert into public.ofertas
  (nome_parent, nome_sold_to, commodity, praca, local_retirada_entrega,
   quantidade_sc, quantidade_ton, prazo_entrega, preco, moeda, pagamento, created_at)
values
  ('Bunge',           'Bunge Alimentos S/A',     'Soja',         'Sorriso/MT',                   'Porto de Paranaguá',      50000, 3000.000, '2026-05-15',  132.50, 'BRL', '2026-05-30', now() - interval '0 day'),
  ('Cargill',         'Cargill Agrícola S/A',    'Milho',        'Rio Verde/GO',                 'Porto de Santos',         30000, 1800.000, '2026-06-02',   64.20, 'BRL', '2026-06-15', now() - interval '1 day'),
  ('ADM',             'ADM do Brasil Ltda',      'Soja',         'Rondonópolis/MT',              'Porto de Santos',         80000, 4800.000, '2026-05-20',  135.00, 'BRL', '2026-06-04', now() - interval '1 day'),
  ('COFCO',           'COFCO International',     'Açúcar',       'Ribeirão Preto/SP',            'Porto de Santos',         12000,  720.000, '2026-05-25',  108.90, 'BRL', '2026-06-10', now() - interval '2 day'),
  ('Amaggi',          'Amaggi Commodities',      'Milho',        'Sorriso/MT',                   'Porto de Itaqui',         25000, 1500.000, '2026-06-10',   62.80, 'BRL', '2026-06-25', now() - interval '2 day'),
  ('Louis Dreyfus',   'LDC Brasil Ltda',         'Café Arábica', 'Varginha/MG',                  'Porto de Santos',          3500,  210.000, '2026-05-28', 1050.00, 'BRL', '2026-06-12', now() - interval '3 day'),
  ('Bunge',           'Bunge Alimentos S/A',     'Soja',         'Campo Novo do Parecis/MT',     'Porto de Paranaguá',      45000, 2700.000, '2026-06-05',  131.20, 'BRL', '2026-06-20', now() - interval '4 day'),
  ('Cargill',         'Cargill Agrícola S/A',    'Algodão',      'Primavera do Leste/MT',        'Porto de Santos',          8000,  480.000, '2026-06-15',  485.50, 'BRL', '2026-06-30', now() - interval '5 day'),
  ('Tereos',          'Tereos Açúcar e Energia', 'Trigo',        'Cascavel/PR',                  'Porto de Paranaguá',      18000, 1080.000, '2026-06-08',   78.40, 'BRL', '2026-06-22', now() - interval '6 day'),
  ('ADM',             'ADM do Brasil Ltda',      'Soja',         'Luís Eduardo Magalhães/BA',    'Porto de Salvador',       65000, 3900.000, '2026-06-18',  128.70, 'BRL', '2026-07-03', now() - interval '6 day');
