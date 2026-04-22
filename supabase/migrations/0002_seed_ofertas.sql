-- Seed com 10 ofertas fictícias para popular o dashboard.
-- Opcional: rode apenas se quiser ver gráficos com dados desde o início.

insert into public.ofertas
  (vendedor, cliente_nome, inscricao_estadual, commodity, quantidade_sacas, quantidade_ton,
   incoterm, praca, local_embarque, data_embarque, moeda, preco, tipo_preco, data_pagamento, created_at)
values
  ('Carlos Silva',        'Bunge Alimentos S/A',   '111.222.333.000', 'Soja',         50000, 3000.000, 'FOB', 'Sorriso/MT',                  'Porto de Paranaguá', '2026-05-15', 'BRL',  132.50, 'Farmer Selling', '2026-05-30', now() - interval '0 day'),
  ('Ana Beatriz Rocha',   'Cargill Agrícola',      null,              'Milho',        30000, 1800.000, 'CIF', 'Rio Verde/GO',                'Porto de Santos',    '2026-06-02', 'BRL',   64.20, 'Farmer Selling', '2026-06-15', now() - interval '1 day'),
  ('João Pedro Almeida',  'ADM do Brasil',         null,              'Soja',         80000, 4800.000, 'FOB', 'Rondonópolis/MT',             'Porto de Santos',    '2026-05-20', 'BRL',  135.00, 'Farmer Selling', '2026-06-04', now() - interval '1 day'),
  ('Carlos Silva',        'COFCO International',   null,              'Açúcar',       12000,  720.000, 'FOB', 'Ribeirão Preto/SP',           'Porto de Santos',    '2026-05-25', 'BRL',  108.90, 'Farmer Selling', '2026-06-10', now() - interval '2 day'),
  ('Mariana Costa',       'Amaggi Commodities',    null,              'Milho',        25000, 1500.000, 'FOB', 'Sorriso/MT',                  'Porto de Itaqui',    '2026-06-10', 'BRL',   62.80, 'Farmer Selling', '2026-06-25', now() - interval '2 day'),
  ('Ana Beatriz Rocha',   'Louis Dreyfus Company', null,              'Café Arábica',  3500,  210.000, 'FOB', 'Varginha/MG',                 'Porto de Santos',    '2026-05-28', 'BRL', 1050.00, 'Farmer Selling', '2026-06-12', now() - interval '3 day'),
  ('João Pedro Almeida',  'Bunge Alimentos S/A',   null,              'Soja',         45000, 2700.000, 'CIF', 'Campo Novo do Parecis/MT',    'Porto de Paranaguá', '2026-06-05', 'BRL',  131.20, 'Farmer Selling', '2026-06-20', now() - interval '4 day'),
  ('Mariana Costa',       'Cargill Agrícola',      null,              'Algodão',       8000,  480.000, 'FOB', 'Primavera do Leste/MT',       'Porto de Santos',    '2026-06-15', 'BRL',  485.50, 'Farmer Selling', '2026-06-30', now() - interval '5 day'),
  ('Rafael Mendes',       'Tereos Açúcar',         null,              'Trigo',        18000, 1080.000, 'FOB', 'Cascavel/PR',                 'Porto de Paranaguá', '2026-06-08', 'BRL',   78.40, 'Farmer Selling', '2026-06-22', now() - interval '6 day'),
  ('Carlos Silva',        'ADM do Brasil',         null,              'Soja',         65000, 3900.000, 'FOB', 'Luís Eduardo Magalhães/BA',   'Porto de Salvador',  '2026-06-18', 'BRL',  128.70, 'Farmer Selling', '2026-07-03', now() - interval '6 day');
