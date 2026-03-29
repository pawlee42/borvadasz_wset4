export interface AromaCategory {
  name: string
  items: string[]
}

export interface AromaGroup {
  title: string
  categories: AromaCategory[]
}

export const AROMA_GROUPS: AromaGroup[] = [
  {
    title: 'Elsődleges aromák',
    categories: [
      {
        name: 'Virágos',
        items: ['akác', 'lonc', 'kamilla', 'bodza', 'muskátli', 'szőlővirág', 'rózsa', 'ibolya'],
      },
      {
        name: 'Zöld gyümölcsök',
        items: ['alma', 'egres', 'körte', 'birs', 'szőlő'],
      },
      {
        name: 'Citrusok',
        items: ['grapefruit', 'citrom', 'lime', 'narancs', 'citromhéj'],
      },
      {
        name: 'Csonthéjas gyümölcsök',
        items: ['sárgabarack', 'őszibarack', 'nektarin'],
      },
      {
        name: 'Trópusi gyümölcsök',
        items: ['banán', 'licsi', 'mangó', 'sárgadinnye', 'maracuja', 'ananász'],
      },
      {
        name: 'Piros bogyós gyümölcsök',
        items: ['piros ribizli', 'vörös áfonya', 'cseresznye', 'málna', 'eper', 'piros szilva'],
      },
      {
        name: 'Fekete bogyós gyümölcsök',
        items: ['fekete ribizli', 'szeder', 'fekete áfonya', 'fekete cseresznye', 'fekete szilva'],
      },
      {
        name: 'Aszalt / Főtt gyümölcsök',
        items: ['füge', 'aszalt szilva', 'mazsola', 'szultána', 'lekvár', 'gyümölcsbefőtt', 'sült alma'],
      },
      {
        name: 'Lágyszárú / Növényi',
        items: ['zöldpaprika', 'frissen vágott fű', 'paradicsomlevél', 'spárga', 'feketeribizli-levél'],
      },
      {
        name: 'Gyógy- és fűszernövények',
        items: ['eukaliptusz', 'menta', 'gyógytea', 'kapor', 'édeskömény'],
      },
      {
        name: 'Csípős fűszerek',
        items: ['fekete bors', 'fehér bors', 'édesgyökér'],
      },
      {
        name: 'Egyéb',
        items: ['ásványos', 'kovakő', 'nedves kő'],
      },
    ],
  },
  {
    title: 'Másodlagos aromák',
    categories: [
      {
        name: 'Élesztő / Autolízis',
        items: ['keksz', 'kenyér', 'pirítós', 'péksütemény', 'briós', 'sajt'],
      },
      {
        name: 'Almasavbontás',
        items: ['vaj', 'sajt', 'tejszín', 'joghurt'],
      },
      {
        name: 'Tölgyfahordó',
        items: ['vanília', 'szegfűszeg', 'szerecsendió', 'kókusz', 'pörkölt mandula', 'mogyoró', 'csokoládé', 'kávé', 'füst', 'cédrus', 'szivardoboz'],
      },
    ],
  },
  {
    title: 'Harmadlagos aromák',
    categories: [
      {
        name: 'Szándékos oxidáció',
        items: ['mandula', 'dió', 'csokoládé', 'kávé', 'karamell', 'méz'],
      },
      {
        name: 'Gyümölcsfejlődés - Fehér',
        items: ['aszalt sárgabarack', 'mazsola', 'narancslekvár'],
      },
      {
        name: 'Gyümölcsfejlődés - Vörös',
        items: ['füge', 'aszalt szilva', 'aszalt szeder', 'aszalt cseresznye'],
      },
      {
        name: 'Palackérlelés - Fehér',
        items: ['benzin', 'kerozin', 'fahéj', 'gyömbér', 'szerecsendió', 'pirítós', 'pörkölt mogyoró', 'méz', 'gomba', 'széna'],
      },
      {
        name: 'Palackérlelés - Vörös',
        items: ['bőr', 'erdőtalaj', 'föld', 'gomba', 'vadhús', 'dohány', 'nedves levelek', 'avar'],
      },
    ],
  },
]
