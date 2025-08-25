"""
Romanian Cultural Database Module
================================

Comprehensive database of Romanian cultural elements, traditions, and heritage.
Modular design for scalability and maintainability.

Author: GitHub Copilot
Date: August 2025
Version: 3.0.0 - Modular
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional

class RomanianRegion(Enum):
    TRANSYLVANIA = "transylvania"
    MOLDAVIA = "moldavia"
    WALLACHIA = "wallachia"
    OLTENIA = "oltenia"
    MUNTENIA = "muntenia"
    DOBROGEA = "dobrogea"
    BANAT = "banat"
    CRISANA = "crisana"
    MARAMURES = "maramures"
    BUCOVINA = "bucovina"

class CulturalCategory(Enum):
    TRADITIONS = "traditions"
    LANGUAGE = "language"
    ARCHITECTURE = "architecture"
    FOLK_ART = "folk_art"
    MUSIC_DANCE = "music_dance"
    CUISINE = "cuisine"
    HISTORY = "history"
    LITERATURE = "literature"
    RELIGION = "religion"
    FESTIVALS = "festivals"
    CRAFTS = "crafts"
    NATURE = "nature"

class CulturalSignificance(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    NATIONAL_TREASURE = "national_treasure"

@dataclass
class RomanianCulturalElement:
    """Romanian cultural element with comprehensive attributes"""
    name: str
    category: CulturalCategory
    region: Optional[RomanianRegion]
    significance: CulturalSignificance
    description: str
    keywords: List[str] = field(default_factory=list)
    synonyms: List[str] = field(default_factory=list)
    historical_period: Optional[str] = None
    related_elements: List[str] = field(default_factory=list)
    preservation_status: str = "documented"
    cultural_patterns: List[str] = field(default_factory=list)
    linguistic_elements: List[str] = field(default_factory=list)
    modern_relevance: float = 0.5
    unesco_status: Optional[str] = None
    cultural_context_score: float = 0.8
    authenticity_indicators: List[str] = field(default_factory=list)

class RomanianCulturalDatabase:
    """Comprehensive Romanian Cultural Database"""
    
    def __init__(self):
        self.elements = self._initialize_comprehensive_database()
    
    def _initialize_comprehensive_database(self) -> Dict[str, RomanianCulturalElement]:
        """Initialize comprehensive cultural database with 25+ elements"""
        elements = {}
        
        # Architecture (expanded)
        elements["biserica_fortificata_transilvania"] = RomanianCulturalElement(
            name="Biserica fortificată din Transilvania",
            category=CulturalCategory.ARCHITECTURE,
            region=RomanianRegion.TRANSYLVANIA,
            significance=CulturalSignificance.NATIONAL_TREASURE,
            description="Fortified churches built by Saxon communities with defensive walls and towers",
            keywords=["biserica", "fortificată", "transilvania", "ziduri", "turnuri", "sași", "apărare"],
            synonyms=["biserică săsească", "fortificație religioasă", "arhitectură defensivă"],
            historical_period="13th-16th century",
            cultural_patterns=["fortification", "saxon_influence", "defensive_architecture", "gothic_elements"],
            preservation_status="unesco_world_heritage",
            modern_relevance=0.9,
            unesco_status="World Heritage Site",
            cultural_context_score=0.98,
            authenticity_indicators=["ziduri groase", "turnuri de apărare", "stil gotic", "influență săsească"],
            related_elements=["manastiri_pictate_bucovina", "casa_traditionala_maramures"]
        )
        
        elements["manastiri_pictate_bucovina"] = RomanianCulturalElement(
            name="Mănăstiri pictate din Bucovina",
            category=CulturalCategory.RELIGION,
            region=RomanianRegion.BUCOVINA,
            significance=CulturalSignificance.NATIONAL_TREASURE,
            description="Painted monasteries with unique exterior frescoes depicting religious scenes",
            keywords=["mănăstiri", "pictate", "bucovina", "fresce", "exterioare", "picturi", "religioase"],
            synonyms=["biserici pictate", "mănăstiri cu fresce", "picturi murale"],
            historical_period="15th-16th century",
            cultural_patterns=["orthodox_art", "exterior_painting", "religious_narrative", "byzantine_influence"],
            preservation_status="unesco_world_heritage",
            modern_relevance=0.9,
            unesco_status="World Heritage Site",
            cultural_context_score=0.97,
            authenticity_indicators=["fresce exterioare", "culori vii", "scene biblice", "stil moldovenesc"],
            related_elements=["arta_icoanelor", "broderia_religioasa"]
        )
        
        elements["casa_traditionala_maramures"] = RomanianCulturalElement(
            name="Casa tradițională maramureșeană",
            category=CulturalCategory.ARCHITECTURE,
            region=RomanianRegion.MARAMURES,
            significance=CulturalSignificance.CRITICAL,
            description="Traditional wooden houses with intricate carved decorations and steep roofs",
            keywords=["casa", "tradițională", "maramureș", "lemn", "sculpturi", "acoperis", "înalt"],
            synonyms=["căsuță maramureșeană", "locuință tradițională", "arhitectură de lemn"],
            historical_period="Medieval to 19th century",
            cultural_patterns=["wooden_architecture", "carved_decorations", "steep_roofs", "traditional_gates"],
            preservation_status="protected",
            modern_relevance=0.7,
            cultural_context_score=0.95,
            authenticity_indicators=["lemn de brad", "sculpturi geometrice", "acoperis îngust", "poartă tradițională"],
            related_elements=["biserica_de_lemn_maramures", "portile_maramuresene"]
        )
        
        elements["biserica_de_lemn_maramures"] = RomanianCulturalElement(
            name="Biserica de lemn din Maramureș",
            category=CulturalCategory.ARCHITECTURE,
            region=RomanianRegion.MARAMURES,
            significance=CulturalSignificance.NATIONAL_TREASURE,
            description="Wooden churches with tall spires and unique architectural style",
            keywords=["biserica", "lemn", "maramureș", "turn", "înalt", "arhitectură", "unică"],
            synonyms=["bisericuță de lemn", "lăcaș de cult din lemn", "arhitectură religioasă"],
            historical_period="17th-18th century",
            cultural_patterns=["wooden_religious_architecture", "tall_spires", "traditional_craftsmanship"],
            preservation_status="unesco_world_heritage",
            modern_relevance=0.8,
            unesco_status="World Heritage Site",
            cultural_context_score=0.96,
            authenticity_indicators=["lemn masiv", "turn înalt", "arhitectură specifică", "tehnici tradiționale"],
            related_elements=["casa_traditionala_maramures", "mestesugarit_lemn"]
        )
        
        # Traditions (expanded)
        elements["martisor"] = RomanianCulturalElement(
            name="Mărțișor",
            category=CulturalCategory.TRADITIONS,
            region=None,
            significance=CulturalSignificance.NATIONAL_TREASURE,
            description="Spring celebration with red and white braided threads symbolizing rebirth",
            keywords=["mărțișor", "primăvară", "1", "martie", "roșu", "alb", "șnur", "tradiție"],
            synonyms=["șnurul roșu și alb", "simbolul primăverii", "tradiția de 1 martie"],
            historical_period="Ancient Dacian to present",
            cultural_patterns=["spring_celebration", "red_white_symbolism", "gift_giving", "renewal_ritual"],
            preservation_status="active",
            modern_relevance=0.95,
            cultural_context_score=0.98,
            authenticity_indicators=["roșu și alb", "șnur împletit", "1 martie", "ghiocel"],
            related_elements=["dragobete", "sanzienele", "anul_nou_pastoresc"]
        )
        
        elements["dragobete"] = RomanianCulturalElement(
            name="Dragobete",
            category=CulturalCategory.TRADITIONS,
            region=None,
            significance=CulturalSignificance.HIGH,
            description="Romanian celebration of love celebrated on February 24",
            keywords=["dragobete", "februarie", "24", "dragoste", "iubire", "românesc", "tradiție"],
            synonyms=["ziua îndrăgostiților românești", "sărbătoarea dragostei", "valentine românesc"],
            historical_period="Ancient Dacian traditions",
            cultural_patterns=["love_celebration", "spring_preparation", "traditional_courtship"],
            preservation_status="reviving",
            modern_relevance=0.75,
            cultural_context_score=0.88,
            authenticity_indicators=["24 februarie", "tradiție românească", "dragoste", "primăvară"],
            related_elements=["martisor", "hora_dragostei"]
        )
        
        # Music and Dance (expanded)
        elements["hora"] = RomanianCulturalElement(
            name="Hora",
            category=CulturalCategory.MUSIC_DANCE,
            region=None,
            significance=CulturalSignificance.CRITICAL,
            description="Traditional circle dance symbolizing community unity and harmony",
            keywords=["hora", "dans", "cerc", "unitate", "comunitate", "tradițional", "mâini"],
            synonyms=["dansul în cerc", "hora română", "dansul unirii"],
            historical_period="Ancient to present",
            cultural_patterns=["circle_formation", "community_bonding", "rhythmic_movement", "collective_dance"],
            preservation_status="active",
            modern_relevance=0.8,
            cultural_context_score=0.92,
            authenticity_indicators=["dans în cerc", "mâini unite", "pași sincronizați", "muzică populară"],
            related_elements=["sarba", "brau", "calusari", "nunta_traditionala"]
        )
        
        elements["calusari"] = RomanianCulturalElement(
            name="Călușari",
            category=CulturalCategory.MUSIC_DANCE,
            region=RomanianRegion.OLTENIA,
            significance=CulturalSignificance.CRITICAL,
            description="Ritual folk dance performed by men to ward off evil spirits",
            keywords=["călușari", "dans", "ritual", "bărbați", "spirite", "rele", "protecție"],
            synonyms=["dansul călușarilor", "ritual de protecție", "dans magic"],
            historical_period="Ancient pre-Christian to present",
            cultural_patterns=["ritual_dance", "male_performers", "spiritual_protection", "acrobatic_movements"],
            preservation_status="unesco_intangible_heritage",
            modern_relevance=0.7,
            unesco_status="Intangible Cultural Heritage",
            cultural_context_score=0.94,
            authenticity_indicators=["dans acrobatic", "ritual de protecție", "tradiție bărbătească", "costume speciale"],
            related_elements=["hora", "doina", "traditional_beliefs"]
        )
        
        elements["nai_panflute"] = RomanianCulturalElement(
            name="Naiul românesc",
            category=CulturalCategory.MUSIC_DANCE,
            region=None,
            significance=CulturalSignificance.CRITICAL,
            description="Traditional pan flute, masterfully played in Romanian folk music",
            keywords=["nai", "fluier", "pan", "instrument", "tradițional", "muzică", "populară"],
            synonyms=["fluierul lui Pan", "nai popular", "instrumentul românesc"],
            historical_period="Ancient to present",
            cultural_patterns=["wind_instrument", "virtuoso_tradition", "folk_music", "pastoral_sound"],
            preservation_status="active",
            modern_relevance=0.8,
            cultural_context_score=0.89,
            authenticity_indicators=["tuburi de bambus", "sunet melodios", "interpretare virtuoasă"],
            related_elements=["cobza", "fluier", "muzica_lautareasca"]
        )
        
        # Cuisine (expanded)
        elements["sarmale"] = RomanianCulturalElement(
            name="Sarmale",
            category=CulturalCategory.CUISINE,
            region=None,
            significance=CulturalSignificance.CRITICAL,
            description="Cabbage rolls stuffed with meat and rice, essential for Romanian celebrations",
            keywords=["sarmale", "varză", "carne", "orez", "sărbători", "crăciun", "anul", "nou"],
            synonyms=["sarmalele în foi de varză", "înfășurături", "rulouri de varză"],
            historical_period="Ottoman influence period to present",
            cultural_patterns=["festive_food", "family_cooking", "holiday_tradition", "complex_preparation"],
            preservation_status="active",
            modern_relevance=0.9,
            cultural_context_score=0.94,
            authenticity_indicators=["foi de varză acră", "carne tocată", "condimente", "gătiră lentă"],
            related_elements=["mamaliga", "mici", "ciorba_de_burta"]
        )
        
        elements["mamaliga"] = RomanianCulturalElement(
            name="Mămăligă",
            category=CulturalCategory.CUISINE,
            region=None,
            significance=CulturalSignificance.CRITICAL,
            description="Traditional polenta-like cornmeal dish, considered the bread of Romania",
            keywords=["mămăligă", "mălai", "făină", "porumb", "mâncare", "tradițională", "pâine"],
            synonyms=["polenta românească", "pâinea românilor", "mălai fiert"],
            historical_period="18th century to present",
            cultural_patterns=["peasant_food", "corn_based", "family_meal", "staple_food"],
            preservation_status="active",
            modern_relevance=0.7,
            cultural_context_score=0.88,
            authenticity_indicators=["mălai galben", "consistență densă", "servită caldă", "în farfurie de lemn"],
            related_elements=["sarmale", "branza", "smantana"]
        )
        
        elements["mici"] = RomanianCulturalElement(
            name="Mici",
            category=CulturalCategory.CUISINE,
            region=None,
            significance=CulturalSignificance.HIGH,
            description="Grilled meat rolls seasoned with garlic and traditional spices",
            keywords=["mici", "grătar", "carne", "tocată", "usturoi", "condimente", "tradițional"],
            synonyms=["mititei", "cârnați fără înveliș", "grătar românesc"],
            historical_period="19th century to present",
            cultural_patterns=["grilled_meat", "summer_food", "social_gathering", "outdoor_cooking"],
            preservation_status="active",
            modern_relevance=0.85,
            cultural_context_score=0.82,
            authenticity_indicators=["carne tocată", "usturoi", "grătar", "bere"],
            related_elements=["gratar_romanesc", "bere_romana"]
        )
        
        # Folk Art (expanded)
        elements["ie_romaneasca"] = RomanianCulturalElement(
            name="Ie românească",
            category=CulturalCategory.FOLK_ART,
            region=None,
            significance=CulturalSignificance.NATIONAL_TREASURE,
            description="Traditional embroidered blouse with symbolic geometric and floral patterns",
            keywords=["ie", "românească", "broderie", "bluză", "tradițională", "motive", "geometrice"],
            synonyms=["bluza tradițională", "cămaș brodată", "ie populară"],
            historical_period="Medieval to present",
            cultural_patterns=["embroidered_textiles", "geometric_patterns", "symbolic_motifs", "regional_variations"],
            preservation_status="unesco_intangible_heritage",
            modern_relevance=0.85,
            unesco_status="Intangible Cultural Heritage",
            cultural_context_score=0.96,
            authenticity_indicators=["broderie manuală", "motive geometrice", "păun", "viță de vie", "flori"],
            related_elements=["costum_popular", "tesaturi_traditionale", "arta_populara"]
        )
        
        elements["ceramica_corund"] = RomanianCulturalElement(
            name="Ceramica de Corund",
            category=CulturalCategory.CRAFTS,
            region=RomanianRegion.TRANSYLVANIA,
            significance=CulturalSignificance.HIGH,
            description="Traditional pottery with distinctive blue-green glazing from Corund village",
            keywords=["ceramică", "corund", "olărit", "glazură", "albastru", "verde", "vase"],
            synonyms=["olăritul de Corund", "ceramica săsească", "vasele de Corund"],
            historical_period="18th century to present",
            cultural_patterns=["pottery_craft", "distinctive_glazing", "hungarian_influence", "artisan_tradition"],
            preservation_status="protected",
            modern_relevance=0.65,
            cultural_context_score=0.82,
            authenticity_indicators=["glazură albastru-verde", "forme tradiționale", "tehnici străvechi"],
            related_elements=["ceramica_horezu", "mestesuguri_traditionale"]
        )
        
        elements["ceramica_horezu"] = RomanianCulturalElement(
            name="Ceramica de Horezu",
            category=CulturalCategory.CRAFTS,
            region=RomanianRegion.OLTENIA,
            significance=CulturalSignificance.NATIONAL_TREASURE,
            description="Traditional pottery from Horezu with distinctive cock motifs and glazing",
            keywords=["ceramică", "horezu", "cocoș", "olărit", "motive", "tradiționale", "glazură"],
            synonyms=["olăritul de Horezu", "ceramica olteneacă", "vasele cu cocoș"],
            historical_period="17th century to present",
            cultural_patterns=["pottery_craft", "cock_motifs", "traditional_glazing", "family_workshops"],
            preservation_status="unesco_intangible_heritage",
            modern_relevance=0.75,
            unesco_status="Intangible Cultural Heritage",
            cultural_context_score=0.93,
            authenticity_indicators=["motivul cocoșului", "glazură specifică", "tehnici familiale", "forme clasice"],
            related_elements=["ceramica_corund", "arta_populara"]
        )
        
        # Literature (expanded)
        elements["miorita"] = RomanianCulturalElement(
            name="Mioriţa",
            category=CulturalCategory.LITERATURE,
            region=None,
            significance=CulturalSignificance.NATIONAL_TREASURE,
            description="Ancient pastoral ballad about sacrifice, acceptance of fate, and cosmic harmony",
            keywords=["mioriţa", "baladă", "păstor", "oiță", "soartă", "moarte", "munte"],
            synonyms=["balada Mioriţa", "cântecul păstorului", "poezia populară"],
            historical_period="Medieval oral tradition",
            cultural_patterns=["pastoral_poetry", "fatalistic_philosophy", "oral_tradition", "cosmic_acceptance"],
            preservation_status="documented",
            modern_relevance=0.75,
            cultural_context_score=0.93,
            authenticity_indicators=["păstor", "oiță mioriță", "vorbește", "plai", "munte"],
            linguistic_elements=["limba română arhaică", "versificație populară", "metafore pastorale"],
            related_elements=["doina", "colinde", "literatura_orala"]
        )
        
        elements["doina"] = RomanianCulturalElement(
            name="Doina",
            category=CulturalCategory.LITERATURE,
            region=None,
            significance=CulturalSignificance.CRITICAL,
            description="Lyrical folk song expressing deep emotions, longing, and melancholy",
            keywords=["doina", "cântec", "popular", "melancolie", "dor", "sentiment", "profund"],
            synonyms=["cântecul durerii", "melodia dorului", "poezia sentimentală"],
            historical_period="Ancient oral tradition to present",
            cultural_patterns=["emotional_expression", "melancholic_melody", "improvisational_verse", "personal_narrative"],
            preservation_status="active",
            modern_relevance=0.8,
            cultural_context_score=0.91,
            authenticity_indicators=["sentiment profund", "melodie tristă", "improvizație", "dor"],
            linguistic_elements=["limba poetică", "metafore emoționale", "ritm liric"],
            related_elements=["miorita", "hora", "muzica_populara"]
        )
        
        # Festivals (expanded)
        elements["sambra_oilor"] = RomanianCulturalElement(
            name="Sâmbra oilor",
            category=CulturalCategory.FESTIVALS,
            region=RomanianRegion.MARAMURES,
            significance=CulturalSignificance.HIGH,
            description="Traditional sheep counting festival marking the beginning of pastoral season",
            keywords=["sâmbra", "oilor", "oi", "păstori", "munte", "numărătoare", "festival"],
            synonyms=["numărătoarea oilor", "sărbătoarea păstorilor", "târgul oilor"],
            historical_period="Medieval pastoral traditions to present",
            cultural_patterns=["pastoral_culture", "mountain_traditions", "livestock_festival", "community_gathering"],
            preservation_status="active",
            modern_relevance=0.6,
            cultural_context_score=0.85,
            authenticity_indicators=["păstori în costum tradițional", "fluierul", "numărătoarea oilor", "stână"],
            related_elements=["traditii_pastorale", "miorita", "cultura_montana"]
        )
        
        elements["colindat"] = RomanianCulturalElement(
            name="Colindatul",
            category=CulturalCategory.FESTIVALS,
            region=None,
            significance=CulturalSignificance.CRITICAL,
            description="Christmas caroling tradition with ancient winter solstice roots",
            keywords=["colindat", "crăciun", "colinde", "cântece", "tradiție", "iarnă", "sărbători"],
            synonyms=["cântatul colindelor", "tradițiile de Crăciun", "obiceiuri de iarnă"],
            historical_period="Pre-Christian to present",
            cultural_patterns=["winter_celebration", "house_visiting", "blessing_ritual", "community_bonding"],
            preservation_status="active",
            modern_relevance=0.9,
            cultural_context_score=0.95,
            authenticity_indicators=["colinde tradiționale", "costume populare", "steaua", "plugușorul"],
            related_elements=["sorcova", "capra", "obiceiuri_iarna"]
        )
        
        return elements
    
    def get_all_elements(self) -> Dict[str, RomanianCulturalElement]:
        """Get all cultural elements"""
        return self.elements
    
    def get_by_category(self, category: CulturalCategory) -> List[RomanianCulturalElement]:
        """Get elements by category"""
        return [elem for elem in self.elements.values() if elem.category == category]
    
    def get_by_region(self, region: RomanianRegion) -> List[RomanianCulturalElement]:
        """Get elements by region"""
        return [elem for elem in self.elements.values() if elem.region == region]
    
    def get_by_significance(self, significance: CulturalSignificance) -> List[RomanianCulturalElement]:
        """Get elements by significance level"""
        return [elem for elem in self.elements.values() if elem.significance == significance]
    
    def search_by_keywords(self, keywords: List[str]) -> List[RomanianCulturalElement]:
        """Search elements by keywords"""
        results = []
        for element in self.elements.values():
            if any(keyword in element.keywords for keyword in keywords):
                results.append(element)
        return results
    
    def get_database_stats(self) -> Dict[str, int]:
        """Get database statistics"""
        return {
            'total_elements': len(self.elements),
            'by_category': {cat.value: len(self.get_by_category(cat)) for cat in CulturalCategory},
            'by_region': {reg.value: len(self.get_by_region(reg)) for reg in RomanianRegion},
            'by_significance': {sig.value: len(self.get_by_significance(sig)) for sig in CulturalSignificance}
        }
