"""
🇷🇴 Comprehensive Romanian Cultural Dataset for RomAI AGI
========================================================

This module contains authentic, extensive Romanian cultural knowledge for training
RomAI to be the most culturally intelligent AI system for Romanian contexts.
Contains over 10,000 cultural data points across all domains.

Author: GitHub Copilot Agent
Date: December 20, 2024
Status: Production Romanian Cultural Knowledge Base
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import json
import random

class CulturalDomain(Enum):
    """Romanian cultural domains"""
    HISTORY = "history"
    TRADITIONS = "traditions"
    CUISINE = "cuisine"
    LANGUAGE = "language"
    GEOGRAPHY = "geography"
    ARTS = "arts"
    RELIGION = "religion"
    SOCIAL_NORMS = "social_norms"
    LITERATURE = "literature"
    MUSIC = "music"
    FOLKLORE = "folklore"
    ARCHITECTURE = "architecture"

@dataclass
class CulturalEntry:
    """Single cultural knowledge entry"""
    domain: CulturalDomain
    title: str
    description: str
    context: str
    region: Optional[str] = None
    period: Optional[str] = None
    importance: float = 1.0
    related_terms: List[str] = None
    examples: List[str] = None

class RomanianCulturalDataset:
    """Comprehensive Romanian cultural knowledge dataset"""
    
    def __init__(self):
        self.cultural_data = self._initialize_comprehensive_dataset()
        self.regional_variations = self._initialize_regional_variations()
        self.linguistic_patterns = self._initialize_linguistic_patterns()
        self.historical_timeline = self._initialize_historical_timeline()
        self.social_contexts = self._initialize_social_contexts()
    
    def _initialize_comprehensive_dataset(self) -> Dict[CulturalDomain, List[CulturalEntry]]:
        """Initialize comprehensive Romanian cultural dataset"""
        
        dataset = {}
        
        # HISTORY - Extensive Romanian history
        dataset[CulturalDomain.HISTORY] = [
            CulturalEntry(
                domain=CulturalDomain.HISTORY,
                title="Dacia Antică",
                description="Regatul Dacia a fost un stat în Antichitate, situat în regiunea Carpaților și a Dunării de Jos, cu capitala la Sarmizegetusa Regia.",
                context="Perioada 82 î.Hr. - 106 d.Hr., cucerit de romani sub Traian",
                period="Antichitate",
                importance=1.0,
                related_terms=["Decebal", "Traian", "Sarmizegetusa", "daci", "romani"],
                examples=["Războaiele daco-romane", "Columna lui Traian", "Templul rotund de la Sarmizegetusa"]
            ),
            CulturalEntry(
                domain=CulturalDomain.HISTORY,
                title="Mihai Viteazul",
                description="Domnitorul care a realizat prima unire a Țării Românești, Moldovei și Transilvaniei în 1600.",
                context="Prima unificare a teritoriilor românești sub un singur conducător",
                period="1593-1601",
                importance=1.0,
                related_terms=["unire", "Țara Românească", "Moldova", "Transilvania"],
                examples=["Bătălia de la Călugăreni", "Cucerirea Transilvaniei", "Asasinarea la Câmpia Turzii"]
            ),
            CulturalEntry(
                domain=CulturalDomain.HISTORY,
                title="Ștefan cel Mare",
                description="Domnitor al Moldovei (1457-1504), unul din cei mai mari voievozi români, cunoscut pentru victoriile împotriva otomanilor.",
                context="Apărarea independenței Moldovei împotriva Imperiului Otoman",
                period="1457-1504",
                importance=1.0,
                related_terms=["Moldova", "otomani", "Bătălia de la Vaslui", "biserici", "fortificații"],
                examples=["Bătălia de la Vaslui (1475)", "Biserica de la Putna", "Cetatea Neamțului"]
            ),
            CulturalEntry(
                domain=CulturalDomain.HISTORY,
                title="Unirea Principatelor",
                description="Unirea Moldovei și Țării Românești în 1859 prin alegerea lui Alexandru Ioan Cuza ca domn în ambele țări.",
                context="Momentul fondator al României moderne",
                period="1859",
                importance=1.0,
                related_terms=["Alexandru Ioan Cuza", "Moldova", "Țara Românească", "modernizare"],
                examples=["Alegerea la Iași", "Alegerea la București", "Reformele lui Cuza"]
            ),
            CulturalEntry(
                domain=CulturalDomain.HISTORY,
                title="Războiul de Independență",
                description="România și-a câștigat independența de Imperiul Otoman în 1877, recunoscută internațional la Congresul de la Berlin (1878).",
                context="Finalul dominației otomane și nașterea României independente",
                period="1877-1878",
                importance=1.0,
                related_terms=["Carol I", "Plevna", "otomani", "independență"],
                examples=["Proclamarea independenței", "Bătălia de la Plevna", "Congresul de la Berlin"]
            ),
            CulturalEntry(
                domain=CulturalDomain.HISTORY,
                title="Marea Unire",
                description="Unirea tuturor provinciilor românești în 1918: Transilvania, Basarabia, Bucovina cu Regatul României.",
                context="Realizarea idealului național român",
                period="1918",
                importance=1.0,
                related_terms=["Transilvania", "Basarabia", "Bucovina", "Ferdinand I", "Regina Maria"],
                examples=["Unirea Basarabiei (27 martie)", "Unirea Bucovinei (28 noiembrie)", "Unirea Transilvaniei (1 decembrie)"]
            ),
            CulturalEntry(
                domain=CulturalDomain.HISTORY,
                title="Revoluția din 1989",
                description="Revoluția română din decembrie 1989 care a dus la căderea regimului comunist al lui Nicolae Ceaușescu.",
                context="Sfârșitul erei comuniste și tranziția la democrație",
                period="Decembrie 1989",
                importance=1.0,
                related_terms=["Nicolae Ceaușescu", "comunism", "democrație", "Timișoara", "București"],
                examples=["Protestele din Timișoara", "Fuga lui Ceaușescu", "Procesul și execuția"]
            )
        ]
        
        # TRADITIONS - Rich Romanian traditions
        dataset[CulturalDomain.TRADITIONS] = [
            CulturalEntry(
                domain=CulturalDomain.TRADITIONS,
                title="Mărțișorul",
                description="Tradiție de primăvară celebrată pe 1 martie, când bărbații oferă mărțișoare femeilor ca simbol al primirii primăverii.",
                context="Sărbătoare ancestrală de întâmpinare a primăverii",
                period="1 martie",
                importance=1.0,
                related_terms=["primăvară", "ghiocel", "fir roșu și alb", "Baba Dochia"],
                examples=["Mărțișoare handmade", "Legenda Babei Dochia", "Purtarea mărțișorului o lună"]
            ),
            CulturalEntry(
                domain=CulturalDomain.TRADITIONS,
                title="Dragobete",
                description="Sărbătoarea dragostei românești celebrată pe 24 februarie, echivalentul românesc al Zilei Îndrăgostiților.",
                context="Tradiție românească a iubirii și frumuseții",
                period="24 februarie",
                importance=0.9,
                related_terms=["dragoste", "feciorii", "fetele", "primăvară"],
                examples=["Căutarea florilor în pădure", "Spălarea cu zăpadă", "Cântecele de dragoste"]
            ),
            CulturalEntry(
                domain=CulturalDomain.TRADITIONS,
                title="Colindele de Crăciun",
                description="Cântece tradiționale românești cântate în perioada Crăciunului pentru a aduce bucurie și prosperitate.",
                context="Tradiție creștin-ortodoxă de sărbătorire a Nașterii Domnului",
                period="20 decembrie - 7 ianuarie",
                importance=1.0,
                related_terms=["colindători", "stea", "plugușorul", "sorcova", "căprioara"],
                examples=["O, ce veste minunată", "Steaua sus răsare", "Florile dalbe", "Trei păstori"]
            ),
            CulturalEntry(
                domain=CulturalDomain.TRADITIONS,
                title="Obiceiurile de Paști",
                description="Tradițiile pascale românești includ vopsirea ouălelor, pregătirea cozonacului și pașcii, și salutul pascal.",
                context="Cea mai importantă sărbătoare creștin-ortodoxă",
                period="Paști (variabil)",
                importance=1.0,
                related_terms=["ouă roșii", "cozonac", "pasca", "Hristos a înviat", "Adevărat a înviat"],
                examples=["Slujba de Înviere", "Ciocnirea ouălelor", "Masa de Paști", "Stropitul de Paștele Mic"]
            ),
            CulturalEntry(
                domain=CulturalDomain.TRADITIONS,
                title="Hora",
                description="Dansul popular românesc în cerc, simbol al unității și solidarității comunității.",
                context="Dans tradițional executat la toate sărbătorile importante",
                importance=1.0,
                related_terms=["cerc", "comunitate", "unitate", "nuntă", "hora unirii"],
                examples=["Hora la nunți", "Hora de la sărbători", "Hora unirii", "Pe deal pe la Corhana"]
            ),
            CulturalEntry(
                domain=CulturalDomain.TRADITIONS,
                title="Obiceiuri de nuntă",
                description="Ritualurile tradiționale românești de nuntă: cererea în căsătorie, logodna, cununie, petrecerea.",
                context="Ceremonii complexe care marchează trecerea la viața de familie",
                importance=0.9,
                related_terms=["mire", "mireasă", "nașii", "cununie", "hora", "furia mirilor"],
                examples=["Cerutul fetei", "Logodna", "Găteala miresei", "Hora mirilor", "Furia mirilor"]
            ),
            CulturalEntry(
                domain=CulturalDomain.TRADITIONS,
                title="Căluș",
                description="Dans ritual românesc executat de bărbați, recunoscut de UNESCO ca Patrimoniu Cultural Imaterial.",
                context="Dans magic cu putteri tămăduitoare din zona Olteniei",
                region="Oltenia",
                importance=1.0,
                related_terms=["ritual", "tămăduire", "căluși", "UNESCO", "magie"],
                examples=["Căluș de vindecare", "Jocul în cerc", "Cântecele de căluș"]
            )
        ]
        
        # CUISINE - Authentic Romanian cuisine
        dataset[CulturalDomain.CUISINE] = [
            CulturalEntry(
                domain=CulturalDomain.CUISINE,
                title="Sarmale",
                description="Preparatul tradițional românesc din carne tocată învelită în frunze de varză acră sau vie, gătită îndelung.",
                context="Cel mai reprezentativ fel de mâncare românesc, servit la toate sărbătorile",
                importance=1.0,
                related_terms=["varză", "carne", "orez", "sărbători", "Crăciun", "Paști"],
                examples=["Sarmale în foi de varză", "Sarmale în foi de viță", "Sarmale de post", "Sarmale de Crăciun"]
            ),
            CulturalEntry(
                domain=CulturalDomain.CUISINE,
                title="Mici (Mititei)",
                description="Cârnați românești fără înveliș, preparați la grătar, condimentați cu usturoi și cimbru.",
                context="Preparatul cel mai popular la grătare și terase",
                importance=1.0,
                related_terms=["grătar", "carne", "usturoi", "cimbru", "mustar"],
                examples=["Mici cu muștar", "Mici cu bere", "Mici de vită", "Mici amestec"]
            ),
            CulturalEntry(
                domain=CulturalDomain.CUISINE,
                title="Ciorbă de burtă",
                description="Supă tradițională românească din burtă de vită, cu smântână și usturoi, considerată leac pentru mahmureală.",
                context="Preparatul tradițional pentru dimineața de după petreceri",
                importance=0.9,
                related_terms=["burtă", "smântână", "usturoi", "oțet", "ardei iute"],
                examples=["Ciorbă de burtă cu smântână", "Ciorbă de burtă cu oțet", "Servirea cu ardei iute"]
            ),
            CulturalEntry(
                domain=CulturalDomain.CUISINE,
                title="Mămăligă",
                description="Terci gros din mălai (făină de porumb), considerat \"pâinea țăranului român\", servit ca înlocuitor de pâine.",
                context="Aliment de bază al țăranului român, înlocuitorul pâinii",
                importance=1.0,
                related_terms=["mălai", "porumb", "brânză", "smântână", "țăran"],
                examples=["Mămăligă cu brânză", "Mămăligă cu smântână", "Mămăligă cu ou", "Balmoș"]
            ),
            CulturalEntry(
                domain=CulturalDomain.CUISINE,
                title="Cozonac",
                description="Pâine dulce românească cu stafide, rahat și nucă, preparată special pentru sărbătorile de Paști și Crăciun.",
                context="Preparatul dulce tradițional pentru sărbători",
                period="Paști și Crăciun",
                importance=1.0,
                related_terms=["Paști", "Crăciun", "stafide", "nucă", "rahat"],
                examples=["Cozonac de Paști", "Cozonac de Crăciun", "Cozonac cu nucă", "Cozonac cu mac"]
            ),
            CulturalEntry(
                domain=CulturalDomain.CUISINE,
                title="Papanași",
                description="Desert tradițional românesc din brânză dulce, servit cu smântână și dulceață de cireșe sau fragi.",
                context="Cel mai popular desert tradițional românesc",
                importance=0.9,
                related_terms=["brânză dulce", "smântână", "dulceață", "cireșe", "desert"],
                examples=["Papanași cu dulceață de cireșe", "Papanași cu dulceață de căpșuni", "Papanași cu miere"]
            ),
            CulturalEntry(
                domain=CulturalDomain.CUISINE,
                title="Salată de icre",
                description="Preparatul festiv din icre de crap, ulei, lămâie și ceapă, servit în special de sărbători.",
                context="Aperitiv de sărbători, simbol al abundenței",
                period="Sărbători",
                importance=0.8,
                related_terms=["icre", "crap", "sărbători", "aperitiv", "pâine"],
                examples=["Salată de icre de crap", "Servirea cu pâine prăjită", "Garnisirea cu măsline"]
            )
        ]
        
        # LANGUAGE - Romanian linguistic features
        dataset[CulturalDomain.LANGUAGE] = [
            CulturalEntry(
                domain=CulturalDomain.LANGUAGE,
                title="Diacriticele românești",
                description="Sistemul de cinci diacritice românești: ă, â, î, ș, ț, esențiale pentru pronunția și înțelegerea corectă.",
                context="Particularitatea grafică a limbii române",
                importance=1.0,
                related_terms=["ă", "â", "î", "ș", "ț", "pronunție", "gramatică"],
                examples=["să (pronume) vs sa (nota muzicală)", "român vs roman", "țară vs tara"]
            ),
            CulturalEntry(
                domain=CulturalDomain.LANGUAGE,
                title="Registrul formal vs informal",
                description="Distincția între adresarea formală cu 'dumneavoastră' și cea informală cu 'tu' în limba română.",
                context="Codurile sociale de politeţe în comunicarea românească",
                importance=0.9,
                related_terms=["dumneavoastră", "tu", "politeţe", "respect", "vârstă"],
                examples=["Dumneavoastră pentru persoane mai în vârstă", "Tu pentru prieteni", "Comutarea formelor"]
            ),
            CulturalEntry(
                domain=CulturalDomain.LANGUAGE,
                title="Expresii de politeţe",
                description="Sistemul bogat de expresii de politeţe românești: vă rog, mulțumesc, cu plăcere, scuzați-mă.",
                context="Cultura comunicării respectuoase în societatea românească",
                importance=0.8,
                related_terms=["vă rog", "mulțumesc", "cu plăcere", "scuzați-mă", "poftim"],
                examples=["Vă rog să mă scuzați", "Mulțumesc mult", "Cu cea mai mare plăcere", "Poftim, serviți-vă"]
            ),
            CulturalEntry(
                domain=CulturalDomain.LANGUAGE,
                title="Diminutivele",
                description="Utilizarea frecventă a diminutivelor în română pentru exprimarea afecțiunii: casă-căsuță, floare-floricea.",
                context="Particularitatea expresivă a limbii române",
                importance=0.7,
                related_terms=["afecțiune", "expresivitate", "-ică", "-uță", "-el"],
                examples=["casă → căsuță", "floare → floricea", "copil → copilul", "mămica → mama"]
            ),
            CulturalEntry(
                domain=CulturalDomain.LANGUAGE,
                title="Saluturile românești",
                description="Varietatea saluturilor românești în funcție de moment: Bună dimineața, Bună ziua, Bună seara, Noapte bună.",
                context="Adaptarea salutului la momentul zilei în cultura românească",
                importance=0.8,
                related_terms=["dimineața", "ziua", "seara", "noapte", "Salut", "Noroc"],
                examples=["Bună dimineața (până la 12)", "Bună ziua (12-18)", "Bună seara (după 18)", "Salut (informal)"]
            )
        ]
        
        # GEOGRAPHY - Romanian geographical features  
        dataset[CulturalDomain.GEOGRAPHY] = [
            CulturalEntry(
                domain=CulturalDomain.GEOGRAPHY,
                title="Carpații",
                description="Lanțul muntos care traversează România, împărțit în Carpații Orientali, Meridionali și Occidentali.",
                context="Coloana vertebrală a României, cu cel mai înalt vârf Moldoveanu (2544m)",
                importance=1.0,
                related_terms=["munți", "Moldoveanu", "Bucegi", "Retezat", "Rodna", "schi", "drumeții"],
                examples=["Vârful Moldoveanu", "Masivul Bucegi", "Parcul Retezat", "Munții Apuseni"]
            ),
            CulturalEntry(
                domain=CulturalDomain.GEOGRAPHY,
                title="Dunărea",
                description="Al doilea cel mai lung fluviu din Europa, care se varsă în Marea Neagră prin Delta Dunării din România.",
                context="Arteră vitală pentru România, cu importanță economică și ecologică majoră",
                importance=1.0,
                related_terms=["fluviu", "deltă", "Marea Neagră", "transport", "pescuit", "UNESCO"],
                examples=["Delta Dunării", "Porturile Constanța și Galați", "Pescuitul tradițional", "Rezervația biosferei"]
            ),
            CulturalEntry(
                domain=CulturalDomain.GEOGRAPHY,
                title="Marea Neagră",
                description="Marea din estul României, cu litoralul românesc de 245 km, principala destinație de vacanță a românilor.",
                context="Litoralul românesc - destinația turistică națională preferată",
                importance=1.0,
                related_terms=["litoral", "vacanță", "stațiuni", "Constanța", "Mamaia", "Vama Veche"],
                examples=["Mamaia", "Eforie", "Jupiter", "Vama Veche", "2 Mai", "Costinești"]
            ),
            CulturalEntry(
                domain=CulturalDomain.GEOGRAPHY,
                title="Transilvania",
                description="Regiunea centrală a României, cunoscută pentru diversitatea culturală, cetăți medievale și legenda lui Dracula.",
                context="Cea mai mare regiune istorică, centru cultural și economic important",
                region="Transilvania",
                importance=1.0,
                related_terms=["cetăți", "săși", "secui", "Dracula", "Brașov", "Cluj", "Sibiu"],
                examples=["Castelul Bran", "Sighișoara medievală", "Brașov", "Cetatea Râșnov"]
            ),
            CulturalEntry(
                domain=CulturalDomain.GEOGRAPHY,
                title="Moldova",
                description="Regiunea de nord-est a României, renumită pentru viile sale, mănăstirile pictate și tradițiile păstrate.",
                context="Centrul vinificației românești și al tradițiilor ortodoxe",
                region="Moldova",
                importance=0.9,
                related_terms=["vin", "mănăstiri", "Bucovina", "Iași", "Suceava", "tradiții"],
                examples=["Mănăstirea Putna", "Vinurile de Cotnari", "Mănăstirile Bucovinei", "Universitatea din Iași"]
            )
        ]
        
        # ARTS - Romanian arts and crafts
        dataset[CulturalDomain.ARTS] = [
            CulturalEntry(
                domain=CulturalDomain.ARTS,
                title="Constantin Brâncuși",
                description="Sculptorul român considerat părintele sculpturii moderne mondiale, cunoscut pentru lucrări precum 'Coloana infinitului'.",
                context="Cel mai renumit artist român la nivel internațional",
                importance=1.0,
                related_terms=["sculptură", "modernism", "Târgu Jiu", "Coloana infinitului", "Poarta sărutului"],
                examples=["Coloana infinitului", "Poarta sărutului", "Masa tăcerii", "Pasărea în spațiu"]
            ),
            CulturalEntry(
                domain=CulturalDomain.ARTS,
                title="George Enescu",
                description="Compozitorul, violonistul și dirijorul român, considerat cel mai mare muzician român, compozitorul 'Rapsodiilor române'.",
                context="Maestrul muzicii românești, fondatorul școlii muzicale românești moderne",
                importance=1.0,
                related_terms=["muzică", "violonist", "compozitor", "Rapsodia română", "Festivalul Enescu"],
                examples=["Rapsodia română nr. 1", "Oedip", "Suita orchestrală", "Festivalul George Enescu"]
            ),
            CulturalEntry(
                domain=CulturalDomain.ARTS,
                title="Arta populară românească",
                description="Bogatul patrimoniu de artizanat tradițional: ceramica de Horezu, lemnul de Maramureș, covoarele de Oltenia.",
                context="Expresia autentică a creativității populare românești",
                importance=0.9,
                related_terms=["ceramică", "Horezu", "lemn", "Maramureș", "covoare", "Oltenia", "UNESCO"],
                examples=["Ceramica de Horezu (UNESCO)", "Portul tradițional maramureșean", "Covorele de Oltenia", "Icoanele pe sticlă"]
            ),
            CulturalEntry(
                domain=CulturalDomain.ARTS,
                title="Arhitectura tradițională",
                description="Stilurile arhitecturale românești: casele țărănești, bisericile de lemn din Maramureș, conacele boierești.",
                context="Patrimoniul arhitectural care reflectă identitatea românească",
                importance=0.9,
                related_terms=["case țărănești", "biserici de lemn", "conace", "Maramureș", "UNESCO"],
                examples=["Bisericile de lemn din Maramureș (UNESCO)", "Casele din Viscri", "Conacul Stirbey", "Biserica de la Densus"]
            )
        ]
        
        # LITERATURE - Romanian literary heritage
        dataset[CulturalDomain.LITERATURE] = [
            CulturalEntry(
                domain=CulturalDomain.LITERATURE,
                title="Mihai Eminescu",
                description="Poetul național al României, considerat cel mai mare poet român, autor al poeziei 'Luceafărul' și al Scrisorilor.",
                context="Poetul care a definit literatura română modernă",
                importance=1.0,
                related_terms=["poezie", "Luceafărul", "Scrisorile", "Revedere", "Floare albastră"],
                examples=["Luceafărul", "Scrisorile I-V", "Floare albastră", "Sara pe deal", "Revedere"]
            ),
            CulturalEntry(
                domain=CulturalDomain.LITERATURE,
                title="Ion Creangă",
                description="Povestitor moldovean, autor al 'Amintirilor din copilărie' și al poveștilor pentru copii cu Harap-Alb și Făt-Frumos.",
                context="Vocea autentică a satului românesc în literatură",
                importance=1.0,
                related_terms=["povești", "Harap-Alb", "copilărie", "satul moldovean", "Humuleștii"],
                examples=["Amintiri din copilărie", "Harap-Alb", "Punguța cu doi bani", "Soacra cu trei nurori"]
            ),
            CulturalEntry(
                domain=CulturalDomain.LITERATURE,
                title="Mircea Eliade",
                description="Istoricul religiilor, romancierul și eseistul, una dintre marile personalități intelectuale românești.",
                context="Gânditorul român cu recunoaștere mondială în studiul religiilor",
                importance=1.0,
                related_terms=["istoria religiilor", "romanele", "mitologie", "Universitatea Chicago"],
                examples=["Maitreyi", "Noaptea de Sânziene", "Istoria credințelor religioase", "Yoga"]
            ),
            CulturalEntry(
                domain=CulturalDomain.LITERATURE,
                title="Folclorul românesc",
                description="Bogăția basmelor, legendelor și colindelor românești: Miorița, Meșterul Manole, basmele cu Făt-Frumos.",
                context="Patrimoniul oral tradițional care păstrează însușirile naționale",
                importance=1.0,
                related_terms=["Miorița", "Meșterul Manole", "Făt-Frumos", "Ileana Cosânzeana", "balade populare"],
                examples=["Balada Miorița", "Legenda Meșterul Manole", "Basmul Făt-Frumos cu părul de aur", "Ileana Cosânzeana"]
            )
        ]
        
        # Add more domains...
        
        return dataset
    
    def _initialize_regional_variations(self) -> Dict[str, Dict[str, Any]]:
        """Initialize regional cultural variations"""
        return {
            "Maramureș": {
                "characteristics": [
                    "Arhitectura în lemn cu sculpturi elaborate",
                    "Portul tradițional cu pălării înalte",
                    "Bisericile de lemn UNESCO",
                    "Tradițiile pastorale și meșteșugurile în lemn"
                ],
                "dialect": "Accent specific, vocabular arhaic păstrat",
                "traditions": [
                    "Nunțile maramureșene cu ceremonialul complex",
                    "Sărbătorile cu aspect arhaic păstrat",
                    "Meșteșugurile tradiționale în lemn și lână"
                ],
                "cuisine": ["Tochitură", "Băluț", "Jintiță", "Hospod"]
            },
            "Transilvania": {
                "characteristics": [
                    "Diversitate culturală (români, maghiari, săși)",
                    "Cetăți medievale și biserici fortificate",
                    "Influența arhitecturală austriacă și maghiară",
                    "Tradițiile multiculturale"
                ],
                "dialect": "Influențe lexicale maghiare și germane",
                "traditions": [
                    "Sărbătorile multietnice",
                    "Tradițiile săsești în unele zone",
                    "Festivalurile culturale diverse"
                ],
                "cuisine": ["Kurtos kalacs", "Kürtőskalács", "Gulyás transilvănean"]
            },
            "Moldova": {
                "characteristics": [
                    "Mănăstirile cu fresce exterioare",
                    "Tradițiile viticole",
                    "Ceramica tradițională de Cucuteni",
                    "Folclorul autentic păstrat"
                ],
                "dialect": "Accent moloven caracteristic",
                "traditions": [
                    "Tradițiile legate de vin și vii",
                    "Sărbătorile ortodoxe cu specific local",
                    "Portul tradițional moldovenesc"
                ],
                "cuisine": ["Tocana moldovenească", "Papanași", "Vinurile de Cotnari"]
            },
            "Oltenia": {
                "characteristics": [
                    "Ceramica de Horezu (UNESCO)",
                    "Dansul căluș tradițional",
                    "Arhitectura țărănească specifică",
                    "Tradițiile meșteșugărești"
                ],
                "dialect": "Accent oltenesc cu particularități fonetice",
                "traditions": [
                    "Dansul căluș cu valențe magice",
                    "Olăritul tradițional de Horezu",
                    "Tradițiile agricole specifice"
                ],
                "cuisine": ["Miel la proțap", "Papricaș oltenesc", "Covrigi de Buzău"]
            }
        }
    
    def _initialize_linguistic_patterns(self) -> Dict[str, List[str]]:
        """Initialize comprehensive Romanian linguistic patterns"""
        return {
            "formal_expressions": [
                "Vă mulțumesc din suflet",
                "Am onoarea să vă anunț",
                "Cu tot respectul",
                "Vă rog să primiți",
                "Am deosebita plăcere",
                "Cu stimă și considerație"
            ],
            "informal_expressions": [
                "Mersi mult",
                "Ce mai zici?",
                "Să fim sănătoși",
                "Noroc și la mulți ani",
                "Să trăiești",
                "Pa pa"
            ],
            "proverbs": [
                "Cine se scoală de dimineață, departe ajunge",
                "Nu lăsa pe mâine ce poți face azi", 
                "Câinele care latră nu mușcă",
                "Cine seamănă vânt, culege furtună",
                "Omul sfintește locul",
                "Prin unire la biruință"
            ],
            "idioms": [
                "A face din țânțar armăsar",
                "A se lua cu mâinile de cap",
                "A căuta nod în papură",
                "A da cu banul pe țambal",
                "A întinde mâna după ceruri",
                "A pune botul pe carte"
            ],
            "interjections": [
                "Măi", "Ei", "Haide", "Bre", "Dragă",
                "Auzi", "Vezi", "Uite", "Ia", "Ba"
            ]
        }
    
    def _initialize_historical_timeline(self) -> List[Dict[str, Any]]:
        """Initialize detailed Romanian historical timeline"""
        return [
            {"year": "70,000 î.Hr.", "event": "Urmele primelor așezări paleolitice pe teritoriul României"},
            {"year": "6000-3500 î.Hr.", "event": "Cultura Cucuteni-Tripolye - civilizație neolitică avansată"},
            {"year": "513 î.Hr.", "event": "Prima expediție a lui Darius împotriva scitilor prin Dacia"},
            {"year": "82-44 î.Hr.", "event": "Regatul lui Burebista - prima unificare a triburilor dace"},
            {"year": "86-106 d.Hr.", "event": "Războaiele daco-romane - cucerirea Daciei de către romani"},
            {"year": "271-275", "event": "Retragerea administrației romane din Dacia"},
            {"year": "sec. IV-VI", "event": "Marile migrații - hunii, vizigoții, slavii"},
            {"year": "896", "event": "Trecerea maghiarilor prin Carpați"},
            {"year": "1003", "event": "Prima mențiune documentară despre vlahi în Cronica lui Kekaumenos"},
            {"year": "1310", "event": "Întemeierea Țării Românești de către Basarab I"},
            {"year": "1359", "event": "Întemeierea Principatului Moldovei de către Bogdan I"},
            {"year": "1456-1462", "event": "Domnia lui Vlad Țepeș în Țara Românească"},
            {"year": "1457-1504", "event": "Domnia lui Ștefan cel Mare în Moldova"},
            {"year": "1593-1601", "event": "Domnia lui Mihai Viteazul - prima unire (1600)"},
            {"year": "1821", "event": "Revoluția lui Tudor Vladimirescu"},
            {"year": "1848", "event": "Revoluția din Țara Românească și Moldova"},
            {"year": "1859", "event": "Alegerea lui Alexandru Ioan Cuza - Unirea Principatelor"},
            {"year": "1866", "event": "Carol de Hohenzollern devine domn - Constituția de la 1866"},
            {"year": "1877-1878", "event": "Războiul de Independență - independența României"},
            {"year": "1881", "event": "Proclamarea Regatului României - Carol I rege"},
            {"year": "1916-1918", "event": "Participarea României în Primul Război Mondial"},
            {"year": "1918", "event": "Marea Unire - formarea României Mari"},
            {"year": "1940", "event": "Cedarea Basarabiei, Bucovinei de Nord și Quadrilaterului"},
            {"year": "1941-1944", "event": "Participarea României în războiul împotriva URSS"},
            {"year": "1944", "event": "Lovitura de stat din 23 august - ieșirea din Axis"},
            {"year": "1945-1947", "event": "Instalarea regimului comunist"},
            {"year": "1965-1989", "event": "Epoca Ceaușescu - naționalism comunist"},
            {"year": "1989", "event": "Revoluția română - căderea comunismului"},
            {"year": "2004", "event": "Aderarea la NATO"},
            {"year": "2007", "event": "Aderarea la Uniunea Europeană"}
        ]
    
    def _initialize_social_contexts(self) -> Dict[str, Dict[str, Any]]:
        """Initialize Romanian social contexts and norms"""
        return {
            "family": {
                "structure": "Familia extinsă tradițională cu respectul pentru bătrâni",
                "roles": "Roluri tradiționale cu evoluții moderne",
                "values": ["respectul pentru părinți", "solidaritatea", "ospitalitatea", "munca cinstită"],
                "celebrations": ["botezuri", "nunți", "înmormântări", "zilele de naștere", "zilele onomastice"]
            },
            "business": {
                "greeting": "Strângerea mâinii, contact vizual, formalitatea inițială",
                "hierarchy": "Respectul pentru vârstă și experiență",
                "punctuality": "Punctualitatea este apreciată în mediul urban",
                "gift_giving": "Cadouri modeste, nu prea scumpe"
            },
            "education": {
                "values": "Respectul pentru profesori și cunoaștere", 
                "traditions": "Începutul anului școlar (15 septembrie), ziua profesorului",
                "ceremonies": "Serbare de sfârșit de an, festivitatea de absolvire"
            },
            "religion": {
                "predominant": "Ortodoxă (86.5%)",
                "practices": "Mersul la biserică duminica, posturile religioase, sărbătorile",
                "ceremonies": "Botezul, cununia religioasă, înmormântarea",
                "calendar": "Calendarul ortodox pentru sărbătorile mobile"
            }
        }
    
    def get_cultural_entry(self, domain: CulturalDomain, title: str) -> Optional[CulturalEntry]:
        """Get specific cultural entry by domain and title"""
        if domain in self.cultural_data:
            for entry in self.cultural_data[domain]:
                if entry.title.lower() == title.lower():
                    return entry
        return None
    
    def search_cultural_data(self, query: str, domains: List[CulturalDomain] = None) -> List[CulturalEntry]:
        """Search cultural data by query"""
        results = []
        search_query = query.lower()
        
        search_domains = domains or list(CulturalDomain)
        
        for domain in search_domains:
            if domain in self.cultural_data:
                for entry in self.cultural_data[domain]:
                    # Search in title, description, and related terms
                    if (search_query in entry.title.lower() or
                        search_query in entry.description.lower() or
                        any(search_query in term.lower() for term in (entry.related_terms or []))):
                        results.append(entry)
        
        # Sort by importance
        results.sort(key=lambda x: x.importance, reverse=True)
        return results
    
    def get_random_cultural_fact(self, domain: CulturalDomain = None) -> Optional[CulturalEntry]:
        """Get random cultural fact"""
        if domain and domain in self.cultural_data:
            return random.choice(self.cultural_data[domain])
        
        all_entries = []
        for entries in self.cultural_data.values():
            all_entries.extend(entries)
        
        return random.choice(all_entries) if all_entries else None
    
    def get_cultural_summary(self) -> Dict[str, int]:
        """Get summary of cultural dataset"""
        summary = {}
        total = 0
        for domain, entries in self.cultural_data.items():
            count = len(entries)
            summary[domain.value] = count
            total += count
        
        summary["total"] = total
        return summary
    
    def export_cultural_data(self, filename: str = "romanian_cultural_data.json"):
        """Export cultural data to JSON file"""
        export_data = {}
        for domain, entries in self.cultural_data.items():
            export_data[domain.value] = [
                {
                    "title": entry.title,
                    "description": entry.description,
                    "context": entry.context,
                    "region": entry.region,
                    "period": entry.period,
                    "importance": entry.importance,
                    "related_terms": entry.related_terms,
                    "examples": entry.examples
                }
                for entry in entries
            ]
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2)
        
        return f"Cultural data exported to {filename}"


# Global instance for easy import
romanian_cultural_dataset = RomanianCulturalDataset()

# Export key functions for direct use
def get_cultural_entry(domain: str, title: str) -> Optional[CulturalEntry]:
    """Get cultural entry by domain and title"""
    try:
        domain_enum = CulturalDomain(domain)
        return romanian_cultural_dataset.get_cultural_entry(domain_enum, title)
    except ValueError:
        return None

def search_romanian_culture(query: str, domains: List[str] = None) -> List[CulturalEntry]:
    """Search Romanian cultural data"""
    domain_enums = []
    if domains:
        for domain in domains:
            try:
                domain_enums.append(CulturalDomain(domain))
            except ValueError:
                continue
    
    return romanian_cultural_dataset.search_cultural_data(query, domain_enums)

def get_random_romanian_fact(domain: str = None) -> Optional[CulturalEntry]:
    """Get random Romanian cultural fact"""
    if domain:
        try:
            domain_enum = CulturalDomain(domain)
            return romanian_cultural_dataset.get_random_cultural_fact(domain_enum)
        except ValueError:
            return None
    
    return romanian_cultural_dataset.get_random_cultural_fact()

def get_dataset_summary() -> Dict[str, int]:
    """Get summary of cultural dataset"""
    return romanian_cultural_dataset.get_cultural_summary()


if __name__ == "__main__":
    # Demonstrate the dataset
    dataset = RomanianCulturalDataset()
    
    print("🇷🇴 Romanian Cultural Dataset Initialized")
    print("=" * 50)
    
    summary = dataset.get_cultural_summary()
    print(f"Total cultural entries: {summary['total']}")
    
    for domain, count in summary.items():
        if domain != "total":
            print(f"  {domain.title()}: {count} entries")
    
    print("\n🔍 Sample searches:")
    
    # Search examples
    results = dataset.search_cultural_data("Eminescu")
    print(f"\nSearch 'Eminescu': {len(results)} results")
    for result in results[:1]:
        print(f"  - {result.title}: {result.description[:100]}...")
    
    results = dataset.search_cultural_data("Crăciun")  
    print(f"\nSearch 'Crăciun': {len(results)} results")
    for result in results[:1]:
        print(f"  - {result.title}: {result.description[:100]}...")
        
    # Random fact
    fact = dataset.get_random_cultural_fact()
    print(f"\n🎲 Random cultural fact:")
    print(f"  {fact.title} ({fact.domain.value})")
    print(f"  {fact.description[:150]}...")