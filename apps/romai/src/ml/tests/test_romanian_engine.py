"""
Unit Tests for RomAI Romanian Language Processing Engine
Cultural and linguistic validation tests
"""

import pytest
import asyncio
import sys
import os
from datetime import datetime

# Add RomAI paths
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from reasoning.autonomous_romanian_engine import AutonomousRomanianEngine

class TestRomanianLanguageEngine:
    """Unit tests for Romanian language processing engine"""
    
    @pytest.fixture
    def engine(self):
        """Create Romanian language processing engine instance"""
        return AutonomousRomanianEngine()
    
    @pytest.mark.asyncio
    async def test_basic_romanian_greeting(self, engine):
        """Test basic Romanian greeting processing"""
        text = "Bună ziua! Cum vă numiți?"
        result = await engine.process_romanian_text(text)
        
        # Should recognize as greeting and provide appropriate response
        if hasattr(result, 'response'):
            response = result.response.lower()
        else:
            response = str(result).lower()
        
        assert 'salut' in response or 'bună' in response or 'greeting' in response, \
            f"Expected greeting recognition, got: {response}"
    
    @pytest.mark.asyncio
    async def test_cultural_context_analysis(self, engine):
        """Test Romanian cultural context understanding"""
        text = "În România, sărbătorim Mărțișorul pe 1 martie."
        result = await engine.analyze_cultural_context(text)
        
        if hasattr(result, 'cultural_context'):
            context = result.cultural_context.lower()
        else:
            context = str(result).lower()
        
        # Should recognize Mărțișor as Romanian tradition
        assert 'mărțișor' in context or 'tradiție' in context or 'tradition' in context or 'martie' in context, \
            f"Expected cultural context recognition, got: {context}"
    
    @pytest.mark.asyncio
    async def test_diacritics_handling(self, engine):
        """Test proper handling of Romanian diacritics"""
        text_with_diacritics = "Română păstrează diacriticele ă, â, î, ș, ț"
        result = await engine.process_romanian_text(text_with_diacritics)
        
        result_text = str(result)
        
        # Should preserve or properly handle diacritics
        assert 'română' in result_text.lower() or 'romanian' in result_text.lower(), \
            f"Expected Romanian language recognition with diacritics, got: {result_text}"
    
    @pytest.mark.asyncio
    async def test_romanian_poetry_analysis(self, engine):
        """Test analysis of Romanian poetry"""
        poetry_text = "Doina mea și alte poezii de Mihai Eminescu sunt parte din literatura română."
        result = await engine.analyze_literary_content(poetry_text)
        
        if hasattr(result, 'literary_analysis'):
            analysis = result.literary_analysis.lower()
        else:
            analysis = str(result).lower()
        
        # Should recognize Eminescu as Romanian poet
        assert 'eminescu' in analysis or 'poet' in analysis or 'literatură' in analysis or 'literature' in analysis, \
            f"Expected literary analysis recognition, got: {analysis}"
    
    @pytest.mark.asyncio
    async def test_historical_knowledge(self, engine):
        """Test Romanian historical knowledge"""
        text = "Ștefan cel Mare a fost domnitor al Moldovei."
        result = await engine.analyze_cultural_context(text)
        
        result_text = str(result).lower()
        
        # Should recognize historical figure
        assert 'ștefan' in result_text or 'moldova' in result_text or 'domnitor' in result_text or 'historical' in result_text, \
            f"Expected historical knowledge recognition, got: {result_text}"
    
    @pytest.mark.asyncio
    async def test_geographical_knowledge(self, engine):
        """Test Romanian geographical knowledge"""
        text = "Carpații se întind prin România, iar Dunărea curge spre Marea Neagră."
        result = await engine.analyze_cultural_context(text)
        
        result_text = str(result).lower()
        
        # Should recognize geographical features
        assert 'carpați' in result_text or 'dunărea' in result_text or 'romania' in result_text or 'geographical' in result_text, \
            f"Expected geographical knowledge recognition, got: {result_text}"
    
    @pytest.mark.asyncio
    async def test_language_translation_ability(self, engine):
        """Test Romanian-English translation capabilities"""
        romanian_text = "Mă numesc Ion și sunt din București."
        result = await engine.translate_to_english(romanian_text)
        
        if hasattr(result, 'translation'):
            translation = result.translation.lower()
        elif hasattr(result, 'english_text'):
            translation = result.english_text.lower()
        else:
            translation = str(result).lower()
        
        # Should contain key elements of translation
        assert ('name' in translation or 'called' in translation) and 'bucharest' in translation, \
            f"Expected proper translation with name and Bucharest, got: {translation}"
    
    @pytest.mark.asyncio
    async def test_sentiment_analysis_romanian(self, engine):
        """Test sentiment analysis for Romanian text"""
        positive_text = "Sunt foarte fericit cu această veste minunată!"
        negative_text = "Sunt foarte supărat și dezamăgit de această situație."
        
        positive_result = await engine.analyze_sentiment(positive_text)
        negative_result = await engine.analyze_sentiment(negative_text)
        
        # Check positive sentiment
        if hasattr(positive_result, 'sentiment'):
            assert positive_result.sentiment == 'positive' or positive_result.sentiment > 0.5
        else:
            pos_text = str(positive_result).lower()
            assert 'positive' in pos_text or 'fericit' in pos_text or 'happy' in pos_text
        
        # Check negative sentiment  
        if hasattr(negative_result, 'sentiment'):
            assert negative_result.sentiment == 'negative' or negative_result.sentiment < -0.5
        else:
            neg_text = str(negative_result).lower()
            assert 'negative' in neg_text or 'supărat' in neg_text or 'sad' in neg_text
    
    @pytest.mark.asyncio
    async def test_romanian_grammar_correction(self, engine):
        """Test Romanian grammar correction capabilities"""
        incorrect_text = "Eu sunt merge la școala ieri."  # Intentionally incorrect
        result = await engine.correct_grammar(incorrect_text)
        
        if hasattr(result, 'corrected_text'):
            corrected = result.corrected_text.lower()
        else:
            corrected = str(result).lower()
        
        # Should identify and correct grammar issues
        assert 'corrected' in str(result).lower() or 'grammar' in str(result).lower() or \
               'școală' in corrected or 'correct' in str(result).lower(), \
            f"Expected grammar correction recognition, got: {result}"
    
    @pytest.mark.asyncio
    async def test_romanian_cultural_holidays(self, engine):
        """Test recognition of Romanian cultural holidays"""
        holiday_texts = [
            "De Crăciun, românii se adună în familie.",
            "Pe 1 decembrie sărbătorim Ziua Națională a României.",
            "Paștele este cea mai importantă sărbătoare religioasă."
        ]
        
        for text in holiday_texts:
            result = await engine.analyze_cultural_context(text)
            result_text = str(result).lower()
            
            # Should recognize cultural/religious holidays
            assert 'holiday' in result_text or 'sărbătoare' in result_text or 'cultural' in result_text or \
                   'crăciun' in result_text or 'paște' in result_text or 'decembrie' in result_text, \
                f"Expected holiday recognition for text: {text}, got: {result_text}"
    
    @pytest.mark.asyncio
    async def test_romanian_food_culture(self, engine):
        """Test understanding of Romanian food culture"""
        food_text = "Mâncarea tradițională română include ciorbă de burtă, mici și papanași."
        result = await engine.analyze_cultural_context(food_text)
        
        result_text = str(result).lower()
        
        # Should recognize traditional Romanian foods
        assert 'food' in result_text or 'mâncare' in result_text or 'tradițional' in result_text or \
               'ciorbă' in result_text or 'mici' in result_text or 'culinary' in result_text, \
            f"Expected food culture recognition, got: {result_text}"
    
    @pytest.mark.asyncio
    async def test_performance_romanian_processing(self, engine):
        """Test performance of Romanian text processing"""
        start_time = datetime.now()
        
        test_texts = [
            "Bună ziua! Cum vă numiți?",
            "România este o țară frumoasă.",
            "Mihai Eminescu a fost un mare poet român.",
            "Carpații sunt munții României.",
            "Bucureștiul este capitala României."
        ]
        
        for text in test_texts:
            result = await engine.process_romanian_text(text)
            assert result is not None, f"Failed to process text: {text}"
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Should process 5 texts in under 10 seconds
        assert duration < 10.0, f"Performance test failed: took {duration:.2f}s for 5 texts"
    
    @pytest.mark.asyncio
    async def test_romanian_idioms_understanding(self, engine):
        """Test understanding of Romanian idioms and expressions"""
        idiom_text = "A dat cu bâta în baltă și acum plătește scump."  # Romanian idiom
        result = await engine.analyze_cultural_context(idiom_text)
        
        result_text = str(result).lower()
        
        # Should recognize idiomatic expression
        assert 'idiom' in result_text or 'expression' in result_text or 'cultural' in result_text or \
               'meaning' in result_text or 'bâta' in result_text, \
            f"Expected idiom recognition, got: {result_text}"
    
    @pytest.mark.asyncio
    async def test_error_handling_non_romanian(self, engine):
        """Test error handling for non-Romanian text"""
        english_text = "This is English text, not Romanian."
        
        try:
            result = await engine.process_romanian_text(english_text)
            
            # Should handle gracefully
            result_text = str(result).lower()
            assert 'english' in result_text or 'not romanian' in result_text or \
                   'language' in result_text or 'error' in result_text, \
                f"Expected language detection, got: {result_text}"
                
        except Exception as e:
            # It's acceptable to raise an exception for non-Romanian input
            assert 'romanian' in str(e).lower() or 'language' in str(e).lower()

    @pytest.mark.asyncio
    async def test_romanian_regional_dialects(self, engine):
        """Test understanding of Romanian regional variations"""
        dialect_texts = [
            "În Moldova spunem altfel decât în Muntenia.",  # Regional differences
            "Vorbim ardelenește în Transilvania.",  # Transylvanian dialect
            "În Banat avem expresii specifice."  # Banat regional expressions
        ]
        
        for text in dialect_texts:
            result = await engine.analyze_cultural_context(text)
            result_text = str(result).lower()
            
            # Should recognize regional context
            assert 'regional' in result_text or 'dialect' in result_text or 'moldova' in result_text or \
                   'transilvania' in result_text or 'banat' in result_text or 'cultural' in result_text, \
                f"Expected regional recognition for: {text}, got: {result_text}"

if __name__ == "__main__":
    # Run specific tests
    pytest.main([__file__, "-v"])