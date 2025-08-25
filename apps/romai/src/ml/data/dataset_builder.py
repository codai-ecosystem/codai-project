#!/usr/bin/env python3
"""
RomAI Training Dataset Builder
Comprehensive dataset compilation for Romanian cultural AI training

This module provides:
- Romanian cultural content collection and curation
- Literature and folklore dataset compilation
- Multi-domain knowledge dataset generation
- Data quality validation and filtering
- Dataset versioning and management
- Training data preprocessing and augmentation
"""

import logging
import asyncio
import json
import csv
import sqlite3
from typing import Dict, List, Optional, Any, Tuple, Set
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
import hashlib
import requests
from bs4 import BeautifulSoup
import re
import yaml
import zipfile
import aiohttp
import aiofiles
from collections import defaultdict
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DatasetEntry:
    """Single entry in training dataset"""
    entry_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    content: str = ""
    content_type: str = ""  # literature, folklore, technical, cultural, philosophical
    source: str = ""
    author: Optional[str] = None
    title: Optional[str] = None
    year: Optional[int] = None
    language: str = "ro"
    quality_score: float = 0.0
    cultural_relevance: float = 0.0
    educational_value: float = 0.0
    tags: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    processing_notes: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class DatasetCollection:
    """Collection of related dataset entries"""
    collection_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    category: str = ""
    entries: List[DatasetEntry] = field(default_factory=list)
    total_size: int = 0
    quality_stats: Dict[str, float] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)

class RomanianLiteratureCollector:
    """Collect Romanian literature content for training"""
    
    def __init__(self):
        self.classic_authors = {
            "Mihai Eminescu": {
                "period": "1850-1889",
                "style": "romantic_poetry",
                "cultural_importance": 1.0,
                "works": ["Luceafărul", "Scrisori", "Doina", "Floare albastră"]
            },
            "Ion Luca Caragiale": {
                "period": "1852-1912", 
                "style": "realistic_comedy",
                "cultural_importance": 0.9,
                "works": ["O scrisoare pierdută", "D-ale carnavalului", "Conu Leonida față cu reacțiunea"]
            },
            "Mihail Sadoveanu": {
                "period": "1880-1961",
                "style": "epic_realism",
                "cultural_importance": 0.9,
                "works": ["Baltagul", "Creanga de aur", "Hanu Ancuței"]
            },
            "Lucian Blaga": {
                "period": "1895-1961",
                "style": "philosophical_poetry",
                "cultural_importance": 0.95,
                "works": ["Poemele luminii", "Paşii profetului", "La cumpăna apelor"]
            },
            "George Bacovia": {
                "period": "1881-1957",
                "style": "symbolist_poetry",
                "cultural_importance": 0.85,
                "works": ["Plumb", "Scântei galbene", "Comedii din bărșană"]
            }
        }
        
        self.folk_literature = {
            "Miorița": {
                "type": "ballad",
                "themes": ["death", "acceptance", "beauty", "shepherding"],
                "cultural_significance": 1.0,
                "regions": ["Muntenia", "Oltenia", "Ardeal"]
            },
            "Meșterul Manole": {
                "type": "legend", 
                "themes": ["sacrifice", "art", "love", "creation"],
                "cultural_significance": 0.95,
                "regions": ["Muntenia", "Ardeal"]
            },
            "Făt-Frumos": {
                "type": "fairy_tale",
                "themes": ["heroism", "love", "magic", "justice"],
                "cultural_significance": 0.9,
                "regions": ["all_regions"]
            },
            "Ileana Cosânzeana": {
                "type": "fairy_tale",
                "themes": ["beauty", "love", "magic", "transformation"],
                "cultural_significance": 0.85,
                "regions": ["all_regions"]
            }
        }
        
        logger.info("✅ Romanian literature collector initialized")
    
    async def collect_classic_literature_samples(self) -> List[DatasetEntry]:
        """Collect samples of classic Romanian literature"""
        literature_entries = []
        
        # Sample content for each classic author (in a real implementation, 
        # these would be loaded from actual literary works)
        eminescu_samples = [
            {
                "title": "Luceafărul - Fragment",
                "content": """Și părea în lumea largă
Că e singur și că moare,
Că nu are nici o soacră
Pentru dorul lui de soare.

Hyperion îi era numele...
Dar pe-atunci el se chema,
Pentru oamenii de rând,
Luceafărul de dimineață.""",
                "themes": ["cosmic_love", "solitude", "aspiration", "romantic_idealism"]
            },
            {
                "title": "Doina - Fragment", 
                "content": """De ce nu-mi vii, măi Doină,
De ce mă faci să-noar?
Mai bine du-te, du-te,
Să nu te mai văd iar.

Că pentru dragostea ta
Să mor nu vreau în trai,
Că pentru dorul tău
În pârâu m-aș îneca.""",
                "themes": ["love_longing", "folk_tradition", "rural_life", "emotional_depth"]
            },
            {
                "title": "Floare Albastră - Fragment",
                "content": """Prin codrii Moldovei dese
Rămăsese o stăruină,
Și din poarta de cetate
Ies în câmp doi tineri.

Unul în alb îmbrăcat,
Celălalt cu negru chiar,
Ochii lui sunt ca o stea,
Părul blond ca mătăsea.""",
                "themes": ["medieval_romance", "nature", "youth", "contrast"]
            },
            {
                "title": "Sara pe Deal - Fragment",
                "content": """Pe când în codru se lăsa
O toamnă tristă și cuminte,
Şi vântul crivăț sufla
În părul castaniu al tinerei vireje.

Păstorii își adunau turmele,
Şi pe dealuri fumul alb
Ieșind din cocioabele mici,
În seară se înăltă.""",
                "themes": ["autumn", "pastoral", "melancholy", "nature"]
            },
            {
                "title": "Peste Vârfuri - Fragment",
                "content": """Peste vârfuri trece luna,
Codru-și bate frunza lin,
Dintre ramuri de alună
Melancolia picură vin.

Unde-mi stau odinioară
Părinții mei să se culce,
Vântul geme în gură,
Frunzele par să mi se dulce.""",
                "themes": ["nostalgia", "memory", "ancestral_home", "nature_melancholy"]
            },
            {
                "title": "Somnoroase Păsărele",
                "content": """Somnoroase păsărele
Pe la cuiburi se adună,
Se ascund în rămurele - 
Noapte bună!

Peste-a nopții feerie
Se ridică mândra lună
Şi ca o fantăzie
Spune-noapte bună.""",
                "themes": ["lullaby", "night", "peace", "gentle_nature"]
            },
            {
                "title": "Mai Am Un Singur Dor",
                "content": """Mai am un singur dor:
În liniștea serii
Să mă lase să mor
Pe-al țării-mi la margini.

Cu pieptul dezgolit
Sub bolțile reci,
Și să pot adormi
Sub brazii cei verzi.""",
                "themes": ["final_wish", "homeland", "death", "nature_peace"]
            },
            {
                "title": "Ce Te Legeni, Codrule",
                "content": """Ce te legeni, codrule,
Fără de vânt în văzduh?
De ce suspini fără de jale,
Fără de dor și de păcat?

Cântecele de demult
În tine se mai aud,
Glasuri de-a bună încrezeut
În ramurile tale crud.""",
                "themes": ["forest_mystery", "ancient_songs", "nature_wisdom", "temporal_connection"]
            }
        ]
        
        blaga_samples = [
            {
                "title": "Eu nu strivesc corola de minuni a lumii - Fragment",
                "content": """Eu nu strivesc corola de minuni a lumii
și nu ucid cu mintea tainele, ce le-ntâlnesc
în calea mea
în flori, în ochi, pe buze ori morminte.

Lumina altora
sugrumă vraja nepătrunsului ascuns
în adâncimi de întuneric,
dar eu,
eu cu lumina mea sporesc a lumii taină.""",
                "themes": ["mystery", "wonder", "philosophy", "light_metaphor"]
            },
            {
                "title": "Poemul Luminii - Fragment",
                "content": """Şi lumina se făcu
Din chaos şi întuneric,
Prima taină se născu
În abisul esoteric.

Înaintea tuturor,
Fu cuvântul cel dintâi,
Şi din faptul cel mai pur
Se născu întâiul grai.""",
                "themes": ["creation", "primordial_light", "cosmic_birth", "genesis_philosophy"]
            },
            {
                "title": "În Marea Trecere - Fragment",
                "content": """Curg prin mine şi în lume
Timpuri care nu s-au fost,
Și mă-nalță pe un nume
Ce nu-i al nimănui rost.

În marea trecere îmi pierd
Conturul şi chipul meu,
Şi devin ce nu mai sper
Să devin în veacul seu.""",
                "themes": ["transcendence", "temporal_flow", "identity_dissolution", "cosmic_becoming"]
            },
            {
                "title": "Gorunul - Fragment",
                "content": """În poiana cu goruni bătrâni
Îmi place să vin spre seară,
Când umbra lor se prelungeşte
Şi lumea pare mai uşoară.

Aici e pace şi tăcere,
Aici e timpul suspendat,
Din trunchiul lor de mii de ani
Înţelepciunea a răsărit.""",
                "themes": ["ancient_wisdom", "nature_peace", "temporal_suspension", "tree_consciousness"]
            },
            {
                "title": "Tristeţea Apelor - Fragment",
                "content": """Apele îşi duc amarul
Spre mări ce nu le-aşteaptă,
Şi eu cu dorul meu cel mare
Pe urma lor încerc să sară.

Dar unde se duc toate râurile?
Şi unde se duce şi timpul?
În marea uitare cosmică
Ori în adâncul primului minut?""",
                "themes": ["water_sadness", "temporal_flow", "cosmic_forgetfulness", "existential_questions"]
            },
            {
                "title": "Vatra Filosofică - Fragment",
                "content": """La vatra gândului stă adunat
Întregul suflet al neamului,
Şi focul care nu s-a stins niciodată
E focul înţelegerii noastre.

Din străfundul vremurilor
Se-nalţă flacăra cuprinderii,
Şi totul capătă înţeles
În lumina ei de recunoștinţe.""",
                "themes": ["philosophical_hearth", "national_soul", "eternal_understanding", "recognition_light"]
            }
        ]
        
        # Process Eminescu samples
        for sample in eminescu_samples:
            entry = DatasetEntry(
                content=sample["content"],
                content_type="literature",
                source="classic_romanian_poetry",
                author="Mihai Eminescu",
                title=sample["title"],
                year=1880,  # Approximate
                quality_score=0.95,
                cultural_relevance=1.0,
                educational_value=0.9,
                tags=["poetry", "romanticism", "classic", "eminescu"] + sample["themes"],
                metadata={
                    "literary_period": "romanticism",
                    "cultural_importance": self.classic_authors["Mihai Eminescu"]["cultural_importance"],
                    "themes": sample["themes"],
                    "style": "romantic_poetry"
                }
            )
            literature_entries.append(entry)
        
        # Process Blaga samples
        for sample in blaga_samples:
            entry = DatasetEntry(
                content=sample["content"],
                content_type="literature",
                source="classic_romanian_poetry",
                author="Lucian Blaga",
                title=sample["title"],
                year=1919,
                quality_score=0.92,
                cultural_relevance=0.95,
                educational_value=0.95,
                tags=["poetry", "philosophy", "modernism", "blaga"] + sample["themes"],
                metadata={
                    "literary_period": "modernism",
                    "cultural_importance": self.classic_authors["Lucian Blaga"]["cultural_importance"],
                    "themes": sample["themes"],
                    "style": "philosophical_poetry"
                }
            )
            literature_entries.append(entry)
        
        logger.info(f"✅ Collected {len(literature_entries)} classic literature samples")
        return literature_entries
    
    async def collect_folklore_samples(self) -> List[DatasetEntry]:
        """Collect Romanian folklore samples"""
        folklore_entries = []
        
        # Sample folklore content
        folklore_samples = {
            "Miorița": {
                "content": """La o gură de rai,
La o poartă de mai,
Se întâlnesc cu vitele
Trei ciobani cu oile.

Unu-i din Vrâncea,
Altul din Brâncea,
Al treilea din Teleorman,
Cel mai frumos cioban.

Cel din Vrâncea și din Brâncea
Se sfătuiesc amândoi
Să-l omoare seara
Pe cel din Teleorman...""",
                "themes": ["destiny", "beauty", "jealousy", "pastoral_life", "death_acceptance"]
            },
            "Meșterul Manole": {
                "content": """Negru Vodă, făcând țara,
Strâns-a meșteri din țară,
Zece meșteri și un zugrav,
Și Manole cel pe dreptul,
Să-i facă mănăstire,
Frumoasă și tare,
Să nu se mai prăbușească,
Să nu se mai cutremure.""",
                "themes": ["creation", "sacrifice", "art", "love", "destiny"]
            },
            "Făt-Frumos": {
                "content": """Era odată ca niciodată,
Că de n-ar fi, nu s-ar povesti,
Era un împărat,
Care avea trei feciori.

Cel mai mic, Făt-Frumos pe numele lui,
Era cel mai voinic și înțelept.
Când împăratul a îmbătrânit,
A chemat pe cei trei feciori...""",
                "themes": ["heroism", "wisdom", "justice", "magic", "coming_of_age"]
            },
            "Ileana Cosânzeana": {
                "content": """Într-o țară, la marginea lumii,
Trăia o fată frumoasă ca soarele,
Ileana Cosânzeana o chema,
Și părul ei era ca aurul curat.

Dar Ileana era răpită de un zmeu
Care o ținea într-un castel întunecat,
Și plângea zi și noapte
Pentru casa părintească.""",
                "themes": ["beauty", "captivity", "rescue", "feminine_strength", "homecoming"]
            },
            "Harap Alb": {
                "content": """Într-o împărăție îndepărtată
Trăia un împărat cu doi feciori.
Cel mare era mândru și răutăcios,
Cel mic blând și cu inima bună.

Dar împăratul i-a alungat pe amândoi
Să-și câștige împărăția cu sabia,
Și cei doi frați au plecat
Pe drumurile lumii.""",
                "themes": ["brotherhood", "trials", "good_versus_evil", "transformation", "redemption"]
            },
            "Prâslea cel Voinic": {
                "content": """Prâslea era cel mai voinic flăcău
Din toate satele de pe meleag,
Cu puterea a zece oameni
Și cu inima curată ca izvorul.

Când au venit vrăjitorii răi
Să fure comoara țării,
Prâslea și-a luat sabia
Și a pornit în urmărirea lor.""",
                "themes": ["strength", "courage", "protection", "supernatural_battle", "national_defense"]
            },
            "Legenda Dacilor": {
                "content": """Pe munții Carpaților bătrâni
Trăiau odinioară dacii viteji,
Cu Zamolxis ca dumnezeu
Și cu sufletul nemuritor.

Ei știau tainele naturii
Și vorbeau cu lupii și cu ursii,
Iar când veneau dușmanii
Se transformau în furtună.""",
                "themes": ["ancient_heritage", "divine_connection", "nature_wisdom", "transformation", "spiritual_power"]
            },
            "Basmul Rozelor": {
                "content": """În grădina împăratului
Creșteau trandafiri minunați,
Roșii ca sângele viteaz
Și albi ca lacrima de bucurie.

Dar o vrăjitoare rea
A vrut să le smulgă pe toate,
Și florile au început să vorbească
Cerând ajutorul unui erou.""",
                "themes": ["magical_flowers", "good_versus_evil", "nature_protection", "heroic_calling", "beauty_defense"]
            },
            "Legenda Mândrului": {
                "content": """Pe Valea Mureșului
Trăia un flăcău mândru,
Care se lăuda că nu există
Fată să-i reziste farmecului.

Dar o zână din pădure
L-a auzit lăudându-se
Și a hotărât să-l pedepsească
Pentru trufia lui mare.""",
                "themes": ["pride", "divine_punishment", "humility_lesson", "fairy_intervention", "moral_teaching"]
            }
        }
        
        for title, content_data in folklore_samples.items():
            folklore_info = self.folk_literature.get(title, {})
            
            entry = DatasetEntry(
                content=content_data["content"],
                content_type="folklore",
                source="romanian_oral_tradition",
                author="Anonymous",
                title=title,
                year=None,  # Traditional, date unknown
                quality_score=0.9,
                cultural_relevance=folklore_info.get("cultural_significance", 0.8),
                educational_value=0.85,
                tags=["folklore", "tradition", "oral_literature", title.lower()] + content_data["themes"],
                metadata={
                    "folklore_type": folklore_info.get("type", "unknown"),
                    "cultural_significance": folklore_info.get("cultural_significance", 0.8),
                    "themes": content_data["themes"],
                    "regions": folklore_info.get("regions", ["unknown"]),
                    "transmission": "oral_tradition"
                }
            )
            folklore_entries.append(entry)
        
        logger.info(f"✅ Collected {len(folklore_entries)} folklore samples")
        return folklore_entries

class RomanianCulturalDataCollector:
    """Collect Romanian cultural knowledge and traditions"""
    
    def __init__(self):
        self.cultural_categories = {
            "traditions": {
                "holidays": ["Crăciun", "Paște", "Mărțișor", "Dragobete", "Sânzienele"],
                "customs": ["Colinde", "Căluș", "Hora", "Păpușile", "Obiceiuri de nuntă"],
                "celebrations": ["Hramul satului", "Zilele orașului", "Festivaluri populare"]
            },
            "values": {
                "family": ["respectul bătrânilor", "unitatea familiei", "ospitalitatea"],
                "work": ["munca cinstită", "meșteșugurile", "agricultura tradițională"],
                "community": ["ajutorul reciproc", "solidaritatea", "viața de comună"]
            },
            "symbols": {
                "national": ["tricolorul", "stema", "imnul național"],
                "religious": ["crucea", "biserica", "icoanele"],
                "folk": ["motivele populare", "ia românească", "ceramica tradițională"]
            },
            "cuisine": {
                "traditional": ["mici", "ciorbă de burtă", "sarmale", "papanași"],
                "regional": ["ciorbă de perișoare", "mămăligă", "brânză de burduf"],
                "festive": ["cozonac", "pască", "colaci", "turte dulci"]
            }
        }
        
        self.regional_specifics = {
            "Moldova": {
                "characteristics": ["vorba blândă", "ospitalitatea", "tradițiile păstrate"],
                "cuisine": ["ciorbă de perișoare", "răcituri", "papanași"],
                "crafts": ["olăritul", "țesutul", "cusutul"]
            },
            "Transilvania": {
                "characteristics": ["disciplina", "multicultural", "arhitectura săsească"],
                "cuisine": ["varză cu ciolan", "kurtos kalacs", "palinca"],
                "crafts": ["prelucrarea lemnului", "fierăritul", "ceramica"]
            },
            "Muntenia": {
                "characteristics": ["viața de la țară", "folclorul bogat", "hora"],
                "cuisine": ["mici", "ciorbă de burtă", "papanași"],
                "crafts": ["țesutul", "olăritul", "pictatul pe sticlă"]
            }
        }
        
        logger.info("✅ Romanian cultural data collector initialized")
    
    async def collect_cultural_traditions(self) -> List[DatasetEntry]:
        """Collect data about Romanian cultural traditions"""
        cultural_entries = []
        
        # Tradition descriptions
        tradition_data = {
            "Mărțișor": {
                "description": """Mărțișorul este o tradiție românească celebrată la 1 martie, marcând începutul primăverii. Constă într-un șnur împletit din fire albe și roșii, la care se atașează o mică podoabă. Bărbații oferă mărțișoare femeilor ca simbol de respect, dragoste și dorința ca primăvara să le aducă sănătate și fericire. Culorile alb și roșu simbolizează puritatea și dragostea, iar tradiția are rădăcini dacice și romane.""",
                "themes": ["primăvara", "dragoste", "respect", "tradiție", "simbolism"],
                "regions": ["toată România", "Moldova", "Basarabia"]
            },
            "Colinde": {
                "description": """Colindele sunt cântece tradiționale românești de Crăciun, prin care se vestește nașterea Domnului Isus. Colindătorii merg din casă în casă, cântând colinde și primind în schimb dulciuri, fructe sau bani. Această tradiție are rădăcini pre-creștine, fiind legată de ritualurile de sfârșit și început de an. Colindele românești sunt bogate în simboluri și metafore, exprimând credința, speranța și bucuria sărbătorilor.""",
                "themes": ["Crăciun", "tradiție creștină", "comunitate", "bucurie", "credința"],
                "regions": ["toată România", "zonele rurale"]
            },
            "Hora": {
                "description": """Hora este dansul tradițional românesc cel mai reprezentativ, simbolizând unitatea și solidaritatea comunității. Se dansează în cerc, cu mâinile împreunate, iar mișcările sunt simple și repetitive, permitând participarea tuturor. Hora se dansează la sărbători, nunți, hramuri și alte evenimente importante. Reprezintă egalitatea, fratergitatea și bucuria de a fi împreună, fiind o expresie autentică a spiritului românesc.""",
                "themes": ["dans", "comunitate", "unitate", "tradiționale", "sărbători"],
                "regions": ["toată România", "Balcanii"]
            },
            "Dragobete": {
                "description": """Dragobetele, sărbătorit la 24 februarie, este considerat 'Zilei Îndrăgostiților' la români, fiind o alternativă autentică la Sfântul Valentin. Legenda spune că Dragobete, fiul Babei Dochia, aduce primăvara și trezește dragostea în inimi. Tinerii se întâlnesc în natură, culeg flori și se jură dragoste eternă. Este o tradiție care celebrează dragostea pură, natură și renașterea spirituală.""",
                "themes": ["dragoste", "primăvară", "tineret", "natură", "renaștere"],
                "regions": ["Muntenia", "Oltenia", "Transilvania"]
            },
            "Paștele": {
                "description": """Paștele este cea mai importantă sărbătoare creștină la români, celebrând învierea Domnului Isus. Pregătirile încep cu Postul Mare, iar Săptămâna Patimilor culminează cu Învierea. Tradițiile includ vopsitul ouălor, prepararea cozonacului și a pascăi, slujba de Înviere și strigătul 'Hristos a înviat!' urmat de răspunsul 'Adevărat a înviat!'. Este o perioadă de bucurie spirituală, familie și renaștere.""",
                "themes": ["creștinism", "înviere", "familie", "bucurie", "tradiții culinare"],
                "regions": ["toată România", "ortodoxia românească"]
            },
            "Sânzienele": {
                "description": """Sânzienele sau Drăgaica se sărbătoresc la 24 iunie, marcând solstițiul de vară. Fetele culeg plante medicinale și fac coroane din 12 feluri de ierburi, pe care le aruncă pe acoperișuri pentru noroc. Legenda spune că în această noapte ielele dansează și plantele capătă puteri magice. Este o tradiție legată de magia naturii, fertilitate și protecția împotriva relelor.""",
                "themes": ["solstițiu", "magie", "plante medicinale", "fertilitate", "protecție"],
                "regions": ["Transilvania", "Banat", "Crișana"]
            },
            "Fătatul": {
                "description": """Fătatul este ceremonia de logodnă tradițională românească, prin care se oficializează intenția de căsătorie între doi tineri. Reprezentanții familiilor se întâlnesc pentru a discuta condițiile căsătoriei, zestrea și data nunții. Se bea vin și se sparge un pahar ca simbol al legămintului definitiv. Această tradiție subliniază importanța familiei și a respectului reciproc în cultura română.""",
                "themes": ["logodnă", "familie", "căsătorie", "respect", "comunitate"],
                "regions": ["zonele rurale", "Transilvania", "Moldova"]
            },
            "Căluțul": {
                "description": """Căluțul este un joc dramatic tradițional româesc, jucat în perioada sărbătorilor de iarnă. Participanții poartă măști și costume, iar acțiunea se învârte în jurul unui căluț de lemn care 'moare' și 'învie'. Reprezintă lupta dintre bine și rău, moarte și renaștere, fiind o manifestare a vechilor credințe dacice legate de ciclurile naturii și regenerarea vieții.""",
                "themes": ["teatru popular", "măști", "renaștere", "credințe dacice", "simbolism"],
                "regions": ["Moldova", "Muntenia", "satele de munte"]
            },
            "Doarea": {
                "description": """Doarea este o tradiție de ajutor reciproc în munca agricolă, prin care membrii unei comunități se adună pentru a termina o lucrare grea într-o singură zi. Se practică la seceriș, vânturatul grânelor, construirea unei case sau alte activități care necesită multe brațe de muncă. Ziua se încheie cu o masă comună și petrecere. Reprezintă solidaritatea, generozitatea și spiritul de echipă specific românilor.""",
                "themes": ["ajutor mutual", "agricultură", "solidaritate", "comunitate", "generozitate"],
                "regions": ["zonele rurale", "toată România"]
            },
            "Junii Brașovului": {
                "description": """Junii Brașovului este o tradiție specifică orașului Brașov, în care tinerii îmbrăcați în costume populare tradiționale defilează prin oraș în prima duminică după Paștele Catolic. Tradiția datează din secolul XV și marchează dreptul brașovenilor de a participa la viața publică a orașului. Junii poartă pălării cu panglici colorate și cai împodobiți, reprezentând vitejia și mândria locală.""",
                "themes": ["parada", "costume populare", "istorie urbană", "mândrie locală", "tineret"],
                "regions": ["Brașov", "Transilvania"]
            },
            "Cântatul Colindelor": {
                "description": """Cântatul colindelor este o tradiție românească de Crăciun prin care grupuri de copii și tineri merg din casă în casă cântând colinde pentru a vesti nașterea Mântuitorului. Colindătorii sunt primiți cu bucurie și răsplătiți cu dulciuri, fructe sau bani. Colindele românești sunt cântece vechi care îmbină elementele creștine cu tradițiile populare, creând o atmosferă magică de sărbătoare.""",
                "themes": ["Crăciun", "colinde", "copii", "comunitate", "generozitate"],
                "regions": ["toată România", "toate regiunile"]
            }
        }
        
        for tradition_name, info in tradition_data.items():
            entry = DatasetEntry(
                content=info["description"],
                content_type="cultural",
                source="romanian_traditions",
                author=None,
                title=f"Tradiția - {tradition_name}",
                year=None,
                quality_score=0.85,
                cultural_relevance=0.95,
                educational_value=0.9,
                tags=["tradiții", "cultură", tradition_name.lower()] + info["themes"],
                metadata={
                    "tradition_type": "celebration",
                    "cultural_importance": 0.9,
                    "regions": info["regions"],
                    "themes": info["themes"],
                    "category": "traditions"
                }
            )
            cultural_entries.append(entry)
        
        # Romanian values descriptions
        values_data = {
            "Ospitalitatea românească": {
                "description": """Ospitalitatea este una dintre valorile fundamentale ale poporului român. 'Musafirul în casă, Dumnezeu în casă' spune o vorbă românească veche. Românii își primesc oaspeții cu căldură, oferindu-le tot ce au mai bun: mâncare, băutură și un loc de odihnă. Această tradiție se manifestă prin grija față de străini, prin dorința de a face pe oaspete să se simtă binevenit și prin generozitatea cu care se împart bunurile. Ospitalitatea românească este recunoscută în întreaga lume.""",
                "themes": ["valori", "generozitate", "grija", "căldura", "tradiție"]
            },
            "Respectul pentru bătrâni": {
                "description": """În cultura românească, bătrânii sunt prețuiți pentru înțelepciunea și experiența lor de viață. 'Bătrânul în familie este ca o comoară' se spune în popor. Tinerii au datoria să-și respecte părinții și bunicii, să le ceară sfatul în deciziile importante și să aibă grijă de ei la bătrânețe. Această valoare se reflectă în expresii precum 'să-mi trăiți', 'să fiți sănătoși' și în obiceiul de a săruta mâna bătrânilor ca semn de respect.""",
                "themes": ["respect", "familie", "înțelepciune", "grija", "tradiție"]
            }
        }
        
        for value_name, info in values_data.items():
            entry = DatasetEntry(
                content=info["description"],
                content_type="cultural",
                source="romanian_values",
                author=None,
                title=f"Valoare - {value_name}",
                year=None,
                quality_score=0.9,
                cultural_relevance=1.0,
                educational_value=0.95,
                tags=["valori", "cultură", "moralitate"] + info["themes"],
                metadata={
                    "value_type": "social",
                    "cultural_importance": 1.0,
                    "themes": info["themes"],
                    "category": "values",
                    "universality": 0.8
                }
            )
            cultural_entries.append(entry)
        
        logger.info(f"✅ Collected {len(cultural_entries)} cultural tradition samples")
        return cultural_entries
    
    async def collect_regional_specifics(self) -> List[DatasetEntry]:
        """Collect region-specific Romanian cultural information"""
        regional_entries = []
        
        for region_name, region_info in self.regional_specifics.items():
            # Create comprehensive description
            description = f"""Regiunea {region_name} se caracterizează prin: {', '.join(region_info['characteristics'])}. 
            
Bucătăria tradițională include: {', '.join(region_info['cuisine'])}. 

Meșteșugurile specifice sunt: {', '.join(region_info['crafts'])}. 

Această regiune contribuie la diversitatea culturală a României prin tradițiile sale unice și modul specific de viață al locuitorilor."""
            
            entry = DatasetEntry(
                content=description,
                content_type="cultural",
                source="romanian_regions",
                author=None,
                title=f"Regiunea {region_name} - Specificități culturale",
                year=None,
                quality_score=0.8,
                cultural_relevance=0.85,
                educational_value=0.8,
                tags=["regiuni", "diversitate", "tradiționale", region_name.lower()],
                metadata={
                    "region": region_name,
                    "characteristics": region_info["characteristics"],
                    "cuisine": region_info["cuisine"],
                    "crafts": region_info["crafts"],
                    "category": "regional_culture"
                }
            )
            regional_entries.append(entry)
        
        logger.info(f"✅ Collected {len(regional_entries)} regional cultural samples")
        return regional_entries

class PhilosophicalContentCollector:
    """Collect Romanian philosophical and wisdom content"""
    
    def __init__(self):
        self.philosophers = {
            "Lucian Blaga": {
                "concepts": ["matricea stilistică", "misterul", "cunoașterea luciferică"],
                "works": ["Trilogia culturii", "Trilogia cunoașterii", "Filozofia stilului"],
                "period": "1895-1961"
            },
            "Constantin Noica": {
                "concepts": ["modelul cultural", "spiritualitatea românească", "filozofia românească"],
                "works": ["Modelul cultural european", "Spiritualitate și democrație", "Două introduceri"],
                "period": "1909-1987"
            },
            "Petre Țuțea": {
                "concepts": ["ortodoxia", "naționalismul creștin", "critica modernității"],
                "works": ["Între Dumnezeu și neamul meu", "Probleme de filozofie a dreptului"],
                "period": "1902-1991"
            }
        }
        
        self.folk_wisdom = [
            {
                "proverb": "Cine se scoală de dimineață, departe ajunge",
                "meaning": "Hărnicia și dedicarea sunt fundamentele succesului",
                "themes": ["muncă", "perseverență", "succes"]
            },
            {
                "proverb": "Omul sfințește locul",
                "meaning": "Caracterul și acțiunile unei persoane sunt mai importante decât împrejurările",
                "themes": ["caracter", "valoare personală", "integritate"]
            },
            {
                "proverb": "Unde-i unul nu-i putere, unde-s doi puterea crește",
                "meaning": "Unirea și colaborarea multiplică forțele și posibilitățile",
                "themes": ["unitate", "colaborare", "forță"]
            },
            {
                "proverb": "Râde ciob de oală spartă",
                "meaning": "Să nu critici pe altul pentru defecte pe care le ai și tu",
                "themes": ["umilința", "autocritică", "toleranță"]
            }
        ]
        
        logger.info("✅ Philosophical content collector initialized")
    
    async def collect_philosophical_content(self) -> List[DatasetEntry]:
        """Collect Romanian philosophical content"""
        philosophical_entries = []
        
        # Sample philosophical content
        blaga_content = {
            "Matricea stilistică": {
                "content": """Matricea stilistică, conform filozofiei lui Lucian Blaga, reprezintă structura inconștientă specifică unei culturi, care determină modul în care aceasta își creează valorile spirituale. Această matrice acționează ca un filtru creator, selectând și transformând influențele externe în concordanță cu specificul cultural autohton. 

Pentru cultura românească, matricea stilistică se caracterizează prin: tendința către sinteza armonioasă a contrastelor, preferința pentru formele organice și naturale, căutarea echilibrului între tradiție și inovație, și exprimarea unei religiosități cosmice profunde. 

Blaga considera că înțelegerea matricei stilistice este esențială pentru dezvoltarea unei culturi autentice și pentru evitarea imitației sterile a modelelor străine.""",
                "themes": ["cultură", "autenticitate", "creativitate", "identitate", "spiritualitate"]
            },
            "Misterul cunoașterii": {
                "content": """Conform filozofiei lui Lucian Blaga, cunoașterea se împarte în două categorii fundamentale: cunoașterea paradisiacă (directă, întuitvă) și cunoașterea luciferică (indirectă, conceptuală). Cunoașterea paradisiacă ne conectează cu misterul existenței, păstrând sacralitatea realității, în timp ce cunoașterea luciferică tinde să demitizeze și să reducă totul la concepte reci.

Blaga susține că adevărata înțelepciune constă în echilibrul acestor două forme de cunoaștere, respectând misterul ca sursă de creativitate și inspirație. Misterul nu este ceva ce trebuie eliminat, ci ceva ce ne enrichește existența și ne permite să creăm valori spirituale autentice.""",
                "themes": ["cunoaștere", "mister", "intuiție", "creativitate", "spiritual"]
            },
            "Categorii stilistice": {
                "content": """Lucian Blaga identifica mai multe categorii stilistice care guvernează creația spirituală românească. Categoria anacronică reflectă tendința de a păstra valori tradiționale în contextul modern. Categoria spațială determină relația cu teritoriul și peisajul natal. Categoria eonică se referă la percepția timpului și eternității.

Aceste categorii nu sunt simple construcții teoretice, ci forțe vii care modelează arta, literatura, filozofia și întreaga civilizație românească. Înțelegerea lor ne permite să apreciem specificul cultural românesc și să dezvoltăm o cultură autentică, nu imitativă.""",
                "themes": ["stilistic", "cultură", "tradiție", "autenticitate", "identitate"]
            },
            "Religia cosmică": {
                "content": """Pentru Blaga, religia cosmică reprezintă o formă superioară de spiritualitate care transcende religiile instituite, conectând individul direct cu forțele cosmice creatoare. Această religie nu se bazează pe dogme fixe, ci pe experiența directă a sacrului în natură și cosmos.

Românii, prin matricea lor stilistică specifică, sunt predispuși către această formă de religio naturalis, care se manifestă în folclor, în relația cu natura, în percepția ciclurilor naturale și în simțirea unei prezențe divine difuze în cosmos. Aceasta explică rezistența culturii românești la extremele radicale și preferința pentru sinteze armonioase.""",
                "themes": ["religie", "cosmic", "spiritual", "sacru", "natură"]
            },
            "Dorința de cunoaștere": {
                "content": """Blaga face distincția între curiozitatea superficială și dorința autentică de cunoaștere. Curiozitatea căută să posede informația ca pe un obiect, în timp ce dorința de cunoaștere urmărește să fie transformată de ceea ce cunoaște. 

Cultura românească, prin matricea sa stilistică, manifestă o dorință de cunoaștere care respectă misterul și caută înțelegerea organică, nu mecanică. Aceasta se reflectă în înțelepciunea populară, în poezia românească, în atitudinea față de natură și în modul specific de a aborda problemele existențiale.""",
                "themes": ["cunoaștere", "înțelepciune", "mister", "transformare", "cultură"]
            },
            "Înțelepciunea populară": {
                "content": """Înțelepciunea populară românească, cristalizată în proverbe, zicători și obiceiuri, reflectă matricea stilistică națională și oferă principii de viață autentice. "Cu răbdarea și cu trustul, omul trece și prin grâu", "Cine se scoală de dimineață, departe ajunge", "Bună ziua cu de-ale tale" - aceste expresii nu sunt simple formule, ci încarnări ale unei filozofii practice.

Această înțelepciune populară predică echilibrul, măsura, respectul pentru natură și timp, solidaritatea comunitară și acceptarea cu demnitate a destinului. Ea constituie un tezaur filozofic care merită păstrat și dezvoltat în contextul cultural modern.""",
                "themes": ["popular", "înțelepciune", "proverbe", "filozofie_practică", "comunitate"]
            },
            "Principiul complementaritătii": {
                "content": """Un principiu fundamental în filozofia românească este complementaritatea contrastelor. În loc să fie văzute ca opoziții absolutes, contrastele sunt percepute ca aspecte complementare ale unei unități superioare. Ziua și noaptea, bucuria și tristețea, tăcerea și cuvântul, solitudinea și comunitatea - toate își găsesc locul într-o viziune holistica.

Acest principiu se reflectă în arta românească, în muzica populară (care îmbină melancolica cu veselia), în arhitectura tradițională (care armonizează cu peisajul), și în mentalitatea colectivă care evită extremele și caută punctul de echilibru.""",
                "themes": ["complementaritate", "echilibru", "armonie", "unitate", "holistic"]
            },
            "Temporalitatea românească": {
                "content": """Percepția timpului în cultura românească nu urmează modelul occidental linear-progresiv, ci un model ciclic-organic, inspirat de ritmurile naturale. Timpul nu este perceput ca un inamic de învins, ci ca un aliat cu care să trăiești în armonie.

Această percepție temporală se manifestă în răbdarea specifică românului, în respectul pentru rituile ancestrale, în celebrarea sezoanelor, și în conceptul de "la vremea lui" - care nu înseamnă întârziere, ci alegerea momentului potrivit. Este o filozofie a timului care privilegiază calitatea asupra cantității, profunzimea asupra vitezei.""",
                "themes": ["timp", "ciclic", "natural", "răbdare", "ritual"]
            }
        }
        
        for concept, info in blaga_content.items():
            entry = DatasetEntry(
                content=info["content"],
                content_type="philosophical",
                source="romanian_philosophy",
                author="Lucian Blaga",
                title=f"Conceptul: {concept}",
                year=1940,
                quality_score=0.95,
                cultural_relevance=0.98,
                educational_value=0.9,
                tags=["filozofie", "blaga", "cultură", "identitate"] + info["themes"],
                metadata={
                    "philosopher": "Lucian Blaga",
                    "philosophical_school": "culturalism",
                    "concept": concept,
                    "themes": info["themes"],
                    "complexity": "high"
                }
            )
            philosophical_entries.append(entry)
        
        # Folk wisdom entries
        for wisdom in self.folk_wisdom:
            content = f"""Proverb românesc: "{wisdom['proverb']}"

Înțeles: {wisdom['meaning']}

Acest proverb exprimă înțelepciunea populară românească și reflectă valorile fundamentale ale culturii noastre. Prin simplitatea expresiei și profunzimea înțelesului, proverbele românești transmit lecții de viață importante, formate prin experiența seculară a poporului."""
            
            entry = DatasetEntry(
                content=content,
                content_type="philosophical",
                source="folk_wisdom",
                author="Înțelepciunea populară",
                title=f"Proverb: {wisdom['proverb']}",
                year=None,
                quality_score=0.8,
                cultural_relevance=0.95,
                educational_value=0.85,
                tags=["proverbe", "înțelepciune", "tradițional"] + wisdom["themes"],
                metadata={
                    "wisdom_type": "proverb",
                    "cultural_importance": 0.9,
                    "themes": wisdom["themes"],
                    "transmission": "oral",
                    "universality": 0.7
                }
            )
            philosophical_entries.append(entry)
        
        logger.info(f"✅ Collected {len(philosophical_entries)} philosophical content samples")
        return philosophical_entries

class TechnicalKnowledgeGenerator:
    """Generate technical content with Romanian context"""
    
    def __init__(self):
        self.technical_domains = {
            "programming": {
                "romanian_concepts": ["programare românească", "documentație în română", "variabile cu diacritice"],
                "examples": ["algoritmii românești", "structuri de date", "paradigme de programare"]
            },
            "mathematics": {
                "romanian_concepts": ["matematica românească", "școala românească de matematică"],
                "examples": ["teoria numerelor", "analiza matematică", "geometria diferențială"]
            },
            "engineering": {
                "romanian_concepts": ["ingineria românească", "școala politehnică"],
                "examples": ["construcții", "electronică", "automatizări"]
            }
        }
        
        logger.info("✅ Technical knowledge generator initialized")
    
    async def generate_technical_content(self) -> List[DatasetEntry]:
        """Generate technical content with Romanian cultural context"""
        technical_entries = []
        
        # Programming with Romanian context
        programming_content = {
            "Programarea cu Conștiință Culturală": {
                "content": """Programarea cu conștiință culturală reprezintă abordarea prin care dezvoltatorii software români integrează elementele culturale nationale în soluțiile tehnologice. Aceasta include:

1. Folosirea comentariilor în limba română pentru claritatea codului
2. Implementarea algoritmilor care respectă specificul cultural român
3. Dezvoltarea interfețelor utilizator culturalmente relevante
4. Integrarea tradițiilor și valorilor românești în aplicații

Exemplu de cod cu conștiință culturală:
```python
def calculeaza_vechime_traditie(an_aparitie, an_curent=2025):
    '''
    Calculează vechimea unei tradiții românești
    '''
    vechime = an_curent - an_aparitie
    if vechime > 500:
        return f"Tradiție ancestrală ({vechime} ani)"
    elif vechime > 100:
        return f"Tradiție consolidată ({vechime} ani)"
    else:
        return f"Tradiție modernă ({vechime} ani)"
```

Această abordare asigură că tehnologia servește nu doar eficiența, ci și păstrarea și promovarea identității culturale românești.""",
                "themes": ["programare", "cultură", "identitate", "tehnologie", "română"]
            },
            "Algoritmi Inspirați din Folclorul Românesc": {
                "content": """Folclorul românesc oferă modele valoroase pentru designul algoritmilor. De exemplu, structura circulară a horei poate inspira algoritmi de rețele circulare, iar principiul "ajutorului la nevoie" din tradițiile rurale poate fi implementat în algoritmi de distribuție a resurselor.

Exemplu - Algoritmul Hora pentru distribuția task-urilor:
```python
class AlgoritmulHora:
    def distribu_taskuri(self, taskuri, lucrători):
        # Distribuie task-urile în mod circular, ca în hora
        for i, task in enumerate(taskuri):
            lucrător = lucrători[i % len(lucrători)]
            lucrător.primește_task(task)
            # Principiul solidarității - ajută vecinii
            if task.dificultate > lucrător.capacitate * 0.8:
                lucrător.cere_ajutor(lucrători)
```

Aceste abordări creează algoritmi mai umani și mai adaptați culturii collaborative românești.""",
                "themes": ["algoritmi", "folclor", "distribuție", "solidaritate", "creativitate"]
            },
            "Arhitectura Software cu Principii Românești": {
                "content": """Arhitectura software poate beneficia de principiile culturale românești precum echilibrul, complementaritatea și organicitatea. În loc de structuri rigide, putem construi sisteme care se adaptează natural la schimbări, similar cu modul în care tradițiile românești evoluează păstrându-și esența.

Principii de arhitectură românească:
- Modularitatea organică (ca un sat românesc)
- Complementaritatea componentelor (ca în hora)
- Adaptabilitatea (ca limba română)
- Reziliența prin redundanță (ca în tradițiile orale)

```yaml
# Exemplu de arhitectură inspirată din satul românesc
arhitectură_sat_digital:
  centru_comunitar: # biserica/primăria
    role: coordinare_generală
    componente: [autentificare, autorizare, logging]
  
  case_familii: # serviciile de business
    - familia_utilizatori
    - familia_conținut  
    - familia_plăți
  
  grădini_comune: # resurse partajate
    - baza_de_date
    - cache_partajat
    - sistem_mesagerie
```""",
                "themes": ["arhitectură", "modularitate", "adaptabilitate", "organicitate", "village_pattern"]
            },
            "Securitatea Cibernetică cu Înțelepciune Tradițională": {
                "content": """Înțelepciunea tradițională românească oferă principii valoroase pentru securitatea cibernetică. "Să nu-ți spui toate gândurile", "Cine se aseamănă se adună", "Omul sfințește locul" - aceste principii pot fi traduse în strategii de securitate moderne.

Principii de securitate inspirate din înțelepciunea populară:
1. Principiul discreției: "Nu te lăuda cu avuția" → minimizarea expunerii informațiilor
2. Principiul comunității: "Vecinul apropiat mai bun ca fratele de departe" → trust networking
3. Principiul vigilenței: "Cine doarme, nu prinde pește" → monitoring continuu

```python
class SecuritateRomaneasca:
    def evalueaza_incredere(self, entitate):
        # "Prietenul la nevoie se cunoaște"
        istoric_comportament = self.istoricul_entitatii(entitate)
        recomandari_comunitate = self.cere_pareri_comunitate(entitate)
        
        if istoric_comportament.este_consistent() and recomandari_comunitate.sunt_pozitive():
            return NivelIncredere.RIDICAT
        return NivelIncredere.PRECAUT
```""",
                "themes": ["securitate", "înțelepciune", "trust", "vigilență", "comunitate"]
            },
            "Inteligența Artificială cu Suflet Românesc": {
                "content": """Dezvoltarea AI cu suflet românesc înseamnă integrarea valorilor umaniste, a respectului pentru diversitate și a principiilor etice românești în sistemele de inteligență artificială. Nu doar să fie eficiente, ci să fie și empatice și culturally aware.

Caracteristici ale AI românesc:
- Empatie și înțelegere culturală
- Respect pentru tradițiile și valorile locale
- Abordare holistică, nu doar tehnică
- Integrarea înțelepciunii populare în decizii
- Adaptabilitate la context cultural

```python
class AIRomanesc:
    def ia_decizie(self, context, opțiuni):
        # Analiza tehnică
        soluție_tehnică = self.analiză_algoritmi(opțiuni)
        
        # Evaluarea culturală
        impact_cultural = self.evalueaza_impact_cultural(soluție_tehnică, context)
        
        # Aplicarea înțelepciunii populare
        verificare_traditională = self.consulta_intelepciune_populara(soluție_tehnică)
        
        # Decizia finală consideră toate aspectele
        return self.sinteza_holistica([soluție_tehnică, impact_cultural, verificare_traditională])
```""",
                "themes": ["AI", "empatie", "cultură", "etică", "holistic"]
            },
            "Metodologii Agile cu Spiritul Românesc": {
                "content": """Metodologiile agile pot fi îmbogățite cu valorile românești ale colaborării, răbdării și perfecționării continue. În loc de sprint-uri rigide, putem adopta "cicluri de lucru românești" care respectă ritmurile naturale și importanța relațiilor umane.

Principii agile românești:
- "Săgeata nu se oprește în zbor" → continuous delivery adaptiv
- "Picătura sapă piatra" → improvement incremental constant
- "Multe mâini fac munca ușoară" → true collaborative development
- "Răbdarea este mama înțelepciunii" → sustainable development pace

```python
class ScrumRomanesc:
    def planifica_sprint(self, backlog, echipa):
        # Consideră capacitatea umană, nu doar tehnică
        capacitate_umana = self.evalueaza_energie_echipa(echipa)
        
        # Integrat principiile românești
        if self.este_perioada_sarbatori():
            capacitate_umana *= 0.7  # respect pentru tradiții
            
        # "Nu pune carul înaintea cailor"
        prioritizare = self.ordoneaza_dupa_intelepciune(backlog)
        
        return self.creeaza_sprint_echilibrat(prioritizare, capacitate_umana)
```""",
                "themes": ["agile", "colaborare", "echilibru", "sustenabilitate", "respect"]
            }
        }
        
        for concept, info in programming_content.items():
            entry = DatasetEntry(
                content=info["content"],
                content_type="technical",
                source="romanian_programming",
                author="Comunitatea dezvoltatorilor români",
                title=concept,
                year=2025,
                quality_score=0.85,
                cultural_relevance=0.9,
                educational_value=0.85,
                tags=["programare", "tehnologie", "cultură"] + info["themes"],
                metadata={
                    "technical_domain": "programming",
                    "cultural_integration": True,
                    "practical_application": True,
                    "themes": info["themes"]
                }
            )
            technical_entries.append(entry)
        
        logger.info(f"✅ Generated {len(technical_entries)} technical content samples")
        return technical_entries

class DatasetQualityValidator:
    """Validate and score dataset quality"""
    
    def __init__(self):
        self.quality_criteria = {
            "content_length": {"min": 100, "optimal": 500, "max": 2000},
            "cultural_keywords": ["român", "tradițional", "cultură", "valori", "identitate"],
            "language_quality": ["diacritice", "gramatică", "vocabular"],
            "educational_value": ["informativ", "explicativ", "educativ"]
        }
        
        logger.info("✅ Dataset quality validator initialized")
    
    def validate_entry(self, entry: DatasetEntry) -> Tuple[bool, List[str]]:
        """Validate single dataset entry"""
        is_valid = True
        validation_notes = []
        
        # Content length check
        content_length = len(entry.content)
        if content_length < self.quality_criteria["content_length"]["min"]:
            is_valid = False
            validation_notes.append(f"Content too short: {content_length} characters")
        elif content_length > self.quality_criteria["content_length"]["max"]:
            validation_notes.append(f"Content very long: {content_length} characters")
        
        # Cultural relevance check
        cultural_keywords_found = sum(1 for keyword in self.quality_criteria["cultural_keywords"] 
                                    if keyword.lower() in entry.content.lower())
        if cultural_keywords_found == 0:
            validation_notes.append("No cultural keywords found")
            entry.cultural_relevance *= 0.8
        
        # Romanian diacritics check
        diacritics = ["ă", "â", "î", "ș", "ț"]
        has_diacritics = any(char in entry.content for char in diacritics)
        if not has_diacritics and entry.language == "ro":
            validation_notes.append("Missing Romanian diacritics")
        
        # Quality score calculation
        base_score = 0.7
        length_bonus = min(0.2, content_length / self.quality_criteria["content_length"]["optimal"] * 0.2)
        cultural_bonus = cultural_keywords_found * 0.02
        diacritics_bonus = 0.05 if has_diacritics else 0.0
        
        entry.quality_score = min(1.0, base_score + length_bonus + cultural_bonus + diacritics_bonus)
        
        return is_valid, validation_notes
    
    def calculate_collection_stats(self, collection: DatasetCollection) -> Dict[str, Any]:
        """Calculate statistics for entire collection"""
        if not collection.entries:
            return {"error": "Empty collection"}
        
        stats = {
            "total_entries": len(collection.entries),
            "average_quality": sum(e.quality_score for e in collection.entries) / len(collection.entries),
            "average_cultural_relevance": sum(e.cultural_relevance for e in collection.entries) / len(collection.entries),
            "content_types": defaultdict(int),
            "total_characters": sum(len(e.content) for e in collection.entries),
            "language_distribution": defaultdict(int),
            "quality_distribution": {
                "high": 0,  # > 0.8
                "medium": 0,  # 0.6-0.8
                "low": 0   # < 0.6
            }
        }
        
        for entry in collection.entries:
            stats["content_types"][entry.content_type] += 1
            stats["language_distribution"][entry.language] += 1
            
            if entry.quality_score > 0.8:
                stats["quality_distribution"]["high"] += 1
            elif entry.quality_score > 0.6:
                stats["quality_distribution"]["medium"] += 1
            else:
                stats["quality_distribution"]["low"] += 1
        
        return stats

class TrainingDatasetBuilder:
    """Main training dataset builder for RomAI"""
    
    def __init__(self, database_path: str = "romai_training_dataset.db",
                 dataset_dir: Path = Path("datasets")):
        self.database_path = database_path
        self.dataset_dir = Path(dataset_dir)
        self.dataset_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize collectors
        self.literature_collector = RomanianLiteratureCollector()
        self.cultural_collector = RomanianCulturalDataCollector()
        self.philosophical_collector = PhilosophicalContentCollector()
        self.technical_generator = TechnicalKnowledgeGenerator()
        self.quality_validator = DatasetQualityValidator()
        
        # Collections
        self.collections: Dict[str, DatasetCollection] = {}
        
        # Initialize storage
        self._initialize_storage()
        
        logger.info("🗄️ RomAI Training Dataset Builder initialized")
    
    def _initialize_storage(self):
        """Initialize SQLite storage for dataset"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS dataset_entries (
                entry_id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                content_type TEXT,
                source TEXT,
                author TEXT,
                title TEXT,
                year INTEGER,
                language TEXT DEFAULT 'ro',
                quality_score REAL,
                cultural_relevance REAL,
                educational_value REAL,
                tags TEXT,
                metadata TEXT,
                collection_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS dataset_collections (
                collection_id TEXT PRIMARY KEY,
                name TEXT,
                description TEXT,
                category TEXT,
                total_size INTEGER,
                quality_stats TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS dataset_metadata (
                id TEXT PRIMARY KEY,
                dataset_version TEXT,
                total_entries INTEGER,
                total_collections INTEGER,
                creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                statistics TEXT
            )
        """)
        
        conn.commit()
        conn.close()
        logger.info("✅ Dataset storage initialized")
    
    async def build_comprehensive_dataset(self) -> Dict[str, DatasetCollection]:
        """Build comprehensive training dataset"""
        logger.info("🏗️ Building comprehensive RomAI training dataset...")
        
        # Collect literature content
        logger.info("📚 Collecting Romanian literature...")
        literature_entries = await self.literature_collector.collect_classic_literature_samples()
        folklore_entries = await self.literature_collector.collect_folklore_samples()
        
        literature_collection = DatasetCollection(
            name="Romanian Literature & Folklore",
            description="Classic Romanian literature and traditional folklore",
            category="literature",
            entries=literature_entries + folklore_entries
        )
        
        # Collect cultural content
        logger.info("🎭 Collecting Romanian cultural traditions...")
        cultural_entries = await self.cultural_collector.collect_cultural_traditions()
        regional_entries = await self.cultural_collector.collect_regional_specifics()
        
        cultural_collection = DatasetCollection(
            name="Romanian Cultural Heritage",
            description="Traditional customs, values, and regional specifics",
            category="culture",
            entries=cultural_entries + regional_entries
        )
        
        # Collect philosophical content
        logger.info("🤔 Collecting Romanian philosophical wisdom...")
        philosophical_entries = await self.philosophical_collector.collect_philosophical_content()
        
        philosophical_collection = DatasetCollection(
            name="Romanian Philosophy & Wisdom",
            description="Philosophical thoughts and folk wisdom",
            category="philosophy",
            entries=philosophical_entries
        )
        
        # Generate technical content
        logger.info("⚙️ Generating technical content...")
        technical_entries = await self.technical_generator.generate_technical_content()
        
        technical_collection = DatasetCollection(
            name="Technical Knowledge with Romanian Context",
            description="Technical content with Romanian cultural integration",
            category="technical",
            entries=technical_entries
        )
        
        # Validate all collections
        collections = {
            "literature": literature_collection,
            "culture": cultural_collection,
            "philosophy": philosophical_collection,
            "technical": technical_collection
        }
        
        logger.info("✅ Validating dataset quality...")
        for collection_name, collection in collections.items():
            await self._validate_collection(collection)
        
        # Store collections
        for collection_name, collection in collections.items():
            await self._store_collection(collection)
            self.collections[collection_name] = collection
        
        # Generate dataset statistics
        await self._update_dataset_metadata()
        
        logger.info("🎉 Comprehensive training dataset built successfully!")
        return collections
    
    async def _validate_collection(self, collection: DatasetCollection):
        """Validate entire collection"""
        valid_entries = []
        validation_summary = {"valid": 0, "invalid": 0, "warnings": 0}
        
        for entry in collection.entries:
            is_valid, notes = self.quality_validator.validate_entry(entry)
            if is_valid:
                valid_entries.append(entry)
                validation_summary["valid"] += 1
            else:
                validation_summary["invalid"] += 1
            
            if notes:
                validation_summary["warnings"] += len(notes)
                entry.processing_notes.extend(notes)
        
        collection.entries = valid_entries
        collection.total_size = len(valid_entries)
        collection.quality_stats = self.quality_validator.calculate_collection_stats(collection)
        collection.last_updated = datetime.now()
        
        logger.info(f"   {collection.name}: {validation_summary['valid']} valid, {validation_summary['invalid']} invalid entries")
    
    async def _store_collection(self, collection: DatasetCollection):
        """Store collection in database"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        # Store collection metadata
        cursor.execute("""
            INSERT OR REPLACE INTO dataset_collections
            (collection_id, name, description, category, total_size, quality_stats, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (
            collection.collection_id,
            collection.name,
            collection.description,
            collection.category,
            collection.total_size,
            json.dumps(collection.quality_stats)
        ))
        
        # Store individual entries
        for entry in collection.entries:
            cursor.execute("""
                INSERT OR REPLACE INTO dataset_entries
                (entry_id, content, content_type, source, author, title, year, language,
                 quality_score, cultural_relevance, educational_value, tags, metadata, collection_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                entry.entry_id,
                entry.content,
                entry.content_type,
                entry.source,
                entry.author,
                entry.title,
                entry.year,
                entry.language,
                entry.quality_score,
                entry.cultural_relevance,
                entry.educational_value,
                json.dumps(entry.tags),
                json.dumps(entry.metadata),
                collection.collection_id
            ))
        
        conn.commit()
        conn.close()
    
    async def _update_dataset_metadata(self):
        """Update overall dataset metadata"""
        total_entries = sum(len(collection.entries) for collection in self.collections.values())
        total_collections = len(self.collections)
        
        statistics = {
            "collections": {name: {
                "entries": len(collection.entries),
                "average_quality": collection.quality_stats.get("average_quality", 0.0),
                "cultural_relevance": collection.quality_stats.get("average_cultural_relevance", 0.0)
            } for name, collection in self.collections.items()},
            "overall": {
                "total_entries": total_entries,
                "total_collections": total_collections,
                "average_quality": sum(collection.quality_stats.get("average_quality", 0.0) 
                                    for collection in self.collections.values()) / max(1, len(self.collections))
            }
        }
        
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO dataset_metadata
            (id, dataset_version, total_entries, total_collections, statistics, last_updated)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (
            "main_dataset",
            "1.0.0",
            total_entries,
            total_collections,
            json.dumps(statistics)
        ))
        
        conn.commit()
        conn.close()
    
    async def export_dataset_for_training(self, output_format: str = "jsonl") -> Path:
        """Export dataset in format suitable for training"""
        if output_format == "jsonl":
            output_file = self.dataset_dir / "romai_training_dataset.jsonl"
            
            with open(output_file, 'w', encoding='utf-8') as f:
                for collection in self.collections.values():
                    for entry in collection.entries:
                        training_example = {
                            "text": entry.content,
                            "metadata": {
                                "content_type": entry.content_type,
                                "cultural_relevance": entry.cultural_relevance,
                                "quality_score": entry.quality_score,
                                "tags": entry.tags,
                                "author": entry.author,
                                "title": entry.title,
                                "source": entry.source
                            }
                        }
                        f.write(json.dumps(training_example, ensure_ascii=False) + '\n')
        
        logger.info(f"📦 Dataset exported to {output_file}")
        return output_file
    
    async def get_dataset_insights(self) -> Dict[str, Any]:
        """Get comprehensive dataset insights"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        # Basic statistics
        cursor.execute("SELECT COUNT(*) FROM dataset_entries")
        total_entries = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM dataset_collections")
        total_collections = cursor.fetchone()[0]
        
        cursor.execute("SELECT AVG(quality_score) FROM dataset_entries")
        avg_quality = cursor.fetchone()[0] or 0.0
        
        cursor.execute("SELECT AVG(cultural_relevance) FROM dataset_entries")
        avg_cultural_relevance = cursor.fetchone()[0] or 0.0
        
        # Content type distribution
        cursor.execute("SELECT content_type, COUNT(*) FROM dataset_entries GROUP BY content_type")
        content_type_dist = dict(cursor.fetchall())
        
        # Language distribution
        cursor.execute("SELECT language, COUNT(*) FROM dataset_entries GROUP BY language")
        language_dist = dict(cursor.fetchall())
        
        # Quality distribution
        cursor.execute("""
            SELECT 
                CASE 
                    WHEN quality_score > 0.8 THEN 'high'
                    WHEN quality_score > 0.6 THEN 'medium'
                    ELSE 'low'
                END as quality_range,
                COUNT(*) 
            FROM dataset_entries 
            GROUP BY quality_range
        """)
        quality_dist = dict(cursor.fetchall())
        
        conn.close()
        
        insights = {
            "dataset_summary": {
                "total_entries": total_entries,
                "total_collections": total_collections,
                "average_quality_score": avg_quality,
                "average_cultural_relevance": avg_cultural_relevance
            },
            "content_distribution": content_type_dist,
            "language_distribution": language_dist,
            "quality_distribution": quality_dist,
            "collections_overview": {name: {
                "entries": len(collection.entries),
                "category": collection.category,
                "average_quality": collection.quality_stats.get("average_quality", 0.0)
            } for name, collection in self.collections.items()}
        }
        
        return insights
    
    async def demonstrate_dataset_building(self):
        """Demonstrate dataset building capabilities"""
        logger.info("🗄️ ROMAI TRAINING DATASET BUILDING DEMONSTRATION")
        logger.info("=" * 60)
        
        # Build comprehensive dataset
        collections = await self.build_comprehensive_dataset()
        
        logger.info("\n📊 Dataset Building Results:")
        for name, collection in collections.items():
            logger.info(f"   {collection.name}:")
            logger.info(f"     Entries: {len(collection.entries)}")
            logger.info(f"     Category: {collection.category}")
            logger.info(f"     Avg Quality: {collection.quality_stats.get('average_quality', 0.0):.2f}")
            logger.info(f"     Cultural Relevance: {collection.quality_stats.get('average_cultural_relevance', 0.0):.2f}")
        
        # Export dataset
        output_file = await self.export_dataset_for_training()
        logger.info(f"\n📦 Dataset exported to: {output_file}")
        
        # Get comprehensive insights
        insights = await self.get_dataset_insights()
        logger.info("\n🔍 Dataset Insights:")
        logger.info(f"   Total entries: {insights['dataset_summary']['total_entries']}")
        logger.info(f"   Total collections: {insights['dataset_summary']['total_collections']}")
        logger.info(f"   Average quality: {insights['dataset_summary']['average_quality_score']:.2f}")
        logger.info(f"   Average cultural relevance: {insights['dataset_summary']['average_cultural_relevance']:.2f}")
        
        logger.info("\n📋 Content Type Distribution:")
        for content_type, count in insights['content_distribution'].items():
            logger.info(f"   {content_type}: {count} entries")
        
        logger.info("\n🏆 Quality Distribution:")
        for quality_range, count in insights['quality_distribution'].items():
            logger.info(f"   {quality_range}: {count} entries")
        
        # Sample entries from each collection
        logger.info("\n📖 Sample Entries:")
        for name, collection in collections.items():
            if collection.entries:
                sample_entry = collection.entries[0]
                logger.info(f"\n   Sample from {collection.name}:")
                logger.info(f"     Title: {sample_entry.title}")
                logger.info(f"     Author: {sample_entry.author}")
                logger.info(f"     Content preview: {sample_entry.content[:100]}...")
                logger.info(f"     Quality Score: {sample_entry.quality_score:.2f}")
                logger.info(f"     Tags: {sample_entry.tags[:3]}...")
        
        logger.info("\n✅ Training dataset building demonstration completed successfully!")

async def main():
    """Main execution for dataset building"""
    dataset_builder = TrainingDatasetBuilder()
    await dataset_builder.demonstrate_dataset_building()

if __name__ == "__main__":
    asyncio.run(main())