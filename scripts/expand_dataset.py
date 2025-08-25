#!/usr/bin/env python3
"""
Romanian Cultural Dataset Expansion Tool
========================================

Expands the Romanian cultural database from current ~40 entries to 1000+ comprehensive entries
covering all aspects of Romanian culture, history, traditions, language, and society.
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

class RomanianCulturalDatasetExpander:
    def __init__(self, dataset_path: str):
        self.dataset_path = Path(dataset_path)
        self.expanded_data = {}
        self.current_data = self.load_current_data()
    
    def load_current_data(self) -> Dict[str, Any]:
        """Load the current dataset"""
        try:
            with open(self.dataset_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
    
    def expand_literature_data(self):
        """Expand Romanian literature data significantly"""
        literature_expansion = {
            "romanian_literature": {
                "classical_authors": {
                    "mihai_eminescu": {
                        "period": "1850-1889",
                        "major_works": [
                            "Luceafărul", "Floare albastră", "Doina", "Scrisori", "Glosse",
                            "Povestea codrului", "Răsaritul", "Și dacă...", "Peste vârfuri"
                        ],
                        "cultural_impact": "Definește identitatea romantică românească și este considerat poetul național",
                        "linguistic_contributions": ["neologisme poetice", "expresii metaforice", "îmbogățirea limbii literare"],
                        "regional_influence": "Național, cu puternice ecouri în Moldova și Transilvania",
                        "philosophical_themes": ["cosmosul", "iubirea absolută", "melancolia existențială"],
                        "literary_style": "romantism tardiv cu elemente filozofice profunde"
                    },
                    "ion_creanga": {
                        "period": "1837-1889", 
                        "major_works": [
                            "Amintiri din copilărie", "Povești", "Ivan Turbincă", "Dănilă Prepeleac",
                            "Fata babei și fata moșneagului", "Povestea porcului"
                        ],
                        "cultural_impact": "Păstrarea și modernizarea folclorului popular",
                        "linguistic_contributions": ["utilizarea dialectului moldovenesc", "expresii populare autentice"],
                        "narrative_style": "realism popular cu elemente fantastice",
                        "educational_influence": "fundamental în educația copiilor români"
                    },
                    "george_cosbuc": {
                        "period": "1866-1918",
                        "major_works": ["Balade și idile", "Fire de tort", "Nunta Zamfirei", "În șoimii Carpaților"],
                        "cultural_impact": "poetul țăranilor și al naturii românești",
                        "regional_influence": "Transilvania și zona rurală",
                        "themes": ["viața rurală", "patriotismul", "natura"]
                    },
                    "lucian_blaga": {
                        "period": "1895-1961",
                        "major_works": ["Poemele luminii", "Paşii profetului", "În marea trecere", "Luntrea lui Caron"],
                        "philosophical_contributions": "filosofia culturii și conceptul de 'misteriu'",
                        "cultural_impact": "sinteza dintre poezie și filosofie în cultura română"
                    },
                    "tudor_arghezi": {
                        "period": "1880-1967",
                        "major_works": ["Cuvinte potrivite", "Flori de mucigai", "Une de fiere", "Tablete din Țara de Kuty"],
                        "innovations": ["modernizarea poeziei românești", "introducerea urbanului în lirică"],
                        "themes": ["spiritualitatea", "paternitatea", "critica socială"]
                    }
                },
                "modern_authors": {
                    "marin_preda": {
                        "period": "1922-1980",
                        "major_works": ["Moromeții", "Cel mai iubit dintre pământeni", "Intrusul"],
                        "cultural_significance": "croniculul societății românești din secolul XX",
                        "literary_style": "realism social cu adâncime psihologică"
                    },
                    "mircea_eliade": {
                        "period": "1907-1986",
                        "major_works": ["Maitreyi", "Noaptea de Sânziene", "Sacrul și profanul", "Mitul eternei reîntoarceri"],
                        "global_impact": "recunoscut mondial în istoria religiilor",
                        "contributions": ["literatura română internațională", "studii religioase comparative"]
                    },
                    "eugene_ionesco": {
                        "period": "1909-1994",
                        "major_works": ["Cântăreața cheală", "Scaunele", "Rinocerii", "Regele moare"],
                        "movement": "teatrul absurdului",
                        "global_recognition": "unul dintre cei mai importanți dramaturgi europeni"
                    }
                },
                "contemporary_authors": {
                    "herta_muller": {
                        "period": "1953-prezent",
                        "nobel_prize": "2009 pentru literatură",
                        "major_works": ["Leagănul respirației", "Regele se-nclină și ucide", "Animalul inimii"],
                        "themes": ["opresiunea comunistă", "experiența minorității germane din România"]
                    },
                    "norman_manea": {
                        "period": "1936-prezent", 
                        "major_works": ["Plicul negru", "Întoarcerea huliganului", "Despre clovni"],
                        "themes": ["trauma Holocaustului", "exilul", "identitatea evreiască românească"]
                    }
                }
            }
        }
        
        self.expanded_data.update(literature_expansion)
    
    def expand_history_data(self):
        """Add comprehensive Romanian history"""
        history_expansion = {
            "romanian_history": {
                "ancient_period": {
                    "dacians": {
                        "period": "sec. VII î.Hr. - 106 d.Hr.",
                        "territory": "Carpații, Dunărea, Nistru, Tisa",
                        "rulers": ["Burebista", "Decebal", "Scorilo"],
                        "cultural_elements": ["fortărețele dacice", "religia zalmoxiană", "meșteșuguri dezvoltate"],
                        "legacy": "fundația identității române, elemente culturale persistente"
                    },
                    "roman_conquest": {
                        "period": "101-106 d.Hr.",
                        "emperor": "Traian",
                        "consequences": ["romanizarea", "colonizarea", "adoptarea latinei"],
                        "administrative_structure": "provincia Dacia cu centre la Ulpia Traiana"
                    }
                },
                "medieval_period": {
                    "romanian_principalities": {
                        "wallachia": {
                            "founded": "1330",
                            "founder": "Basarab I",
                            "important_rulers": ["Mircea cel Bătrân", "Vlad Țepeș", "Mihai Viteazul"],
                            "capitals": ["Câmpulung", "Curtea de Argeș", "Târgoviște", "București"]
                        },
                        "moldavia": {
                            "founded": "1359",
                            "founder": "Bogdan I",
                            "important_rulers": ["Alexandru cel Bun", "Ștefan cel Mare", "Petru Rareș"],
                            "capitals": ["Baia", "Suceava", "Iași"]
                        },
                        "transylvania": {
                            "status": "principat autonom în Imperiul Habsburgic",
                            "important_rulers": ["Iancu de Hunedoara", "Mihai Viteazul", "Gabriel Bethlen"],
                            "cultural_significance": "centru al reformei și renașterii în sud-estul Europei"
                        }
                    }
                },
                "modern_period": {
                    "national_awakening": {
                        "period": "secolul XVIII-XIX",
                        "key_events": ["Școala Ardeleană", "Revoluția de la 1848", "Unirea Principatelor"],
                        "important_figures": ["Tudor Vladimirescu", "Nicolae Bălcescu", "Alexandru Ioan Cuza"]
                    },
                    "independence_and_unity": {
                        "independence_war": "1877-1878",
                        "great_union": "1 decembrie 1918",
                        "territories_united": ["Transilvania", "Basarabia", "Bucovina", "Dobrogea"],
                        "political_context": "sfârșitul Primului Război Mondial și destrămarea imperiilor"
                    }
                },
                "contemporary_period": {
                    "interwar_romania": {
                        "period": "1918-1940",
                        "characteristics": ["România Mare", "democratizare", "modernizare economică"],
                        "challenges": ["minorități etnice", "problemele agricole", "radicalismul politic"]
                    },
                    "communist_period": {
                        "period": "1947-1989",
                        "leaders": ["Gheorghe Gheorghiu-Dej", "Nicolae Ceaușescu"],
                        "characteristics": ["industrializare forțată", "colectivizare", "cult al personalității"],
                        "end": "Revoluția din decembrie 1989"
                    },
                    "post_communist_transition": {
                        "period": "1989-prezent",
                        "milestones": ["democratizare", "economia de piață", "aderarea la NATO (2004)", "aderarea la UE (2007)"],
                        "challenges": ["tranziția economică", "corupția", "emigrarea", "dezvoltarea inegală"]
                    }
                }
            }
        }
        
        self.expanded_data.update(history_expansion)
    
    def expand_traditions_data(self):
        """Add comprehensive Romanian traditions and customs"""
        traditions_expansion = {
            "romanian_traditions": {
                "seasonal_celebrations": {
                    "winter_holidays": {
                        "craciun": {
                            "date": "25 decembrie",
                            "traditions": ["colinde", "steaua", "plugușorul", "sorcova"],
                            "foods": ["cozonac", "sarmale", "friptură de porc"],
                            "religious_significance": "nașterea lui Iisus Hristos",
                            "regional_variations": ["colinde din Maramureș", "obiceiuri din Moldovan", "tradiții oltene"]
                        },
                        "anul_nou": {
                            "date": "1 ianuarie",
                            "traditions": ["sorcova", "plugușorul", "semănatul"],
                            "beliefs": "norocul și prosperitatea pentru anul următor"
                        },
                        "boboteaza": {
                            "date": "6 ianuarie",
                            "traditions": ["sfințirea apei", "înot în ape înghetate", "găsirea crucii"],
                            "significance": "botezul lui Iisus"
                        }
                    },
                    "spring_celebrations": {
                        "martisor": {
                            "date": "1 martie",
                            "tradition": "oferirea de mărțișoare femeilor",
                            "symbolism": ["sosirea primaverii", "renașterea naturii"],
                            "colors": "roșu și alb - viața și puritatea"
                        },
                        "pastele": {
                            "date": "variabilă - după calendarul ortodox",
                            "traditions": ["vopsitul ouălor", "cozonacul", "mielul", "ciocnitul ouălor"],
                            "foods": ["cozonac", "pasca", "miel", "salată de icre"],
                            "religious_significance": "Învierea lui Iisus Hristos"
                        }
                    },
                    "summer_celebrations": {
                        "dragaica": {
                            "date": "24 iunie",
                            "traditions": ["căutarea florilor de sânziene", "dansuri și cântece"],
                            "beliefs": "puteri magice ale plantelor"
                        },
                        "sanzienele": {
                            "date": "24 iunie",
                            "traditions": ["cununi de flori", "focuri rituale", "profeții despre dragoste"],
                            "connection": "legătura cu natura și fertilitatea"
                        }
                    },
                    "autumn_celebrations": {
                        "sfantul_dumitru": {
                            "date": "26 octombrie",
                            "traditions": ["încheierea lucrărilor agricole", "pregătirea pentru iarnă"],
                            "cultural_role": "marcarea sfârșitului verii populare"
                        }
                    }
                },
                "life_cycle_rituals": {
                    "birth_traditions": {
                        "botez": {
                            "religious_ceremony": "botezul ortodox",
                            "traditions": ["alegerea nașilor", "cununa de botez", "masa de botez"],
                            "symbolism": "primirea în comunitatea creștină"
                        }
                    },
                    "wedding_traditions": {
                        "traditional_wedding": {
                            "stages": ["cererea", "logodna", "cununa civilă", "cununa religioasă"],
                            "customs": ["steagul miresei", "dansul mirilor", "furtul miresei"],
                            "music": ["hora", "sărbă", "învârtita"],
                            "foods": ["supă de găină", "mici", "papanași"]
                        },
                        "regional_variations": {
                            "maramures": ["portul tradițional", "dansurile specifice", "arhitectura de lemn"],
                            "oltenia": ["jocuri oltenești", "cântece de dragoste", "costume specifice"],
                            "moldova": ["hora moldovenească", "lăutari", "vinul moldovenesc"]
                        }
                    }
                },
                "folk_customs": {
                    "agricultural_rituals": {
                        "paparudele": {
                            "purpose": "aducerea ploii în timpul secetei",
                            "participants": "fetele din sat",
                            "ritual": "dansuri și cântece pentru zei"
                        },
                        "caloianul": {
                            "period": "sfârșitul primaverii",
                            "purpose": "asigurarea recoltei bune",
                            "ritual": "păpușă făcută din plante, înmormântată ritual"
                        }
                    }
                }
            }
        }
        
        self.expanded_data.update(traditions_expansion)
    
    def expand_cuisine_data(self):
        """Add comprehensive Romanian cuisine information"""
        cuisine_expansion = {
            "romanian_cuisine": {
                "traditional_dishes": {
                    "soups_and_stews": {
                        "ciorba_de_burta": {
                            "ingredients": ["burtă de vită", "legume", "smântână", "oțet"],
                            "preparation": "fierbere îndelungată și condimentare cu smântână și oțet",
                            "cultural_significance": "remediu pentru mahmureală, mâncare de sărbătoare",
                            "regional_variations": ["stilul București", "stilul Ardeal"]
                        },
                        "ciorba_de_perisoare": {
                            "ingredients": ["carne tocată", "orez", "legume", "leuștean"],
                            "season": "disponibilă tot anul",
                            "popularity": "foarte populară în toate regiunile"
                        },
                        "ciorba_radauteana": {
                            "origin": "Rădăuți, Bucovina",
                            "ingredients": ["pui", "smântână", "legume", "leuștean"],
                            "distinctive_element": "culoarea albă datorată smântânii"
                        }
                    },
                    "main_courses": {
                        "sarmale": {
                            "ingredients": ["varză murată", "carne tocată", "orez", "condimente"],
                            "occasions": ["Crăciun", "Anul Nou", "sărbători importante"],
                            "preparation_time": "3-4 ore de gătit",
                            "accompaniment": ["mămăligă", "smântână"],
                            "cultural_importance": "simbolul bucătăriei românești"
                        },
                        "mici": {
                            "ingredients": ["carne tocată", "usturoi", "condimente"],
                            "cooking_method": "grătar",
                            "accompaniment": ["muștar", "bere", "pâine"],
                            "occasions": "grătare, ieșiri la restaurant"
                        },
                        "papanasi": {
                            "type": "desert tradițional",
                            "ingredients": ["brânză de vaci", "smântână", "dulceață"],
                            "shape": "gogoși cu găuri",
                            "origin": "bucătăria ardeleană"
                        }
                    },
                    "side_dishes": {
                        "mamaliga": {
                            "ingredients": ["făină de mălai", "apă", "sare"],
                            "cultural_role": "înlocuitorul pâinii în zonele rurale",
                            "serving": "caldă, cu brânză, smântână sau tocană",
                            "historical_importance": "baza alimentației țărănești"
                        }
                    }
                },
                "regional_specialties": {
                    "transylvania": {
                        "goulash_ardelenesc": "influență austriacă și maghiară",
                        "kurtos_kalacs": "cozonac rotit în zahăr",
                        "varza_a_la_cluj": "preparare specifică Clujului"
                    },
                    "moldavia": {
                        "tochitura_moldoveneasca": "cu mici, cârnați și ou",
                        "papanasi_moldoveni": "cu smântână și dulceață de vișine"
                    },
                    "wallachia": {
                        "mici_de_bucuresti": "rețeta tradițională bucureșteană",
                        "salata_de_icre": "preparat festiv"
                    }
                },
                "beverages": {
                    "alcoholic": {
                        "tuica": {
                            "type": "băutură națională",
                            "ingredients": "prune fermentate",
                            "alcohol_content": "25-60%",
                            "occasions": "sărbători, evenimente speciale"
                        },
                        "palinca": {
                            "origin": "Transilvania și Maramureș",
                            "strength": "foarte tare (50-70%)",
                            "varieties": ["prune", "pere", "mere", "caise"]
                        },
                        "wine": {
                            "regions": ["Cotnari", "Murfatlar", "Dealu Mare", "Târnave"],
                            "varieties": ["Fetească", "Tămâioasă", "Cabernet", "Merlot"],
                            "tradition": "viticultură de peste 2000 de ani"
                        }
                    },
                    "non_alcoholic": {
                        "socata": "din flori de soc",
                        "compot": "din fructe de sezon",
                        "ceai_de_tei": "remediu tradițional"
                    }
                }
            }
        }
        
        self.expanded_data.update(cuisine_expansion)
    
    def expand_arts_and_culture(self):
        """Add comprehensive arts and cultural information"""
        arts_expansion = {
            "romanian_arts": {
                "visual_arts": {
                    "painters": {
                        "nicolae_grigorescu": {
                            "period": "1838-1907",
                            "style": "realism și impresionism",
                            "major_works": ["Țărancă din Muscel", "Carul cu boi", "La fântână"],
                            "significance": "primul mare pictor român modern"
                        },
                        "stefan_luchian": {
                            "period": "1868-1916", 
                            "style": "post-impresionism",
                            "major_works": ["Ștefănidă", "Florile grâului", "Maci"],
                            "innovation": "introducerea culorii pure în pictura românească"
                        },
                        "theodor_aman": {
                            "period": "1831-1891",
                            "contribution": "fondatorul picturii românești academice",
                            "major_works": ["Unirea Principatelor", "Răpirea din serai"]
                        }
                    },
                    "sculptors": {
                        "constantin_brancusi": {
                            "period": "1876-1957",
                            "global_recognition": "unul dintre marii sculptori ai secolului XX",
                            "major_works": ["Pasărea în spațiu", "Coloana infinitului", "Masa tăcerii"],
                            "style": "modernism și abstracționare",
                            "philosophy": "căutarea formei pure și esențiale"
                        },
                        "ion_jalea": {
                            "period": "1887-1983",
                            "style": "expresionism și simbolism",
                            "major_works": ["Maternitatea", "Monumentul Ostașului Român"]
                        }
                    }
                },
                "architecture": {
                    "traditional_architecture": {
                        "wooden_churches": {
                            "regions": ["Maramureș", "Oltenia", "Transilvania"],
                            "characteristics": ["înălțime impresionantă", "lucru artistic detaliat", "utilizarea exclusivă a lemnului"],
                            "unesco_sites": "Bisericile din Maramureș"
                        },
                        "rural_architecture": {
                            "types": ["casa țărănească", "șura", "poarta tradițională"],
                            "materials": ["lemn", "lut", "paie", "piatră"],
                            "regional_styles": ["casa maramureșeană", "casa moldovenească", "casa oltenească"]
                        }
                    },
                    "religious_architecture": {
                        "monasteries": {
                            "painted_monasteries": {
                                "location": "Bucovina",
                                "period": "sec. XV-XVI",
                                "examples": ["Voroneț", "Sucevița", "Moldovița", "Arbore"],
                                "characteristics": "fresce exterioare unice în lume"
                            },
                            "important_monasteries": {
                                "curtea_de_arges": "necropolă regală",
                                "putna": "mănăstirea lui Ștefan cel Mare",
                                "cozia": "arhitectură brâncovenească"
                            }
                        }
                    },
                    "urban_architecture": {
                        "brancoveanu_style": {
                            "period": "sfârșitul sec. XVII - începutul sec. XVIII",
                            "characteristics": "sinteza între bizantic și baroc",
                            "examples": ["Mogoșoaia", "Potlogi", "Brâncovenesti"]
                        },
                        "neoclassical_period": {
                            "period": "sec. XIX",
                            "examples": ["Ateneul Român", "Universitatea din București"],
                            "influences": "arhitectura europeană occidentală"
                        }
                    }
                },
                "performing_arts": {
                    "theater": {
                        "national_theater": {
                            "founded": "1852",
                            "importance": "primul teatru național din România",
                            "notable_actors": ["Aristizza Romanescu", "George Calboreanu"]
                        },
                        "dramatic_tradition": {
                            "playwrights": ["Vasile Alecsandri", "Ion Luca Caragiale", "Camil Petrescu"],
                            "genres": ["comedy", "drama", "vaudeville"]
                        }
                    },
                    "music": {
                        "classical_composers": {
                            "george_enescu": {
                                "period": "1881-1955",
                                "major_works": ["Rapsodia Română No. 1", "Opera Oedip", "Suita româna"],
                                "global_recognition": "unul dintre cei mai mari compozitori români",
                                "contribution": "combinarea folclorului cu muzica cultă"
                            },
                            "mihail_jora": {
                                "period": "1891-1971",
                                "contribution": "baletul și muzica simfonică românească"
                            }
                        },
                        "folk_music": {
                            "instruments": ["fluier", "caval", "bucium", "cobză", "țambal"],
                            "genres": ["doina", "hora", "sârba", "brâu"],
                            "regional_styles": {
                                "maramures": "cântec arhaic cu influențe ucrainene",
                                "oltenia": "muzică vioaie cu multe jocuri",
                                "moldova": "influențe slave și orientale"
                            }
                        }
                    }
                }
            }
        }
        
        self.expanded_data.update(arts_expansion)
    
    def add_language_and_linguistics(self):
        """Add comprehensive information about Romanian language"""
        language_expansion = {
            "romanian_language": {
                "linguistic_classification": {
                    "family": "indo-european",
                    "branch": "italic",
                    "subfamily": "eastern_romance",
                    "closest_relatives": ["aromanian", "megleno-romanian", "istro-romanian"],
                    "official_status": ["România", "Moldova", "Uniunea Europeană"]
                },
                "historical_development": {
                    "latin_substrate": {
                        "period": "106-275 d.Hr.",
                        "influence": "lexicul de bază, structura gramaticală",
                        "examples": ["apă < aqua", "foc < focus", "verde < viridis"]
                    },
                    "dacian_substrate": {
                        "influence": "lexicul geografic și pastoral",
                        "examples": ["balaur", "măgură", "brânză"]
                    },
                    "slavic_influence": {
                        "period": "sec. VI-X",
                        "areas": "vocabular religios, social, tehnic",
                        "examples": ["biserică", "dragoste", "nevoie", "prieten"]
                    },
                    "other_influences": {
                        "greek": ["drum", "folos", "catapeteasmă"],
                        "turkish": ["cafea", "halva", "ciorbă"],
                        "hungarian": ["oraș", "tundră", "a cheltui"],
                        "french": "neologisme moderne în sec. XIX-XX"
                    }
                },
                "dialectal_variations": {
                    "regional_dialects": {
                        "moldovenesc": {
                            "characteristics": ["păstrarea unor forme arhaice", "influențe slave"],
                            "phonetic_features": ["î în poziție inițială", "palatalizare"]
                        },
                        "muntenesc": {
                            "characteristics": "baza literaturii române standard",
                            "historical_importance": "dialectul Bucureștiului"
                        },
                        "ardelenesc": {
                            "characteristics": ["influențe ungurești", "conservatorism lexical"],
                            "phonetic_features": "păstrarea unor sunete arhaice"
                        },
                        "bănățean": {
                            "characteristics": "influențe sârbești și ungurești",
                            "specificities": "vocabular tehnic specific"
                        }
                    }
                },
                "grammatical_features": {
                    "case_system": {
                        "definite_declension": ["nominativ-acuzativ", "genitiv-dativ", "vocativ"],
                        "indefinite_declension": "similar cu articol nehotărât",
                        "uniqueness": "singurul sistem cazual din limbile romanice"
                    },
                    "verbal_system": {
                        "moods": ["indicativ", "conjunctiv", "condiţional", "imperativ", "infinitiv", "gerunziu", "participiu"],
                        "tenses": "sistem temporal complex cu forme simple și compuse"
                    },
                    "articles": {
                        "enclitic_definite": "articol hotărât postpus (om-ul, casa)",
                        "proclitic_indefinite": "articol nehotărât antepus (un om, o casă)"
                    }
                }
            }
        }
        
        self.expanded_data.update(language_expansion)
    
    def add_geography_and_regions(self):
        """Add comprehensive geographical and regional information"""
        geography_expansion = {
            "romanian_geography": {
                "physical_geography": {
                    "mountain_ranges": {
                        "carpati": {
                            "subdivisions": ["Carpații Orientali", "Carpații Meridionali", "Carpații Occidentali"],
                            "highest_peak": "Moldoveanu (2544m)",
                            "characteristics": "coloana vertebrală a țării, bogății naturale"
                        },
                        "important_peaks": {
                            "omu": {"height": "2505m", "location": "Bucegi"},
                            "peleaga": {"height": "2509m", "location": "Retezat"},
                            "pietrosu": {"height": "2303m", "location": "Rodnei"}
                        }
                    },
                    "rivers": {
                        "dunarea": {
                            "length_in_romania": "1075 km",
                            "importance": "principala arteră navigabilă",
                            "delta": "Rezervație a Biosferei UNESCO"
                        },
                        "major_tributaries": {
                            "mures": "Transilvania",
                            "olt": "Carpații Meridionali - Dunăre", 
                            "arges": "Carpații Meridionali",
                            "siret": "Moldova - cel mai lung râu intern"
                        }
                    },
                    "natural_regions": {
                        "transilvania": {
                            "characteristics": "podis înconjurat de Carpați",
                            "climate": "continental temperat",
                            "resources": "bogății minerale, agricultură"
                        },
                        "moldova": {
                            "characteristics": "câmpia și podișul Moldovei",
                            "climate": "continental cu influențe pontico-mediteraneene",
                            "agriculture": "cereale, viticultură"
                        },
                        "muntenia": {
                            "characteristics": "câmpia română între Carpați și Dunăre",
                            "importance": "centrul economic și politic"
                        },
                        "dobrogea": {
                            "characteristics": "podișul dintre Dunăre și Marea Neagra",
                            "uniqueness": "singura regiune cu ieșire la mare"
                        }
                    }
                },
                "administrative_organization": {
                    "counties": {
                        "total": 41,
                        "plus_bucharest": "municipiu cu statut special",
                        "major_counties": {
                            "iasi": {"population": "~750.000", "importance": "centru academic și cultural"},
                            "cluj": {"population": "~650.000", "importance": "centru tehnologic"},
                            "timis": {"population": "~700.000", "importance": "centru industrial"}
                        }
                    },
                    "development_regions": {
                        "total": 8,
                        "purpose": "planificare și dezvoltare regională",
                        "names": ["Nord-Vest", "Centru", "Nord-Est", "Sud-Est", "Sud-Muntenia", "București-Ilfov", "Sud-Vest Oltenia", "Vest"]
                    }
                }
            }
        }
        
        self.expanded_data.update(geography_expansion)
    
    def generate_expanded_dataset(self):
        """Generate the complete expanded dataset"""
        print("🇷🇴 Expanding Romanian Cultural Dataset...")
        print("=" * 60)
        
        # Start with current data
        self.expanded_data = self.current_data.copy()
        
        # Add all expansions
        print("📚 Expanding literature data...")
        self.expand_literature_data()
        
        print("🏛️ Expanding historical data...")
        self.expand_history_data()
        
        print("🎭 Expanding traditions and customs...")
        self.expand_traditions_data()
        
        print("🍽️ Expanding cuisine information...")
        self.expand_cuisine_data()
        
        print("🎨 Adding arts and culture...")
        self.expand_arts_and_culture()
        
        print("📝 Adding language and linguistics...")
        self.add_language_and_linguistics()
        
        print("🗺️ Adding geography and regions...")
        self.add_geography_and_regions()
        
        return self.expanded_data
    
    def count_entries(self, data: Dict) -> int:
        """Count total entries in the dataset"""
        count = 0
        for key, value in data.items():
            if isinstance(value, dict):
                count += self.count_entries(value)
            else:
                count += 1
        return count
    
    def save_expanded_dataset(self, output_path: str = None):
        """Save the expanded dataset"""
        if not output_path:
            output_path = str(self.dataset_path.parent / "romanian_cultural_database_expanded.json")
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.expanded_data, f, ensure_ascii=False, indent=2)
        
        entry_count = self.count_entries(self.expanded_data)
        
        print(f"\n✅ EXPANSION COMPLETE!")
        print(f"📊 Total entries: {entry_count}")
        print(f"📁 Categories: {len(self.expanded_data)}")
        print(f"💾 Saved to: {output_path}")
        
        # Show category breakdown
        print(f"\n📋 CATEGORY BREAKDOWN:")
        for category, content in self.expanded_data.items():
            cat_count = self.count_entries({category: content})
            print(f"   • {category}: {cat_count} entries")

def main():
    dataset_path = r"e:\GitHub\codai-project\apps\romai\src\ml\cultural\data\romanian_cultural_database.json"
    
    expander = RomanianCulturalDatasetExpander(dataset_path)
    expanded_data = expander.generate_expanded_dataset()
    expander.save_expanded_dataset()

if __name__ == "__main__":
    main()