"""
Romanian Regional Characteristics Module
=======================================

Comprehensive regional characteristics for all 10 Romanian regions.
Enhanced cultural context and analysis capabilities.

Author: GitHub Copilot
Date: August 2025
Version: 3.0.0 - Modular
"""

from typing import Dict, List, Any
try:
    from .romanian_cultural_database import RomanianRegion
except ImportError:
    from romanian_cultural_database import RomanianRegion

class RomanianRegionalCharacteristics:
    """Comprehensive Romanian Regional Characteristics"""
    
    def __init__(self):
        self.characteristics = self._initialize_all_regional_characteristics()
    
    def _initialize_all_regional_characteristics(self) -> Dict[RomanianRegion, Dict[str, Any]]:
        """Initialize comprehensive characteristics for all 10 Romanian regions"""
        characteristics = {}
        
        # TRANSYLVANIA (Transilvania)
        characteristics[RomanianRegion.TRANSYLVANIA] = {
            "cultural_influences": ["saxon", "hungarian", "german", "medieval", "multicultural"],
            "architectural_style": "fortified_medieval",
            "primary_industries": ["agriculture", "crafts", "tourism", "mining", "forestry"],
            "key_traditions": [
                "fortified_churches", "saxon_traditions", "medieval_festivals", 
                "multicultural_heritage", "wine_making", "traditional_crafts"
            ],
            "linguistic_features": ["german_loanwords", "hungarian_influence", "archaic_forms", "saxon_vocabulary"],
            "preservation_priority": "high",
            "tourist_significance": 0.92,
            "cultural_density": 0.94,
            "authenticity_level": 0.90,
            "major_cities": ["Cluj-Napoca", "Brașov", "Sibiu", "Târgu Mureș"],
            "natural_landmarks": ["Carpathian Mountains", "Apuseni Mountains", "Harghita Mountains"],
            "cultural_institutions": ["UNESCO sites", "medieval citadels", "ethnographic museums"],
            "traditional_occupations": ["farming", "blacksmithing", "weaving", "woodworking", "pottery"],
            "dialect_characteristics": ["clear pronunciation", "german_influence", "formal_structures"],
            "festivals_events": ["Medieval Festival Sighișoara", "Sibiu Theatre Festival", "Jazz Festival Cluj"]
        }
        
        # MARAMUREȘ
        characteristics[RomanianRegion.MARAMURES] = {
            "cultural_influences": ["hungarian", "ukrainian", "archaic_romanian", "pastoral", "carpathian"],
            "architectural_style": "wooden_traditional",
            "primary_industries": ["woodworking", "agriculture", "traditional_crafts", "pastoral", "tourism"],
            "key_traditions": [
                "wooden_churches", "traditional_gates", "folk_costumes", "pastoral_festivals",
                "wood_carving", "traditional_weddings", "mountain_customs"
            ],
            "linguistic_features": ["archaic_forms", "ukrainian_loanwords", "pastoral_vocabulary", "mountain_dialect"],
            "preservation_priority": "critical",
            "tourist_significance": 0.88,
            "cultural_density": 0.96,
            "authenticity_level": 0.94,
            "major_cities": ["Baia Mare", "Sighetu Marmației", "Borșa"],
            "natural_landmarks": ["Rodna Mountains", "Maramureș Mountains", "Iza Valley"],
            "cultural_institutions": ["Village Museum", "Memorial of Communist Victims", "Traditional workshops"],
            "traditional_occupations": ["shepherding", "wood_carving", "weaving", "farming", "traditional_crafts"],
            "dialect_characteristics": ["archaic_vocabulary", "musical_intonation", "ukrainian_influence"],
            "festivals_events": ["Sheep Festival", "Traditional Wedding Celebrations", "Wood Carving Contests"]
        }
        
        # BUCOVINA
        characteristics[RomanianRegion.BUCOVINA] = {
            "cultural_influences": ["ukrainian", "austrian", "russian", "orthodox", "carpathian"],
            "architectural_style": "painted_monasteries",
            "primary_industries": ["agriculture", "forestry", "religious_tourism", "traditional_crafts", "livestock"],
            "key_traditions": [
                "painted_monasteries", "egg_decoration", "religious_festivals", "orthodox_art",
                "traditional_textiles", "mountain_customs", "religious_crafts"
            ],
            "linguistic_features": ["ukrainian_influence", "church_slavonic_terms", "religious_vocabulary", "archaic_forms"],
            "preservation_priority": "critical",
            "tourist_significance": 0.91,
            "cultural_density": 0.89,
            "authenticity_level": 0.92,
            "major_cities": ["Suceava", "Rădăuți", "Gura Humorului", "Vatra Dornei"],
            "natural_landmarks": ["Bucovina Mountains", "Rarău Mountains", "Suceava River Valley"],
            "cultural_institutions": ["Painted Monasteries", "Bucovina Village Museum", "Religious art centers"],
            "traditional_occupations": ["icon_painting", "textile_weaving", "farming", "shepherding", "woodworking"],
            "dialect_characteristics": ["soft_pronunciation", "ukrainian_vocabulary", "religious_terms"],
            "festivals_events": ["Easter Celebrations", "Religious Festivals", "Traditional Crafts Fairs"]
        }
        
        # MOLDAVIA (Moldova)
        characteristics[RomanianRegion.MOLDAVIA] = {
            "cultural_influences": ["russian", "ukrainian", "turkish", "polish", "orthodox"],
            "architectural_style": "moldavian_medieval",
            "primary_industries": ["agriculture", "wine_making", "textiles", "food_processing", "crafts"],
            "key_traditions": [
                "wine_traditions", "religious_festivals", "traditional_dances", "folk_music",
                "monastery_traditions", "agricultural_festivals", "craft_traditions"
            ],
            "linguistic_features": ["eastern_dialect", "russian_loanwords", "church_terms", "agricultural_vocabulary"],
            "preservation_priority": "high",
            "tourist_significance": 0.82,
            "cultural_density": 0.85,
            "authenticity_level": 0.87,
            "major_cities": ["Iași", "Bacău", "Piatra Neamț", "Vaslui"],
            "natural_landmarks": ["Eastern Carpathians", "Siret River", "Prut River"],
            "cultural_institutions": ["Moldova's National Theatre", "Neamț Monastery", "Wine cellars"],
            "traditional_occupations": ["wine_making", "farming", "weaving", "pottery", "beekeeping"],
            "dialect_characteristics": ["eastern_pronunciation", "melodic_intonation", "russian_influence"],
            "festivals_events": ["Wine Festivals", "Traditional Music Festivals", "Religious Celebrations"]
        }
        
        # WALLACHIA (Țara Românească)
        characteristics[RomanianRegion.WALLACHIA] = {
            "cultural_influences": ["turkish", "byzantine", "balkan", "greek", "slavic"],
            "architectural_style": "brâncovenesc",
            "primary_industries": ["agriculture", "oil_industry", "manufacturing", "commerce", "services"],
            "key_traditions": [
                "court_traditions", "religious_art", "folk_dances", "traditional_music",
                "agricultural_festivals", "urban_culture", "commercial_traditions"
            ],
            "linguistic_features": ["standard_romanian", "turkish_loanwords", "urban_vocabulary", "commercial_terms"],
            "preservation_priority": "medium",
            "tourist_significance": 0.85,
            "cultural_density": 0.83,
            "authenticity_level": 0.85,
            "major_cities": ["București", "Craiova", "Ploiești", "Târgoviște"],
            "natural_landmarks": ["Danube River", "Southern Carpathians", "Wallachian Plain"],
            "cultural_institutions": ["National Theatre", "Royal Court", "Museums", "Cultural centers"],
            "traditional_occupations": ["farming", "trading", "crafting", "court_services", "religious_services"],
            "dialect_characteristics": ["clear_pronunciation", "standard_forms", "urban_influences"],
            "festivals_events": ["Bucharest Days", "Traditional Festivals", "Cultural Events"]
        }
        
        # OLTENIA
        characteristics[RomanianRegion.OLTENIA] = {
            "cultural_influences": ["serbian", "bulgarian", "turkish", "austrian", "balkan"],
            "architectural_style": "oltenian_traditional",
            "primary_industries": ["agriculture", "mining", "energy", "traditional_crafts", "forestry"],
            "key_traditions": [
                "pottery_traditions", "folk_dances", "traditional_music", "agricultural_festivals",
                "craft_traditions", "religious_celebrations", "mountain_customs"
            ],
            "linguistic_features": ["oltenian_dialect", "serbian_influence", "mountain_vocabulary", "craft_terms"],
            "preservation_priority": "high",
            "tourist_significance": 0.79,
            "cultural_density": 0.87,
            "authenticity_level": 0.89,
            "major_cities": ["Craiova", "Târgu Jiu", "Drobeta-Turnu Severin", "Caracal"],
            "natural_landmarks": ["Carpathian Mountains", "Danube River", "Jiu Valley"],
            "cultural_institutions": ["Horezu Pottery Centers", "Brâncuși sculptures", "Traditional workshops"],
            "traditional_occupations": ["pottery", "farming", "mining", "shepherding", "crafting"],
            "dialect_characteristics": ["distinctive_pronunciation", "balkan_influence", "expressive_intonation"],
            "festivals_events": ["Pottery Festivals", "Traditional Music Events", "Agricultural Celebrations"]
        }
        
        # MUNTENIA
        characteristics[RomanianRegion.MUNTENIA] = {
            "cultural_influences": ["turkish", "greek", "bulgarian", "phanariot", "byzantine"],
            "architectural_style": "brâncovenesc_urban",
            "primary_industries": ["agriculture", "industry", "services", "commerce", "technology"],
            "key_traditions": [
                "court_culture", "urban_traditions", "religious_art", "commercial_culture",
                "agricultural_traditions", "craft_guilds", "cultural_institutions"
            ],
            "linguistic_features": ["standard_romanian", "urban_vocabulary", "commercial_terms", "cultural_terms"],
            "preservation_priority": "medium",
            "tourist_significance": 0.87,
            "cultural_density": 0.82,
            "authenticity_level": 0.83,
            "major_cities": ["București", "Ploiești", "Târgoviște", "Buzău"],
            "natural_landmarks": ["Carpathian Foothills", "Danube Plain", "Ialomița River"],
            "cultural_institutions": ["National institutions", "Universities", "Theaters", "Museums"],
            "traditional_occupations": ["farming", "trading", "crafting", "administration", "cultural_work"],
            "dialect_characteristics": ["standard_pronunciation", "urban_refinement", "cultural_vocabulary"],
            "festivals_events": ["Cultural Festivals", "Urban Events", "Traditional Celebrations"]
        }
        
        # DOBROGEA
        characteristics[RomanianRegion.DOBROGEA] = {
            "cultural_influences": ["turkish", "tatar", "greek", "armenian", "bulgarian", "multicultural"],
            "architectural_style": "danubian_multicultural",
            "primary_industries": ["agriculture", "fishing", "tourism", "shipping", "energy"],
            "key_traditions": [
                "multicultural_heritage", "fishing_traditions", "agricultural_festivals",
                "ethnic_diversity", "maritime_culture", "trade_traditions", "religious_diversity"
            ],
            "linguistic_features": ["multicultural_vocabulary", "turkish_loanwords", "maritime_terms", "trade_vocabulary"],
            "preservation_priority": "medium",
            "tourist_significance": 0.84,
            "cultural_density": 0.78,
            "authenticity_level": 0.81,
            "major_cities": ["Constanța", "Tulcea", "Medgidia", "Mangalia"],
            "natural_landmarks": ["Danube Delta", "Black Sea Coast", "Danube River"],
            "cultural_institutions": ["Maritime museums", "Multicultural centers", "Archaeological sites"],
            "traditional_occupations": ["fishing", "farming", "trading", "shipping", "tourism"],
            "dialect_characteristics": ["coastal_influences", "multicultural_vocabulary", "maritime_terms"],
            "festivals_events": ["Maritime Festivals", "Multicultural Events", "Fishing Celebrations"]
        }
        
        # BANAT
        characteristics[RomanianRegion.BANAT] = {
            "cultural_influences": ["austrian", "hungarian", "german", "serbian", "multicultural"],
            "architectural_style": "austro_hungarian",
            "primary_industries": ["agriculture", "industry", "mining", "manufacturing", "services"],
            "key_traditions": [
                "multicultural_heritage", "austro_hungarian_legacy", "industrial_traditions",
                "agricultural_festivals", "urban_culture", "craft_traditions", "religious_diversity"
            ],
            "linguistic_features": ["austro_hungarian_influence", "german_loanwords", "hungarian_vocabulary", "industrial_terms"],
            "preservation_priority": "medium",
            "tourist_significance": 0.81,
            "cultural_density": 0.80,
            "authenticity_level": 0.84,
            "major_cities": ["Timișoara", "Reșița", "Caransebeș", "Lugoj"],
            "natural_landmarks": ["Carpathian Mountains", "Timiș River", "Danube River"],
            "cultural_institutions": ["Austrian architecture", "Industrial heritage", "Multicultural centers"],
            "traditional_occupations": ["farming", "industry", "mining", "crafting", "administration"],
            "dialect_characteristics": ["austro_hungarian_influence", "clear_pronunciation", "multicultural_vocabulary"],
            "festivals_events": ["Multicultural Festivals", "Industrial Heritage Events", "Traditional Celebrations"]
        }
        
        # CRIȘANA
        characteristics[RomanianRegion.CRISANA] = {
            "cultural_influences": ["hungarian", "austrian", "slovakian", "western_european"],
            "architectural_style": "austro_hungarian_western",
            "primary_industries": ["agriculture", "industry", "services", "manufacturing", "technology"],
            "key_traditions": [
                "western_influences", "austro_hungarian_heritage", "agricultural_traditions",
                "industrial_culture", "urban_development", "craft_traditions", "multicultural_heritage"
            ],
            "linguistic_features": ["hungarian_influence", "western_vocabulary", "industrial_terms", "urban_language"],
            "preservation_priority": "medium",
            "tourist_significance": 0.77,
            "cultural_density": 0.76,
            "authenticity_level": 0.82,
            "major_cities": ["Oradea", "Arad", "Deva", "Hunedoara"],
            "natural_landmarks": ["Western Carpathians", "Criș Rivers", "Apuseni Mountains"],
            "cultural_institutions": ["Western architecture", "Industrial heritage", "Cultural centers"],
            "traditional_occupations": ["farming", "industry", "crafting", "trading", "services"],
            "dialect_characteristics": ["western_influences", "hungarian_vocabulary", "clear_pronunciation"],
            "festivals_events": ["Western Cultural Events", "Industrial Heritage", "Traditional Festivals"]
        }
        
        return characteristics
    
    def get_region_characteristics(self, region: RomanianRegion) -> Dict[str, Any]:
        """Get characteristics for a specific region"""
        return self.characteristics.get(region, {})
    
    def get_all_characteristics(self) -> Dict[RomanianRegion, Dict[str, Any]]:
        """Get all regional characteristics"""
        return self.characteristics
    
    def find_regions_by_influence(self, influence: str) -> List[RomanianRegion]:
        """Find regions influenced by a specific culture"""
        regions = []
        for region, chars in self.characteristics.items():
            if influence.lower() in [inf.lower() for inf in chars.get("cultural_influences", [])]:
                regions.append(region)
        return regions
    
    def find_regions_by_tradition(self, tradition: str) -> List[RomanianRegion]:
        """Find regions with a specific tradition"""
        regions = []
        for region, chars in self.characteristics.items():
            if tradition.lower() in [trad.lower() for trad in chars.get("key_traditions", [])]:
                regions.append(region)
        return regions
    
    def get_authenticity_ranking(self) -> List[tuple]:
        """Get regions ranked by authenticity level"""
        rankings = []
        for region, chars in self.characteristics.items():
            authenticity = chars.get("authenticity_level", 0)
            rankings.append((region, authenticity))
        return sorted(rankings, key=lambda x: x[1], reverse=True)
    
    def get_cultural_density_ranking(self) -> List[tuple]:
        """Get regions ranked by cultural density"""
        rankings = []
        for region, chars in self.characteristics.items():
            density = chars.get("cultural_density", 0)
            rankings.append((region, density))
        return sorted(rankings, key=lambda x: x[1], reverse=True)
    
    def get_tourism_potential_ranking(self) -> List[tuple]:
        """Get regions ranked by tourism potential"""
        rankings = []
        for region, chars in self.characteristics.items():
            tourism = chars.get("tourist_significance", 0)
            rankings.append((region, tourism))
        return sorted(rankings, key=lambda x: x[1], reverse=True)
    
    def get_preservation_priorities(self) -> Dict[str, List[RomanianRegion]]:
        """Get regions grouped by preservation priority"""
        priorities = {"critical": [], "high": [], "medium": [], "low": []}
        for region, chars in self.characteristics.items():
            priority = chars.get("preservation_priority", "medium")
            if priority in priorities:
                priorities[priority].append(region)
        return priorities
    
    def search_regions_by_keyword(self, keyword: str) -> List[RomanianRegion]:
        """Search regions by keyword in any characteristics field"""
        keyword_lower = keyword.lower()
        matching_regions = []
        
        for region, chars in self.characteristics.items():
            # Search in all string and list fields
            for field_name, field_value in chars.items():
                if isinstance(field_value, str) and keyword_lower in field_value.lower():
                    if region not in matching_regions:
                        matching_regions.append(region)
                elif isinstance(field_value, list):
                    if any(keyword_lower in str(item).lower() for item in field_value):
                        if region not in matching_regions:
                            matching_regions.append(region)
        
        return matching_regions
    
    def get_comprehensive_stats(self) -> Dict[str, Any]:
        """Get comprehensive statistics about regional characteristics"""
        total_regions = len(self.characteristics)
        
        # Calculate averages
        avg_authenticity = sum(chars.get("authenticity_level", 0) for chars in self.characteristics.values()) / total_regions
        avg_cultural_density = sum(chars.get("cultural_density", 0) for chars in self.characteristics.values()) / total_regions
        avg_tourism = sum(chars.get("tourist_significance", 0) for chars in self.characteristics.values()) / total_regions
        
        # Count preservation priorities
        preservation_counts = {}
        for chars in self.characteristics.values():
            priority = chars.get("preservation_priority", "medium")
            preservation_counts[priority] = preservation_counts.get(priority, 0) + 1
        
        # Count cultural influences
        influence_counts = {}
        for chars in self.characteristics.values():
            for influence in chars.get("cultural_influences", []):
                influence_counts[influence] = influence_counts.get(influence, 0) + 1
        
        return {
            "total_regions": total_regions,
            "averages": {
                "authenticity_level": avg_authenticity,
                "cultural_density": avg_cultural_density,
                "tourist_significance": avg_tourism
            },
            "preservation_priorities": preservation_counts,
            "top_cultural_influences": sorted(influence_counts.items(), key=lambda x: x[1], reverse=True)[:10],
            "rankings": {
                "authenticity": self.get_authenticity_ranking(),
                "cultural_density": self.get_cultural_density_ranking(),
                "tourism_potential": self.get_tourism_potential_ranking()
            }
        }
