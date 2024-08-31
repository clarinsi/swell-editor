import {chain_cmps, mkcmp, cmp_order, Comparator} from '../Utils'

const image_ws_url = 'https://ws.spraakbanken.gu.se/ws/swell'
const pseuws_url = 'https://ws.spraakbanken.gu.se/ws/larka/pseuws'

export interface Example {
  source: string
  target: string
}

const ex = (source: string, target: string): Example => ({source, target})

const examples: Example[] = `
Alice and Bob went to Paris . Alice's wallet was stolen . // Alice:1:'firstname_female' and Bob:2:'firstname_male' went to Paris:3:city . Alice's:1:'firstname_female':gen wallet was stolen .

Their was a problem yesteray . // There was a problem yesterday .

I don't know his lives . // I don't know where he~his lives .

He get to cleaned his son . // He got his~his son~son to:O clean:O the~ room~ .

We wrote down the number . // We wrote the number down~down .
`
  .trim()
  .split(/\n\n+/gm)
  .map(line => ex.apply({}, line.split('//').map(side => side.trim()) as [string, string]))

const order_changing_labels: Record<string, true> = {
  'S-adv': true,
  'S-finV': true,
  'S-WO': true,
  WO: true,
  INV: true,
  OINV: true,
}

export const label_args: Record<string, number> = {
  /*age_string: 1,*/
}

export type TaxonomyGroup = {
  group: string
  is_expanded: boolean,
  subgroups: TaxonomyGroup[],
  entries: {
    label: string
    key: string
    desc: string
  }[]
}

export type Taxonomy = TaxonomyGroup[]

const extra = 'gen def pl foreign'.split(' ')
const temporary = 'OBS! Cit-FL Com!'.split(' ')
const digits = /^\d+$/

/** An ordered set of label categories. */
export enum LabelOrder {
  BASE,
  NUM,
  EXTRA,
  TEMP,
}

/** Maps a label to a category in LabelOrder. */
export function label_order(label: string): LabelOrder {
  if (temporary.includes(label)) {
    return LabelOrder.TEMP
  } else if (extra.includes(label)) {
    return LabelOrder.EXTRA
  } else if (digits.test(label)) {
    return LabelOrder.NUM
  } else {
    return LabelOrder.BASE
  }
}

/** Sorting function for labels. */
// Sort first by taxonomy, then label type, and finally alphabetically.
export const label_sort: Comparator<string> = chain_cmps(
  mkcmp(label_taxonomy),
  mkcmp(label_order),
  cmp_order
)

const anonymization: Taxonomy = [
  {
    group: 'Morphology',
    is_expanded: true,
    subgroups: [],
    entries: [
      {label: 'gen', key: 'gen', desc: 'genitive'},
      {label: 'def', key: 'def', desc: 'definite'},
      {label: 'pl', key: 'pl', desc: 'plural'},
    ],
  },
  {
    group: 'Names',
    is_expanded: true,
    subgroups: [],
    entries: [
      {label: 'firstname_male', key: 'firstname_male', desc: ''},
      {label: 'firstname_female', key: 'firstname_female', desc: ''},
      {label: 'firstname_unknown', key: 'firstname_unknown', desc: ''},
      {label: 'initials', key: 'initials', desc: ''},
      {label: 'middlename', key: 'middlename', desc: ''},
      {label: 'surname', key: 'surname', desc: ''},
    ],
  },
  {
    group: 'Geographic data',
    is_expanded: true,
    subgroups: [],
    entries: [
      {label: 'foreign', key: 'foreign', desc: ''},
      {label: 'area', key: 'area', desc: ''},
      {label: 'city', key: 'city', desc: 'city including villages'},
      {label: 'country', key: 'country', desc: 'except Sweden'},
      {label: 'geo', key: 'geo', desc: 'forest, lake, mountain, etc'},
      {label: 'place', key: 'place', desc: ''},
      {label: 'region', key: 'region', desc: ''},
      {label: 'street_nr', key: 'street_nr', desc: 'street number'},
      {label: 'zip_code', key: 'zip_code', desc: ''},
    ],
  },
  {
    group: 'Institutions',
    is_expanded: true,
    subgroups: [],
    entries: [
      {label: 'school', key: 'school', desc: ''},
      {label: 'work', key: 'work', desc: ''},
      {label: 'other_institution', key: 'other_institution', desc: ''},
    ],
  },
  {
    group: 'Transportation',
    is_expanded: true,
    subgroups: [],
    entries: [
      {label: 'transport_name', key: 'transport_name', desc: 'bus, metro, tram, train, express'},
      {label: 'transport_nr', key: 'transport_nr', desc: 'number, color'},
    ],
  },
  {
    group: 'Age',
    is_expanded: true,
    subgroups: [],
    entries: [{label: 'age_digits', key: 'age_digits', desc: ''}, {label: 'age_string', key: 'age_string', desc: ''}],
  },
  {
    group: 'Dates',
    is_expanded: true,
    subgroups: [],
    entries: [
      {label: 'date_digits', key: 'date_digits', desc: 'numerical date represenation, delimiters are retained'},
      {label: 'day', key: 'day', desc: ''},
      {label: 'month_digit', key: 'month_digit', desc: ''},
      {label: 'month_word', key: 'month_word', desc: ''},
      {label: 'year', key: 'year', desc: ''},
    ],
  },
  {
    group: 'Misc',
    is_expanded: true,
    subgroups: [],
    entries: [
      {label: 'account_nr', key: 'account_nr', desc: ''},
      {label: 'email', key: 'email', desc: ''},
      {label: 'extra', key: 'extra', desc: ''},
      {label: 'license_nr', key: 'license_nr', desc: ''},
      {label: 'other_nr_seq', key: 'other_nr_seq', desc: 'a sequence of numbers'},
      {label: 'phone_nr', key: 'phone_nr', desc: ''},
      {label: 'personid_nr', key: 'personid_nr', desc: ''},
      {label: 'url', key: 'url', desc: ''},
    ],
  },
  {
    group: 'Mark',
    is_expanded: true,
    subgroups: [],
    entries: [
      {label: 'edu', key: 'edu', desc: 'education, courses'},
      {label: 'fam', key: 'fam', desc: 'family members'},
      {label: 'prof', key: 'prof', desc: 'profession'},
      {label: 'sensitive', key: 'sensitive', desc: ''},
    ],
  },
  {
    group: 'Other',
    is_expanded: true,
    subgroups: [],
    entries: [
      {label: 'Cit-FL', key: 'Cit-FL', desc: 'Citation for a language'},
      {label: 'Com!', key: 'Com!', desc: 'Comment'},
      {label: 'OBS!', key: 'OBS!', desc: 'Attention'},
    ],
  },
]

//KOST
export const correctannot_kost: Taxonomy = [
  {
    group: 'Zapis',
    is_expanded: false,
    subgroups: [],
    entries: [
      {
        label: 'Ločilo',
        key: 'Z-LOC',
        desc: ''
      },
      {
        label: 'Črkovanje',
        key: 'Z-CRK',
        desc: ''
      },
      {
        label: 'Skupaj/narazen',
        key: 'Z-SN',
        desc: ''
      },
      {
        label: 'Mala/velika začetnica',
        key: 'Z-MV',
        desc: ''
      },
      {
        label: 'Krajšave',
        key: 'Z-KR',
        desc: ''
      },
    ],
  },
  {
    group: 'Besedišče',
    is_expanded: false,
    subgroups: [],
    entries: [
      {
        label: 'Samostalnik',
        key: 'B-SAM',
        desc: ''
      },
      {
        label: 'Glagol',
        key: 'B-GLAG',
        desc: ''
      },
      {
        label: 'Zaimek',
        key: 'B-ZAIM',
        desc: ''
      },
      {
        label: 'Pridevnik',
        key: 'B-PRID',
        desc: ''
      },
      {
        label: 'Prislov',
        key: 'B-PRISL',
        desc: ''
      },
      {
        label: 'Predlog',
        key: 'B-PRED',
        desc: ''
      },
      {
        label: 'Veznik',
        key: 'B-VEZ',
        desc: ''
      },
      {
        label: 'Ostalo',
        key: 'B-OST',
        desc: ''
      },
    ],
  },
  {
    group: 'Oblika',
    is_expanded: false,
    subgroups: [],
    entries: [
      {
        label: 'Samostalnik',
        key: 'O-SAM',
        desc: ''
      },
      {
        label: 'Glagol',
        key: 'O-GLAG',
        desc: ''
      },
      {
        label: 'Zaimek',
        key: 'O-ZAIM',
        desc: ''
      },
      {
        label: 'Pridevnik',
        key: 'O-PRID',
        desc: ''
      },
      {
        label: 'Prislov',
        key: 'O-PRISL',
        desc: ''
      },
      {
        label: 'Ostalo',
        key: 'O-OST',
        desc: ''
      },
    ],
  },
  {
    group: 'Skladnja',
    is_expanded: false,
    subgroups: [],
    entries: [
      {
        label: 'Struktura',
        key: 'S-STR',
        desc: ''
      },
      {
        label: 'Besedni red',
        key: 'S-BR',
        desc: ''
      },
      {
        label: 'Izpuščeni jezikovni elemnti',
        key: 'S-IZP',
        desc: ''
      },
      {
        label: 'Odvečni jezikovni elementi',
        key: 'S-ODV',
        desc: ''
      },
    ],
  },
  {
    group: 'Povezani popravki',
    is_expanded: false,
    subgroups: [],
    entries: [
      {
        label: 'Povezani popravki',
        key: 'POV',
        desc: ''
      },
    ],
  }
]
//ŠOLAR
export const correctannot_slo: Taxonomy = [
  {
    group: 'Anonimizacija',
    is_expanded: false,
    subgroups: [
      {
        group: 'Osebna imena',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Ime ali priimek',
            key: 'A//ime-priimek',
            desc: ''
          },
        ],
      },
    ],
    entries: [],
  },
  {
    group: 'Druge oznake',
    is_expanded: false,
    subgroups: [],
    entries: [
      {
        label: 'Nečitljivo',
        key: 'N//nečitljivo',
        desc: ''
      },
      {
        label: 'Preveri',
        key: 'N//preveri',
        desc: ''
      },
      {
        label: 'Komentar',
        key: 'Komentar!',
        desc: ''
      },
    ],
  },
  {
    group: 'Črkovanje',
    is_expanded: false,
    subgroups: [
      {
        group: 'Vokali',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Odvečni vokal',
            key: 'Č/VOK/odveč',
            desc: ''
          },
          {
            label: 'Izpuščeni vokal',
            key: 'Č/VOK/izpust',
            desc: ''
          },
          {
            label: 'Menjava AO',
            key: 'Č/VOK/menjava-ao',
            desc: ''
          },
          {
            label: 'Menjava EI',
            key: 'Č/VOK/menjava-ei',
            desc: ''
          },
          {
            label: 'Menjava UO',
            key: 'Č/VOK/menjava-uo',
            desc: ''
          },
          {
            label: 'Druge menjave vokala',
            key: 'Č/VOK/menjava-drugo',
            desc: ''
          },
        ],
      },
      {
        group: 'Konzonanti',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Odvečni konzonant',
            key: 'Č/KONZ/odveč',
            desc: ''
          },
          {
            label: 'Izpuščeni konzonant',
            key: 'Č/KONZ/izpust',
            desc: ''
          },
          {
            label: 'Menjava SZ',
            key: 'Č/KONZ/menjava-sz',
            desc: ''
          },
          {
            label: 'Menjava TD',
            key: 'Č/KONZ/menjava-td',
            desc: ''
          },
          {
            label: 'Menjava KGH',
            key: 'Č/KONZ/menjava-kgh',
            desc: ''
          },
          {
            label: 'Menjava MN',
            key: 'Č/KONZ/menjava-mn',
            desc: ''
          },
          {
            label: 'Menjava ŠŽ',
            key: 'Č/KONZ/menjava-šž',
            desc: ''
          },
          {
            label: 'Menjava STREŠICE',
            key: 'Č/KONZ/menjava-strešice',
            desc: ''
          },
          {
            label: 'Druge menjave konzonantov',
            key: 'Č/KONZ/menjava-drugo',
            desc: ''
          },
        ],
      },
      {
        group: 'Ustnično-ustnični w',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Na začetku besede',
            key: 'Č/W/začetek',
            desc: ''
          },
          {
            label: 'Na sredini besede',
            key: 'Č/W/sredina',
            desc: ''
          },
          {
            label: 'Na koncu besede',
            key: 'Č/W/konec',
            desc: ''
          },
          {
            label: 'Predlog V',
            key: 'Č/W/v',
            desc: ''
          },
        ],
      },
      {
        group: 'Črkovni sklopi',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Zlog manjka ali je odveč',
            key: 'Č/SKLOP/zlog',
            desc: ''
          },
          {
            label: 'Sklop LJ',
            key: 'Č/SKLOP/lj',
            desc: ''
          },
          {
            label: 'Sklop NJ',
            key: 'Č/SKLOP/nj',
            desc: ''
          },
          {
            label: 'Sklop IJ',
            key: 'Č/SKLOP/ij',
            desc: ''
          },
          {
            label: 'Podvojene črke',
            key: 'Č/SKLOP/podvojene',
            desc: ''
          },
          {
            label: 'Premet črk',
            key: 'Č/SKLOP/premet',
            desc: ''
          },
        ],
      },
      {
        group: 'Variantni predlogi',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Predlog s/z',
            key: 'Č/PRED/sz',
            desc: ''
          },
          {
            label: 'Predlog k/h',
            key: 'Č/PRED/kh',
            desc: ''
          },
        ],
      },
    ],
    entries: [],
  },
  {
    group: 'Oblika',
    is_expanded: false,
    subgroups: [
      {
        group: 'Kategorialni popravki',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Sklon: rodilnik-tožilnik',
            key: 'O/KAT/sklon-rt',
            desc: ''
          },
          {
            label: 'Sklon: dajalnik-mestnik',
            key: 'O/KAT/sklon-dm',
            desc: ''
          },
          {
            label: 'Sklon: mestnik-orodnik',
            key: 'O/KAT/sklon-mo',
            desc: ''
          },
          {
            label: 'Druge menjave sklona',
            key: 'O/KAT/sklon-drugo',
            desc: ''
          },
          {
            label: 'Število: ednina-množina',
            key: 'O/KAT/število-em',
            desc: ''
          },
          {
            label: 'Število: dvojina-množina',
            key: 'O/KAT/število-dm',
            desc: ''
          },
          {
            label: 'Število: ednina-dvojina',
            key: 'O/KAT/število-ed',
            desc: ''
          },
          {
            label: 'Spol',
            key: 'O/KAT/spol',
            desc: ''
          },
          {
            label: 'Vid',
            key: 'O/KAT/vid',
            desc: ''
          },
          {
            label: 'Čas',
            key: 'O/KAT/čas',
            desc: ''
          },
          {
            label: 'Oseba',
            key: 'O/KAT/oseba',
            desc: ''
          },
          {
            label: 'Kratki nedoločnik',
            key: 'O/KAT/nedoločnik-kratki',
            desc: ''
          },
          {
            label: 'Nedoločnik in namenilnik',
            key: 'O/KAT/nedoločnik-namenilnik',
            desc: ''
          },
          {
            label: 'Nedoločnik in osebna glagolska oblika',
            key: 'O/KAT/nedoločnik-osebna',
            desc: ''
          },
          {
            label: 'Povratnost',
            key: 'O/KAT/povratnost',
            desc: ''
          },
          {
            label: 'Naklon',
            key: 'O/KAT/naklon',
            desc: ''
          },
          {
            label: 'Način',
            key: 'O/KAT/način',
            desc: ''
          },
          {
            label: 'Oblika zaimka',
            key: 'O/KAT/oblika-zaimka',
            desc: ''
          },
          {
            label: 'Določnost',
            key: 'O/KAT/določnost',
            desc: ''
          },
          {
            label: 'Stopnjevanje',
            key: 'O/KAT/stopnjevanje',
            desc: ''
          },
        ],
      },
      {
        group: 'Paradigmatski popravki',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Glagolska osnova',
            key: 'O/PAR/glagolska-osnova',
            desc: ''
          },
          {
            label: 'Glagolska končnica',
            key: 'O/PAR/glagolska-končnica',
            desc: ''
          },
          {
            label: 'Neglagolska osnova',
            key: 'O/PAR/neglagolska-osnova',
            desc: ''
          },
          {
            label: 'Neglagolska končnica',
            key: 'O/PAR/neglagolska-končnica',
            desc: ''
          },
          {
            label: 'Neobstojni vokal',
            key: 'O/PAR/neobstojni-vokal',
            desc: ''
          },
          {
            label: 'Preglas in cč',
            key: 'O/PAR/preglas-in-cč',
            desc: ''
          },
        ],
      },
      {
        group: 'Dodatne oznake',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Oblikovne variante',
            key: 'O/DOD/variante',
            desc: ''
          },
          {
            label: 'Mati, hči',
            key: 'O/DOD/besede-mati-hči',
            desc: ''
          },
          {
            label: 'Otrok',
            key: 'O/DOD/besede-otrok',
            desc: ''
          },
        ],
      },
    ],
    entries: [],
  },
  {
    group: 'Besedišče',
    is_expanded: false,
    subgroups: [
      {
        group: 'Samostalnik',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Napačno lastno ime',
            key: 'B/SAM/napačno-lastno',
            desc: ''
          },
          {
            label: 'Lastno in občno ime',
            key: 'B/SAM/lastno-občno',
            desc: ''
          },
          {
            label: 'Občno besedišče',
            key: 'B/SAM/občno-besedišče',
            desc: ''
          },
        ],
      },
      {
        group: 'Glagol',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Glagolske predpone',
            key: 'B/GLAG/predpona',
            desc: ''
          },
          {
            label: 'Menjava moči – morati',
            key: 'B/GLAG/moči-morati',
            desc: ''
          },
          {
            label: 'Druge menjave naklonskih glagolov',
            key: 'B/GLAG/naklonski',
            desc: ''
          },
          {
            label: 'Druge menjave glagolov',
            key: 'B/GLAG/drugo',
            desc: ''
          },
        ],
      },
      {
        group: 'Zaimek',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Povratna svojilnost',
            key: 'B/ZAIM/povratna-svojilnost',
            desc: ''
          },
          {
            label: 'Menjava ki – kateri',
            key: 'B/ZAIM/ki-kateri',
            desc: ''
          },
          {
            label: 'Druge težave z oziralnimi zaimki',
            key: 'B/ZAIM/oziralni',
            desc: ''
          },
          {
            label: 'Menjave nikalnih zaimkov',
            key: 'B/ZAIM/noben',
            desc: ''
          },
          {
            label: 'Druge menjave zaimkov',
            key: 'B/ZAIM/drugo',
            desc: ''
          },
        ],
      },
      {
        group: 'Predlog',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Predlog v glagolskih zvezah',
            key: 'B/PRED/glagolske-zveze',
            desc: ''
          },
          {
            label: 'Predlog v neglagolskih zvezah',
            key: 'B/PRED/neglagolske-zveze',
            desc: ''
          },
          {
            label: 'Lokacijske dvojnice',
            key: 'B/PRED/lokacijske-dvojnice',
            desc: ''
          },
          {
            label: 'Druge menjave predlogov',
            key: 'B/PRED/drugo',
            desc: ''
          },
        ],
      },
      {
        group: 'Veznik',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Menjave in-pa-ter',
            key: 'B/VEZ/in-pa-ter',
            desc: ''
          },
          {
            label: 'Menjave protivnih veznikov',
            key: 'B/VEZ/protivni',
            desc: ''
          },
          {
            label: 'Sprememba odnosa',
            key: 'B/VEZ/sprememba-odnosa',
            desc: ''
          },
          {
            label: 'Druge menjave veznikov',
            key: 'B/VEZ/drugo',
            desc: ''
          },
        ],
      },
      {
        group: 'Pridevnik',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Različne težave pridevnikov',
            key: 'B/PRID/drugo',
            desc: ''
          },
        ],
      },
      {
        group: 'Prislov',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Različne težave prislovov',
            key: 'B/PRISL/drugo',
            desc: ''
          },
        ],
      },
      {
        group: 'Ostale besedne vrste',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Različne težave ostalih bes. vrst',
            key: 'B/OST/drugo',
            desc: ''
          },
        ],
      },
      {
        group: 'Menjava prek meja besedne vrste',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Polnopomenska beseda ali bes. zveza v zaimek',
            key: 'B/MEN/polnopomenska-v-zaimek',
            desc: ''
          },
          {
            label: 'Zaimek v polnopomensko besedo ali bes. zvezo',
            key: 'B/MEN/zaimek-v-polnopomensko',
            desc: ''
          },
          {
            label: 'Menjava veznika in zaimka',
            key: 'B/MEN/veznik-zaimek',
            desc: ''
          },
          {
            label: 'Besedna družina',
            key: 'B/MEN/besedna-družina',
            desc: ''
          },
          {
            label: 'Samostalnik in zveza',
            key: 'B/MEN/samostalnik-bz',
            desc: ''
          },
          {
            label: 'Glagol in zveza',
            key: 'B/MEN/glagol-bz',
            desc: ''
          },
          {
            label: 'Prislov/pridevnik in zveza',
            key: 'B/MEN/prislov-pridevnik-bz',
            desc: ''
          },
          {
            label: 'Druge vrste menjav',
            key: 'B/MEN/drugo',
            desc: ''
          },
        ],
      },
      {
        group: 'Dodatne oznake',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Zaznamovano besedišče ',
            key: 'B/DOD/zaznamovano',
            desc: ''
          },
        ],
      },
    ],
    entries: [],
  },
  {
    group: 'Skladnja',
    is_expanded: false,
    subgroups: [
      {
        group: 'Besedni red',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Zaporedje: povedek_osebek',
            key: 'S/BR/povedek-osebek',
            desc: ''
          },
          {
            label: 'Zaporedje: povedek_predmet',
            key: 'S/BR/povedek-predmet',
            desc: ''
          },
          {
            label: 'Zaporedje: povedek_prislovno določilo',
            key: 'S/BR/povedek-prislovno-določilo',
            desc: ''
          },
          {
            label: 'Zaporedje: členek',
            key: 'S/BR/členek',
            desc: ''
          },
          {
            label: 'Zaporedje znotraj stavčnih členov',
            key: 'S/BR/znotraj-stavčnega-člena',
            desc: ''
          },
          {
            label: 'Naslonski niz: zaporedje naslonk',
            key: 'S/BR/naslonski-niz-znotraj',
            desc: ''
          },
          {
            label: 'Naslonski niz: prirednost_podrednost',
            key: 'S/BR/naslonski-niz-prirednost-podrednost',
            desc: ''
          },
          {
            label: 'Druge menjave besednega reda',
            key: 'S/BR/drugo',
            desc: ''
          },
        ],
      },
      {
        group: 'Izpuščeni jezikovni elementi',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Samostalnik: občno ime',
            key: 'S/IZPUST/samostalnik-občno-ime',
            desc: ''
          },
          {
            label: 'Samostalnik: lastno ime',
            key: 'S/IZPUST/samostalnik-lastno-ime',
            desc: ''
          },
          {
            label: 'Glagol biti',
            key: 'S/IZPUST/glagol-biti',
            desc: ''
          },
          {
            label: 'Drugi izpusti glagolov',
            key: 'S/IZPUST/glagol-drugo',
            desc: ''
          },
          {
            label: 'Beseda pa',
            key: 'S/IZPUST/veznik-pa',
            desc: ''
          },
          {
            label: 'Drugi izpusti veznikov',
            key: 'S/IZPUST/veznik-drugo',
            desc: ''
          },
          {
            label: 'Ponovljeni predlogi',
            key: 'S/IZPUST/predlog-ponovljen',
            desc: ''
          },
          {
            label: 'Drugi izpusti predlogov',
            key: 'S/IZPUST/predlog-drugo',
            desc: ''
          },
          {
            label: 'Osebni zaimek',
            key: 'S/IZPUST/zaimek-osebni',
            desc: ''
          },
          {
            label: 'Drugi izpusti zaimkov',
            key: 'S/IZPUST/zaimek-drugo',
            desc: ''
          },
          {
            label: 'Pridevnik',
            key: 'S/IZPUST/pridevnik',
            desc: ''
          },
          {
            label: 'Prislov',
            key: 'S/IZPUST/prislov',
            desc: ''
          },
          {
            label: 'Členek',
            key: 'S/IZPUST/členek',
            desc: ''
          },
          {
            label: 'Stavek',
            key: 'S/IZPUST/stavek',
            desc: ''
          },
          {
            label: 'Poved',
            key: 'S/IZPUST/poved',
            desc: ''
          },
        ],
      },
      {
        group: 'Odvečni jezikovni elementi',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Dobesedno ponavljanje',
            key: 'S/ODVEČ/ponavljanje',
            desc: ''
          },
          {
            label: 'Samostalnik: občno ime',
            key: 'S/ODVEČ/samostalnik-občno-ime',
            desc: ''
          },
          {
            label: 'Samostalnik: lastno ime',
            key: 'S/ODVEČ/samostalnik-lastno-ime',
            desc: ''
          },
          {
            label: 'Glagol biti',
            key: 'S/ODVEČ/glagol-biti',
            desc: ''
          },
          {
            label: 'Drugi odvečni glagoli',
            key: 'S/ODVEČ/glagol-drugo',
            desc: ''
          },
          {
            label: 'Beseda pa z drugimi vezniki',
            key: 'S/ODVEČ/veznik-pa-vezniki',
            desc: ''
          },
          {
            label: 'Drugi primeri z besedo pa',
            key: 'S/ODVEČ/veznik-pa-drugo',
            desc: ''
          },
          {
            label: 'Veznik na začetku povedi',
            key: 'S/ODVEČ/veznik-začetek',
            desc: ''
          },
          {
            label: 'Dvojni vezniki',
            key: 'S/ODVEČ/veznik-dvojni',
            desc: ''
          },
          {
            label: 'Drugi odvečni vezniki',
            key: 'S/ODVEČ/veznik-drugo',
            desc: ''
          },
          {
            label: 'Predlog',
            key: 'S/ODVEČ/predlog',
            desc: ''
          },
          {
            label: 'Osebni zaimek',
            key: 'S/ODVEČ/zaimek-osebni',
            desc: ''
          },
          {
            label: 'Kazalni zaimek',
            key: 'S/ODVEČ/zaimek-kazalni',
            desc: ''
          },
          {
            label: 'Svojilni zaimek',
            key: 'S/ODVEČ/zaimek-svojilni',
            desc: ''
          },
          {
            label: 'Drugi odvečni zaimki',
            key: 'S/ODVEČ/zaimek-drugo',
            desc: ''
          },
          {
            label: 'Pridevnik',
            key: 'S/ODVEČ/pridevnik',
            desc: ''
          },
          {
            label: 'Merni prislov',
            key: 'S/ODVEČ/prislov-mera',
            desc: ''
          },
          {
            label: 'Drugi odvečni prislovi',
            key: 'S/ODVEČ/prislov-drugo',
            desc: ''
          },
          {
            label: 'Členek',
            key: 'S/ODVEČ/členek',
            desc: ''
          },
          {
            label: 'Stavek',
            key: 'S/ODVEČ/stavek',
            desc: ''
          },
          {
            label: 'Poved',
            key: 'S/ODVEČ/poved',
            desc: ''
          },
        ],
      },
      {
        group: 'Struktura',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Svojina z besedo od',
            key: 'S/STR/svojina-od',
            desc: ''
          },
          {
            label: 'Svojina z rodilnikom',
            key: 'S/STR/svojina-rodilnik',
            desc: ''
          },
          {
            label: 'Menjava ločilo – veznik',
            key: 'S/STR/ločilo-veznik',
            desc: ''
          },
          {
            label: 'Združevanje stavkov',
            key: 'S/STR/združevanje-stavkov',
            desc: ''
          },
          {
            label: 'Deljenje stavkov/povedi',
            key: 'S/STR/deljenje-stavkov',
            desc: ''
          },
          {
            label: 'Beseda/bes. zveza namesto stavka in obratno',
            key: 'S/STR/besedna-zveza-stavek',
            desc: ''
          },
          {
            label: 'Preoblikovanje stavka',
            key: 'S/STR/preoblikovanje-stavka',
            desc: ''
          },
        ],
      },
      {
        group: 'Dodatne oznake',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Pleonazem',
            key: 'S/DOD/pleonazem',
            desc: ''
          },
          {
            label: 'Odvečna vsebina',
            key: 'S/DOD/vsebina-drugo',
            desc: ''
          },
          {
            label: 'Napačna vsebina',
            key: 'S/DOD/vsebina-napake',
            desc: ''
          },
          {
            label: 'Pomensko prazni',
            key: 'S/DOD/pomensko-prazni',
            desc: ''
          },
        ],
      },
    ],
    entries: [],
  },
  {
    group: 'Zapis',
    is_expanded: false,
    subgroups: [
      {
        group: 'Velika/mala začetnica',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Pridevniki na -ski',
            key: 'Z/MV/pridevnik-ski',
            desc: ''
          },
          {
            label: 'Drugi pridevniki',
            key: 'Z/MV/pridevnik-drugo',
            desc: ''
          },
          {
            label: 'Občna imena z veliko',
            key: 'Z/MV/občna-imena',
            desc: ''
          },
          {
            label: 'Osebna imena z malo',
            key: 'Z/MV/osebna-imena',
            desc: ''
          },
          {
            label: 'Narodnost z malo',
            key: 'Z/MV/narodnost',
            desc: ''
          },
          {
            label: 'Zemljepisna imena z malo',
            key: 'Z/MV/zemljepisna-imena',
            desc: ''
          },
          {
            label: 'Stvarna imena z malo',
            key: 'Z/MV/stvarna-imena',
            desc: ''
          },
          {
            label: 'Premi govor',
            key: 'Z/MV/premi-govor',
            desc: ''
          },
          {
            label: 'Začetek povedi',
            key: 'Z/MV/začetek-povedi',
            desc: ''
          },
          {
            label: 'Hiperkorekcija za piko',
            key: 'Z/MV/hiperkorekcija-ločila',
            desc: ''
          },
          {
            label: 'Druge težave z začetnicami',
            key: 'Z/MV/drugo',
            desc: ''
          },
        ],
      },
      {
        group: 'Skupaj/narazen',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Glagol skupaj',
            key: 'Z/SN/skupaj-glagol',
            desc: ''
          },
          {
            label: 'Predlog skupaj',
            key: 'Z/SN/skupaj-predlog',
            desc: ''
          },
          {
            label: 'Predlog narazen',
            key: 'Z/SN/narazen-predlog',
            desc: ''
          },
          {
            label: 'Prislov skupaj',
            key: 'Z/SN/skupaj-prislov',
            desc: ''
          },
          {
            label: 'Prislov narazen',
            key: 'Z/SN/narazen-prislov',
            desc: ''
          },
          {
            label: 'Pridevnik narazen',
            key: 'Z/SN/narazen-pridevnik',
            desc: ''
          },
          {
            label: 'Drugo narazen',
            key: 'Z/SN/narazen-drugo',
            desc: ''
          },
          {
            label: 'Drugo skupaj',
            key: 'Z/SN/skupaj-drugo',
            desc: ''
          },
        ],
      },
      {
        group: 'Krajšave',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Krajšave',
            key: 'Z/KR/drugo',
            desc: ''
          },
        ],
      },
      {
        group: 'Števila',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Števila',
            key: 'Z/ŠTEV/drugo',
            desc: ''
          },
        ],
      },
      {
        group: 'Ločila',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Vejica pred priredji in odvisniki',
            key: 'Z/LOČ/vzorec-vejica-stavki',
            desc: ''
          },
          {
            label: 'Vejica med stavčnimi členi',
            key: 'Z/LOČ/vzorec-vejica-stavčni-členi',
            desc: ''
          },
          {
            label: 'Vejica med večdelnimi vezniki',
            key: 'Z/LOČ/vzorec-vejica-vezniki',
            desc: ''
          },
          {
            label: 'Vejica pred pristavki, pastavki ipd.',
            key: 'Z/LOČ/vzorec-vejica-pristavki',
            desc: ''
          },
          {
            label: 'Vejica pri elipsi povedka',
            key: 'Z/LOČ/vzorec-vejica-elipsa-povedka',
            desc: ''
          },
          {
            label: 'Vejica pri primerjavi s kot',
            key: 'Z/LOČ/vzorec-vejica-kot',
            desc: ''
          },
          {
            label: 'Vejica v prirednih zvezah',
            key: 'Z/LOČ/vzorec-vejica-priredja-zvez',
            desc: ''
          },
          {
            label: 'Vejica med prirednimi odvisniki',
            key: 'Z/LOČ/vzorec-vejica-priredja-odvisnikov',
            desc: ''
          },
          {
            label: 'Vejica pri vrinjenem odvisniku',
            key: 'Z/LOČ/vzorec-vejica-vrinjen-odvisnik',
            desc: ''
          },
          {
            label: 'Vejica v pridevniškem nizu',
            key: 'Z/LOČ/vzorec-vejica-pridevniški-niz',
            desc: ''
          },

          {
            label: 'Vejica in kopičenje ločil',
            key: 'Z/LOČ/vzorec-vejica-kopičenje-ločil',
            desc: ''
          },
          {
            label: 'Vejica in kopičenje veznikov',
            key: 'Z/LOČ/vzorec-vejica-kopičenje-veznikov',
            desc: ''
          },
          {
            label: 'Vejica pri navajanju',
            key: 'Z/LOČ/vzorec-vejica-navajanje',
            desc: ''
          },

          {
            label: 'Nerazvrščena ločila',
            key: 'Z/LOČ/nerazvrščeno',
            desc: ''
          },
        ],
      },
    ],
    entries: [],
  },
  {
    group: 'Povezani popravki',
    is_expanded: false,
    subgroups: [
      {
        group: 'Oblika',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Različni problemi oblike',
            key: 'P/OBL/drugo',
            desc: ''
          },
        ],
      },
      {
        group: 'Skladnja',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Osebek',
            key: 'P/SKLA/osebek',
            desc: ''
          },
          {
            label: 'Drugi skladenjski problemi',
            key: 'P/SKLA/drugo',
            desc: ''
          },
        ],
      },
      {
        group: 'Zapis',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Mala in velika začetnica',
            key: 'P/ZAP/mala-velika',
            desc: ''
          },
        ],
      },
    ],
    entries: [],
  },
]

export const normalization: Taxonomy = [
  {
    group: 'Other',
    is_expanded: true,
    subgroups: [],
    entries: [
      {
        label: 'Cit-FL',
        key: 'Cit-FL',
        desc: 'Citation for a language'
      },
      {
        label: 'Com!',
        key: 'Com!',
        desc: 'Comment'
      },
      {
        label: 'OBS!',
        key: 'OBS!',
        desc: 'Attention'
      },
      {
        label: 'X',
        key: 'X',
        desc: 'Impossible to interpret the writer’s intention',
      },
    ],
  },
]

// Julia's updated taxonomy 19 April 2018
export const correctannot: Taxonomy = [
  {
    group: 'Orthographic',
    is_expanded: true,
    subgroups: [],
    entries: [
      {
        label: 'O',
        key: 'O',
        desc: 'Spelling',
      },
      {
        label: 'O-Cap',
        key: 'O-Cap',
        desc: 'Upper/lower case',
      },
      {
        label: 'O-Comp',
        key: 'O-Comp',
        desc: 'Spaces and hyphens between words',
      },
    ],
  },
  {
    group: 'Lexical',
    is_expanded: true,
    subgroups: [],
    entries: [
      {
        label: 'L-Der',
        key: 'L-Der',
        desc: 'Word formation (derivation and compounding)',
      },
      {
        label: 'L-FL',
        key: 'L-FL',
        desc: 'Non-Swedish word corrected to Swedish word',
      },
      {
        label: 'L-Ref',
        key: 'L-Ref',
        desc: 'Choice of anaphoric expression',
      },
      {
        label: 'L-W',
        key: 'L-W',
        desc:
          'Wrong word or phrase, other',
      },
    ],
  },
  {
    group: 'Morphological',
    is_expanded: true,
    subgroups: [],
    entries: [
      {
        label: 'M-Adj/adv',
        key: 'M-Adj/adv',
        desc: 'Adjective form of word corrected to adverb form',
      },
      {
        label: 'M-Case',
        key: 'M-Case',
        desc: 'Nominative vs genitive/accusative',
      },
      {label: 'M-Def', key: 'M-Def', desc: 'Definiteness: articles; forms of nouns and adjectives'},
      {label: 'M-F', key: 'M-F', desc: 'Grammatical category kept, form changed'},
      {label: 'M-Gend', key: 'M-Gend', desc: 'Gender'},
      {label: 'M-Num', key: 'M-Num', desc: 'Number'},
      {
        label: 'M-Other',
        key: 'M-Other',
        desc:
          'Other morphological corrections, including change between different comparational forms of adjectives',
      },
      {label: 'M-Verb', key: 'M-Verb', desc: 'Verb forms; use of ha, komma and skola auxiliaries'},
    ],
  },
  {
    group: 'Punctuation',
    is_expanded: true,
    subgroups: [],
    entries: [
      {
        label: 'P-M',
        key: 'P-M',
        desc: 'Punctuation missing (added)',
      },
      {
        label: 'P-R',
        key: 'P-R',
        desc: 'Punctuation redundant (removed)',
      },
      {
        label: 'P-Sent',
        key: 'P-Sent',
        desc: 'Sentence segmentation',
      },
      {
        label: 'P-W',
        key: 'P-W',
        desc: 'Wrong punctuation',
      },
    ],
  },
  {
    group: 'Syntactical',
    is_expanded: true,
    subgroups: [],
    entries: [
      {
        label: 'S-Adv',
        key: 'S-Adv',
        desc: 'Adverbial placement',
      },
      {
        label: 'S-Comp',
        key: 'S-Comp',
        desc: 'Compound vs multi-word expression, and other restructuring of the same lexical morphemes within a phrase',
      },
      {
        label: 'S-Clause',
        key: 'S-Clause',
        desc: 'Change of basic clause structure: syntactic function of components, hierarchical clause structure',
      },
      {
        label: 'S-Ext',
        key: 'S-Ext',
        desc: 'Extensive and complex correction',
      },
      {
        label: 'S-FinV',
        key: 'S-FinV',
        desc: 'Finite verb placement',
      },
      {
        label: 'S-M',
        key: 'S-M',
        desc:
          'Word missing (added)',
      },
      {
        label: 'S-Msubj',
        key: 'S-Msubj',
        desc: 'Subject missing (added)',
      },
      {
        label: 'S-Other',
        key: 'S-Other',
        desc:
          'Other syntactical correction',
      },
      {
        label: 'S-R',
        key: 'S-R',
        desc: 'Word redundant (removed)',
      },
      {
        label: 'S-Type',
        key: 'S-Type',
        desc: 'Change of phrase type/part of speech',
      },
      {
        label: 'S-WO',
        key: 'S-WO',
        desc: 'Word order, other',
      },
    ],
  },
  {
    group: 'Other',
    is_expanded: true,
    subgroups: [],
    entries: [
      {
        label: 'C',
        key: 'C',
        desc: 'Consistency correction, necessitated by other correction',
      },
      {
        label: 'Cit-FL',
        key: 'Cit-FL',
        desc: 'Non-Swedish word kept, i.e. not corrected',
      },
      {
        label: 'Com!',
        key: 'Com!',
        desc: 'Comments for the corpus user'
      },
      {
        label: 'OBS!',
        key: 'OBS!',
        desc: 'Internal and temporary comments for the annotators'
      },
      {
        label: 'Unid',
        key: 'Unid',
        desc: 'Unidentified correction',
      },
      {
        label: 'X',
        key: 'X',
        desc: 'Unintelligible string',
      },
    ],
  },
]

//verzija 1.2
export const correctannot_stikit: Taxonomy = [
  {
    group: 'Besedišče',
    is_expanded: false,
    subgroups: [
      {
        group: 'Glagol',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Nerazvrščeno',
            key: 'B/GLAG/nerazvrščeno',
            desc: ''
          },
          {
            label: 'Splošno',
            key: 'B/GLAG/splošno',
            desc: ''
          },
          {
            label: 'Stik',
            key: 'B/GLAG/stik',
            desc: ''
          },
          {
            label: 'Slog',
            key: 'B/GLAG/slog',
            desc: ''
          },
        ],
      },
      {
        group: 'Menjava prek meja besedne vrste',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Nerazvrščeno',
            key: 'B/MEN/nerazvrščeno',
            desc: ''
          },
          {
            label: 'Splošno',
            key: 'B/MEN/splošno',
            desc: ''
          },
          {
            label: 'Stik',
            key: 'B/MEN/stik',
            desc: ''
          },
          {
            label: 'Slog',
            key: 'B/MEN/slog',
            desc: ''
          },
        ],
      },
      {
        group: 'Pridevnik',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Nerazvrščeno',
            key: 'B/PRID/nerazvrščeno',
            desc: ''
          },
          {
            label: 'Splošno',
            key: 'B/PRID/splošno',
            desc: ''
          },
          {
            label: 'Stik',
            key: 'B/PRID/stik',
            desc: ''
          },
          {
            label: 'Slog',
            key: 'B/PRID/slog',
            desc: ''
          },
        ],
      },
      {
        group: 'Prislov',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Nerazvrščeno',
            key: 'B/PRISL/nerazvrščeno',
            desc: ''
          },
          {
            label: 'Splošno',
            key: 'B/PRISL/splošno',
            desc: ''
          },
          {
            label: 'Stik',
            key: 'B/PRISL/stik',
            desc: ''
          },
          {
            label: 'Slog',
            key: 'B/PRISL/slog',
            desc: ''
          },
        ],
      },
      {
        group: 'Samostalnik',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Nerazvrščeno',
            key: 'B/SAM/nerazvrščeno',
            desc: ''
          },
          {
            label: 'Splošno',
            key: 'B/SAM/splošno',
            desc: ''
          },
          {
            label: 'Stik',
            key: 'B/SAM/stik',
            desc: ''
          },
          {
            label: 'Slog',
            key: 'B/SAM/slog',
            desc: ''
          },
        ],
      },
      {
        group: 'Dodatne oznake',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Zaznamovano besedišče ',
            key: 'B/DOD/zaznamovano',
            desc: ''
          },
        ],
      },
      {
        group: 'Ostale besedne vrste',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Različne težave ostalih bes. vrst',
            key: 'B/OST/drugo',
            desc: ''
          },
        ],
      },
    ],
    entries: [],
  },
  {
    group: 'Skladnja',
    is_expanded: false,
    subgroups: [
      {
        group: 'Besedni red',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Nerazvrščeno',
            key: 'S/BRED/nerazvrščeno',
            desc: ''
          },
          {
            label: 'Splošno',
            key: 'S/BRED/splošno',
            desc: ''
          },
          {
            label: 'Stik',
            key: 'S/BRED/stik',
            desc: ''
          },
          {
            label: 'Slog',
            key: 'S/BRED/slog',
            desc: ''
          },
        ],
      },
      {
        group: 'Manjkajoči jezikovni elementi',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Nerazvrščeno',
            key: 'S/MANJKA/nerazvrščeno',
            desc: ''
          },
          {
            label: 'Splošno',
            key: 'S/MANJKA/splošno',
            desc: ''
          },
          {
            label: 'Stik',
            key: 'S/MANJKA/stik',
            desc: ''
          },
          {
            label: 'Slog',
            key: 'S/MANJKA/slog',
            desc: ''
          },
        ],
      },
      {
        group: 'Odvečni jezikovni elementi',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Nerazvrščeno',
            key: 'S/ODVEČ/nerazvrščeno',
            desc: ''
          },
          {
            label: 'Splošno',
            key: 'S/ODVEČ/splošno',
            desc: ''
          },
          {
            label: 'Stik',
            key: 'S/ODVEČ/stik',
            desc: ''
          },
          {
            label: 'Slog',
            key: 'S/ODVEČ/slog',
            desc: ''
          },
        ],
      },
      {
        group: 'Predlog',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Nerazvrščeno',
            key: 'S/PRED/nerazvrščeno',
            desc: ''
          },
          {
            label: 'Splošno',
            key: 'S/PRED/splošno',
            desc: ''
          },
          {
            label: 'Stik',
            key: 'S/PRED/stik',
            desc: ''
          },
          {
            label: 'Slog',
            key: 'S/PRED/slog',
            desc: ''
          },
        ],
      },
      {
        group: 'Veznik',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Nerazvrščeno',
            key: 'S/VEZ/nerazvrščeno',
            desc: ''
          },
          {
            label: 'Splošno',
            key: 'S/VEZ/splošno',
            desc: ''
          },
          {
            label: 'Stik',
            key: 'S/VEZ/stik',
            desc: ''
          },
          {
            label: 'Slog',
            key: 'S/VEZ/slog',
            desc: ''
          },
        ],
      },
      {
        group: 'Zaimek',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Nerazvrščeno',
            key: 'S/ZAIM/nerzavrščeno',
            desc: ''
          },
          {
            label: 'Splošno',
            key: 'S/ZAIM/splošno',
            desc: ''
          },
          {
            label: 'Stik',
            key: 'S/ZAIM/stik',
            desc: ''
          },
          {
            label: 'Slog',
            key: 'S/ZAIM/slog',
            desc: ''
          },
        ],
      },
      {
        group: 'Menjava stavčnega člena',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Menjava stavčnega člena',
            key: 'S/MSČ',
            desc: ''
          },
        ],
      },
    ],
    entries: [],
  },
  {
    group: 'Zapis',
    is_expanded: false,
    subgroups: [
      {
        group: 'Ločila',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Nerazvrščeno',
            key: 'Z/LOČ/nerazvrščeno',
            desc: ''
          },
          {
            label: 'Splošno',
            key: 'Z/LOČ/splošno',
            desc: ''
          },
          {
            label: 'Stik',
            key: 'Z/LOČ/stik',
            desc: ''
          },
          {
            label: 'Slog',
            key: 'Z/LOČ/slog',
            desc: ''
          },
        ],
      },
      {
        group: 'Skupaj/narazen',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Nerazvrščeno',
            key: 'Z/SN/nerazvrščeno',
            desc: ''
          },
          {
            label: 'Splošno',
            key: 'Z/SN/splošno',
            desc: ''
          },
          {
            label: 'Stik',
            key: 'Z/SN/stik',
            desc: ''
          },
          {
            label: 'Slog',
            key: 'Z/SN/slog',
            desc: ''
          },
        ],
      },
      {
        group: 'Velika/mala začetnica',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Nerazvrščeno',
            key: 'Z/MV/nerazvrščeno',
            desc: ''
          },
          {
            label: 'Splošno',
            key: 'Z/MV/splošno',
            desc: ''
          },
          {
            label: 'Stiki',
            key: 'Z/MV/stiki',
            desc: ''
          },
          {
            label: 'Slog',
            key: 'Z/MV/slog',
            desc: ''
          },
        ],
      },
      {
        group: 'Krajšave',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Nerazvrščeno',
            key: 'Z/KR/nerazvrščeno',
            desc: ''
          },
        ],
      },
      {
        group: 'Števila',
        is_expanded: false,
        subgroups: [],
        entries: [
          {
            label: 'Nerazvrščeno',
            key: 'Z/ŠTEV/nerazvrščeno',
            desc: ''
          },
        ],
      },
    ],
    entries: [],
  },
  {
    group: 'Črkovanje',
    is_expanded: false,
    subgroups: [],
    entries: [
      {
        label: 'Konzonant',
        key: 'Č/KONZ',
        desc: ''
      },
      {
        label: 'Vokal',
        key: 'Č/VOK',
        desc: ''
      },
      {
        label: 'Črkovni sklop',
        key: 'Č/SKLOP',
        desc: ''
      },
      {
        label: 'Zatipkano',
        key: 'Č/ZATIP',
        desc: ''
      },
    ],
  },
  {
    group: 'Oblika',
    is_expanded: false,
    subgroups: [],
    entries: [
      {
        label: 'Nerazvrščeno',
        key: 'O/KAT/nerazvrščeno',
        desc: ''
      },
      {
        label: 'Splošno',
        key: 'O/KAT/splošno',
        desc: ''
      },
      {
        label: 'Stik',
        key: 'O/KAT/stik',
        desc: ''
      },
      {
        label: 'Slog',
        key: 'O/KAT/slog',
        desc: ''
      },
    ],
  },
  {
    group: 'Povezani popravki',
    is_expanded: false,
    subgroups: [],
    entries: [
      {
        label: 'Zapis',
        key: 'P/ZAP',
        desc: ''
      },
      {
        label: 'Oblika',
        key: 'P/OBL',
        desc: ''
      },
      {
        label: 'Skladnja',
        key: 'P/SKLA',
        desc: ''
      },
    ],
  },
]

function doc_url(title: string): string {
  return 'https://spraakbanken.github.io/swell-project/' + title
}

const docs: Record<string, Record<string, string>> = {
  anonymization: {
    'pseudonymization guidelines': doc_url('Anonymization_guidelines'),
  },
  normalization: {
    'normalization guidelines': doc_url('Normalization_guidelines'),
  },
  correctannot_slo: {
    'annotation guidelines': doc_url('Correction-annotation_guidelines'),
  },
  correctannot_kost: {
    'annotation guidelines': doc_url('Correction-annotation_guidelines'),
  },
  correctannot_stikit: {
    'annotation guidelines': doc_url('Correction-annotation_guidelines'),
  },
  correctannot: {
    'annotation guidelines': doc_url('Correction-annotation_guidelines'),
  },
}

export const config = {
  order_changing_labels,
  examples,
  image_ws_url,
  pseuws_url,
  taxonomy: {anonymization, normalization, correctannot, correctannot_slo, correctannot_kost, correctannot_stikit},
  docs,
}

/** What group does this label belong to?

  (label_group('country') as TaxonomyGroup).group // => 'Geographic data'
  label_group('quux') // => undefined

 */
export function label_group(label: string): TaxonomyGroup | undefined {
  return config.taxonomy.anonymization.find(
    group => !!group.entries.find(entry => entry.label == label)
  )
}

export interface TaxonomyFind {
  taxonomy: string
  group: string
  entry: {label: string; desc: string}
}

export function find_label(label: string): TaxonomyFind | undefined {
  const order = label_order(label)
  if (order === LabelOrder.NUM) {
    return {taxonomy: 'anonymization', group: 'Number', entry: {label, desc: 'number'}}
  }
  if (order === LabelOrder.TEMP) {
    return undefined
  }
  for (let taxonomy in config.taxonomy) {
    for (let group of (config.taxonomy as {[mode: string]: Taxonomy})[taxonomy]) {
      let entry = group.entries.find(entry => entry.label == label)
      if (entry !== undefined) return {taxonomy, group: group.group, entry}
    }
  }
}

/** Get the taxonomy domain (editor mode) of a label. */
export function label_taxonomy(label: string): string | null {
  return find_label(label) ? find_label(label)!.taxonomy : null
}

/** Does the named taxonomy include the given label? */
export function taxonomy_has_label(taxonomy: string, label: string): boolean {
  if (!(taxonomy in config.taxonomy)) return false
  const tax: Record<string, TaxonomyGroup[]> = config.taxonomy
  return !!tax[taxonomy].find(g => g.subgroups.length > 0 ?  
    !!g.subgroups.find(sg => !!sg.entries.find(l => l.key == label))
    : !!g.entries.find(l => l.key == label))
}


/** Does the named taxonomy include the given label? */
export function taxonomy_is_expanded(taxonomy: string, label: string): boolean {
  if (!(taxonomy in config.taxonomy)) return false
  const tax: Record<string, TaxonomyGroup[]> = config.taxonomy
  return !!tax[taxonomy].find(g => g.subgroups.length > 0 ?  
    !!g.subgroups.find(sg => !!sg.entries.find(l => l.key == label && g.is_expanded && sg.is_expanded))
    : !!g.entries.find(l => l.key == label && g.is_expanded))
}

// export const visible_modes = ['anonymization', 'normalization', 'correctannot', 'validate']
export const visible_modes = ['correctannot_slo', 'correctannot_kost', 'correctannot_stikit']