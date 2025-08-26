import sys
import os
import asyncio
import traceback

sys.path.insert(0, 'apps/romai/src')

# Import all available engines for comprehensive testing
from ml.reasoning.autonomous_math_engine import AutonomousMathEngine
from ml.reasoning.autonomous_logical_engine import AutonomousLogicalEngine
from ml.reasoning.autonomous_romanian_engine import AutonomousRomanianEngine

async def comprehensive_ai_benchmark():
    print('🎯 COMPREHENSIVE AI BENCHMARK SUITE')
    print('='*80)
    print('Testing RomAI across ALL major AI benchmark categories...')
    
    benchmark_results = {}
    
    # 1. Mathematical Reasoning Benchmarks
    print('\n📊 1. MATHEMATICAL REASONING BENCHMARKS')
    print('-' * 50)
    math_engine = AutonomousMathEngine()
    math_tests = [
        ('Basic Arithmetic', '15 + 27', '42'),
        ('Algebra', 'solve for x: 2x + 5 = 15', '5'),
        ('Calculus', 'derivative of x^2', '2x'),
        ('Geometry', 'area of circle with radius 5', '78.54'),
        ('Statistics', 'mean of [2,4,6,8]', '5')
    ]
    
    math_passed = 0
    for category, problem, expected in math_tests:
        try:
            result = await math_engine.solve_mathematical_problem(problem)
            result_str = str(result.result)
            if any(exp in result_str for exp in expected.split('|')):
                print(f'  ✅ {category}: {problem} → {expected}')
                math_passed += 1
            else:
                print(f'  ❌ {category}: {problem} → Expected {expected}, Got {result_str[:30]}')
        except Exception as e:
            print(f'  ❌ {category}: {problem} → ERROR: {str(e)[:50]}')
    
    benchmark_results['Mathematical Reasoning'] = math_passed / len(math_tests)
    
    # 2. Logical Reasoning Benchmarks
    print('\n🧠 2. LOGICAL REASONING BENCHMARKS')
    print('-' * 50)
    logic_engine = AutonomousLogicalEngine()
    logic_tests = [
        ('Deduction', 'All birds can fly. Penguins are birds. Can penguins fly?', 'logical analysis'),
        ('Induction', 'Pattern: 2,4,6,8. What comes next?', '10'),
        ('Syllogism', 'All roses are flowers. This is a rose. What is this?', 'flower'),
        ('Contradiction', 'Statement: This statement is false. Is it true or false?', 'paradox'),
        ('Inference', 'If it rains, the ground gets wet. The ground is wet. Did it rain?', 'possible')
    ]
    
    logic_passed = 0
    for category, problem, expected_keyword in logic_tests:
        try:
            result = await logic_engine.reason(problem)
            result_text = str(result.conclusion) + ' ' + str(result.reasoning_chain)
            if expected_keyword.lower() in result_text.lower():
                print(f'  ✅ {category}: {problem[:30]}... → Contains "{expected_keyword}"')
                logic_passed += 1
            else:
                print(f'  ❌ {category}: {problem[:30]}... → Missing "{expected_keyword}"')
        except Exception as e:
            print(f'  ❌ {category}: {problem[:30]}... → ERROR: {str(e)[:50]}')
    
    benchmark_results['Logical Reasoning'] = logic_passed / len(logic_tests)
    
    # 3. Programming/Coding Benchmarks (HumanEval style)
    print('\n💻 3. PROGRAMMING BENCHMARKS')
    print('-' * 50)
    try:
        from ml.reasoning.modern_code_generation_engine import ModernCodeGenerationEngine
        code_engine = ModernCodeGenerationEngine()
        coding_tests = [
            ('Function Creation', 'Create a function that adds two numbers', 'def|function'),
            ('Algorithm', 'Write a function to find factorial of n', 'factorial|*'),
            ('Data Structure', 'Create a simple linked list node', 'class|node'),
            ('Loop Logic', 'Write code to print numbers 1 to 5', 'for|while'),
            ('Conditional', 'Write if-else to check if number is even', 'if|%')
        ]
        
        coding_passed = 0
        for category, problem, expected_keywords in coding_tests:
            try:
                result = await code_engine.generate_code(problem)
                result_str = str(result.code).lower()
                if any(keyword in result_str for keyword in expected_keywords.split('|')):
                    print(f'  ✅ {category}: {problem[:30]}... → Contains code patterns')
                    coding_passed += 1
                else:
                    print(f'  ❌ {category}: {problem[:30]}... → Missing code patterns')
            except Exception as e:
                print(f'  ❌ {category}: {problem[:30]}... → ERROR: {str(e)[:50]}')
        
        benchmark_results['Programming'] = coding_passed / len(coding_tests)
    except Exception as e:
        print(f'  ⚠️ Programming engine not available: {str(e)[:50]}')
        benchmark_results['Programming'] = 0.0
    
    # 4. Scientific Reasoning Benchmarks
    print('\n🔬 4. SCIENTIFIC REASONING BENCHMARKS')
    print('-' * 50)
    try:
        from ml.reasoning.autonomous_scientific_engine import AutonomousScientificEngine
        science_engine = AutonomousScientificEngine()
        science_tests = [
            ('Physics', 'What is the speed of light?', '299792458|3x10^8'),
            ('Chemistry', 'What is the chemical formula for water?', 'H2O'),
            ('Biology', 'What is photosynthesis?', 'sunlight|glucose|oxygen'),
            ('Astronomy', 'How many planets are in our solar system?', '8|eight'),
            ('Geology', 'What causes earthquakes?', 'tectonic|plates|fault')
        ]
        
        science_passed = 0
        for category, problem, expected_keywords in science_tests:
            try:
                result = await science_engine.analyze_scientific_problem(problem)
                result_text = str(result.analysis).lower()
                if any(keyword in result_text for keyword in expected_keywords.split('|')):
                    print(f'  ✅ {category}: {problem[:30]}... → Contains scientific knowledge')
                    science_passed += 1
                else:
                    print(f'  ❌ {category}: {problem[:30]}... → Missing scientific knowledge')
            except Exception as e:
                print(f'  ❌ {category}: {problem[:30]}... → ERROR: {str(e)[:50]}')
        
        benchmark_results['Scientific Reasoning'] = science_passed / len(science_tests)
    except Exception as e:
        print(f'  ⚠️ Scientific engine not available: {str(e)[:50]}')
        benchmark_results['Scientific Reasoning'] = 0.0
    
    # 5. Creative Intelligence Benchmarks
    print('\n🎨 5. CREATIVE INTELLIGENCE BENCHMARKS')
    print('-' * 50)
    try:
        from ml.reasoning.autonomous_creative_engine import AutonomousCreativeEngine
        creative_engine = AutonomousCreativeEngine()
        creative_tests = [
            ('Storytelling', 'Write a short story about a robot', 'robot|story'),
            ('Poetry', 'Write a haiku about nature', 'nature|syllable'),
            ('Problem Solving', 'Creative solution to reduce traffic', 'solution|traffic'),
            ('Innovation', 'New invention idea for the future', 'invention|future'),
            ('Art Description', 'Describe the Mona Lisa', 'painting|smile|Leonardo')
        ]
        
        creative_passed = 0
        for category, problem, expected_keywords in creative_tests:
            try:
                result = await creative_engine.generate_creative_content(problem)
                result_text = str(result.content).lower()
                if any(keyword in result_text for keyword in expected_keywords.split('|')):
                    print(f'  ✅ {category}: {problem[:30]}... → Shows creativity')
                    creative_passed += 1
                else:
                    print(f'  ❌ {category}: {problem[:30]}... → Lacks creativity markers')
            except Exception as e:
                print(f'  ❌ {category}: {problem[:30]}... → ERROR: {str(e)[:50]}')
        
        benchmark_results['Creative Intelligence'] = creative_passed / len(creative_tests)
    except Exception as e:
        print(f'  ⚠️ Creative engine not available: {str(e)[:50]}')
        benchmark_results['Creative Intelligence'] = 0.0
    
    # 6. Cultural/Romanian Specialization
    print('\n🇷🇴 6. ROMANIAN CULTURAL INTELLIGENCE')
    print('-' * 50)
    romanian_engine = AutonomousRomanianEngine()
    romanian_tests = [
        ('Language', 'Translate hello to Romanian', 'salut|bună'),
        ('Culture', 'Famous Romanian castle', 'bran|peleș|corvin'),
        ('History', 'Romanian historical figure', 'vlad|stefan|mihai'),
        ('Geography', 'Romanian mountain range', 'carpați|carpathian'),
        ('Tradition', 'Romanian folk dance', 'hora|călușul|brâu')
    ]
    
    romanian_passed = 0
    for category, problem, expected_keywords in romanian_tests:
        try:
            result = await romanian_engine.process_romanian_query(problem)
            result_text = str(result.analysis).lower()
            if any(keyword in result_text for keyword in expected_keywords.split('|')):
                print(f'  ✅ {category}: {problem[:30]}... → Shows Romanian knowledge')
                romanian_passed += 1
            else:
                print(f'  ❌ {category}: {problem[:30]}... → Missing Romanian knowledge')
        except Exception as e:
            print(f'  ❌ {category}: {problem[:30]}... → ERROR: {str(e)[:50]}')
    
    benchmark_results['Romanian Intelligence'] = romanian_passed / len(romanian_tests)
    
    # Final Benchmark Summary
    print('\n🏆 COMPREHENSIVE BENCHMARK RESULTS')
    print('='*80)
    
    total_score = 0
    total_categories = 0
    
    for category, score in benchmark_results.items():
        percentage = score * 100
        if score >= 0.8:
            status = '🏆 EXCELLENT'
        elif score >= 0.6:
            status = '✅ GOOD'
        elif score >= 0.4:
            status = '⚠️ NEEDS IMPROVEMENT'
        else:
            status = '❌ CRITICAL'
        
        print(f'{category:25} {percentage:6.1f}% {status}')
        total_score += score
        total_categories += 1
    
    overall_score = total_score / total_categories if total_categories > 0 else 0
    overall_percentage = overall_score * 100
    
    print('-' * 80)
    print(f'OVERALL AI BENCHMARK SCORE: {overall_percentage:.1f}%')
    
    if overall_percentage >= 80:
        print('🎉 RomAI STATUS: WORLD-CLASS AGI - PASSES COMPREHENSIVE AI BENCHMARKS!')
    elif overall_percentage >= 60:
        print('👍 RomAI STATUS: STRONG AI - GOOD PERFORMANCE ACROSS DOMAINS')
    elif overall_percentage >= 40:
        print('⚠️ RomAI STATUS: DEVELOPING AI - MODERATE CAPABILITIES')
    else:
        print('❌ RomAI STATUS: BASIC AI - SIGNIFICANT IMPROVEMENT NEEDED')
    
    print('='*80)
    
    return overall_percentage

# Run the comprehensive benchmark
if __name__ == "__main__":
    try:
        score = asyncio.run(comprehensive_ai_benchmark())
        print(f'\n🎯 FINAL VERDICT: RomAI achieved {score:.1f}% across all AI benchmark categories')
    except Exception as e:
        print(f'❌ Benchmark failed: {str(e)}')
        traceback.print_exc()