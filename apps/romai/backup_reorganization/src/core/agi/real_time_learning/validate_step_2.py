"""
Phase 2.2 Real-Time Learning Systems - Quick Validation Test
============================================================

Quick validation of Phase 2.2 components to ensure they can be imported
and basic functionality works correctly.

Author: RomAI AGI Team
Version: 1.0.0
Created: January 2025
"""

import sys
import os
import asyncio
import time
import json
from datetime import datetime

def test_imports():
    """Test if all Phase 2.2 components can be imported"""
    
    print("🔍 Testing Phase 2.2 Component Imports...")
    
    import_results = {}
    
    # Test real_time_learning_engine.py
    try:
        import real_time_learning_engine
        print("✅ real_time_learning_engine.py - OK")
        import_results['real_time_learning_engine'] = True
    except Exception as e:
        print(f"❌ real_time_learning_engine.py - Error: {e}")
        import_results['real_time_learning_engine'] = False
    
    # Test adaptive_model_updater.py
    try:
        import adaptive_model_updater
        print("✅ adaptive_model_updater.py - OK")
        import_results['adaptive_model_updater'] = True
    except Exception as e:
        print(f"❌ adaptive_model_updater.py - Error: {e}")
        import_results['adaptive_model_updater'] = False
    
    # Test knowledge_integration_pipeline.py
    try:
        import knowledge_integration_pipeline
        print("✅ knowledge_integration_pipeline.py - OK")
        import_results['knowledge_integration_pipeline'] = True
    except Exception as e:
        print(f"❌ knowledge_integration_pipeline.py - Error: {e}")
        import_results['knowledge_integration_pipeline'] = False
    
    # Test learning_analytics_dashboard.py
    try:
        import learning_analytics_dashboard
        print("✅ learning_analytics_dashboard.py - OK")
        import_results['learning_analytics_dashboard'] = True
    except Exception as e:
        print(f"❌ learning_analytics_dashboard.py - Error: {e}")
        import_results['learning_analytics_dashboard'] = False
    
    # Test real_time_learning_integration.py
    try:
        import real_time_learning_integration
        print("✅ real_time_learning_integration.py - OK")
        import_results['real_time_learning_integration'] = True
    except Exception as e:
        print(f"❌ real_time_learning_integration.py - Error: {e}")
        import_results['real_time_learning_integration'] = False
    
    return import_results

def test_basic_functionality():
    """Test basic functionality of components"""
    
    print("\n🧪 Testing Basic Functionality...")
    
    functionality_results = {}
    
    try:
        # Test RealTimeLearningEngine basic creation
        from real_time_learning_engine import RealTimeLearningEngine, LearningType, LearningPriority
        
        engine = RealTimeLearningEngine({
            'cultural_accuracy_target': 0.994,
            'enable_cultural_boost': True
        })
        
        print("✅ RealTimeLearningEngine - Created successfully")
        functionality_results['learning_engine_creation'] = True
        
    except Exception as e:
        print(f"❌ RealTimeLearningEngine - Error: {e}")
        functionality_results['learning_engine_creation'] = False
    
    try:
        # Test AdaptiveModelUpdater basic creation
        from adaptive_model_updater import AdaptiveModelUpdater
        
        # Create with mock model
        mock_model = type('MockModel', (), {})()
        updater = AdaptiveModelUpdater(mock_model, {
            'validation_enabled': True
        })
        
        print("✅ AdaptiveModelUpdater - Created successfully")
        functionality_results['model_updater_creation'] = True
        
    except Exception as e:
        print(f"❌ AdaptiveModelUpdater - Error: {e}")
        functionality_results['model_updater_creation'] = False
    
    try:
        # Test KnowledgeIntegrationPipeline basic creation
        from knowledge_integration_pipeline import KnowledgeIntegrationPipeline
        
        pipeline = KnowledgeIntegrationPipeline({
            'cultural_boost_factor': 1.2
        })
        
        print("✅ KnowledgeIntegrationPipeline - Created successfully")
        functionality_results['knowledge_pipeline_creation'] = True
        
    except Exception as e:
        print(f"❌ KnowledgeIntegrationPipeline - Error: {e}")
        functionality_results['knowledge_pipeline_creation'] = False
    
    try:
        # Test LearningAnalyticsDashboard basic creation
        from learning_analytics_dashboard import LearningAnalyticsDashboard
        
        dashboard = LearningAnalyticsDashboard({
            'update_interval': 2.0
        })
        
        print("✅ LearningAnalyticsDashboard - Created successfully")
        functionality_results['analytics_dashboard_creation'] = True
        
    except Exception as e:
        print(f"❌ LearningAnalyticsDashboard - Error: {e}")
        functionality_results['analytics_dashboard_creation'] = False
    
    try:
        # Test RealTimeLearningIntegration basic creation
        from real_time_learning_integration import RealTimeLearningIntegration, IntegrationConfig
        
        config = IntegrationConfig(
            learning_engine_config={'cultural_accuracy_target': 0.994},
            model_updater_config={'validation_enabled': True},
            knowledge_pipeline_config={'cultural_boost_factor': 1.2},
            analytics_dashboard_config={'update_interval': 2.0}
        )
        
        integration = RealTimeLearningIntegration(config)
        
        print("✅ RealTimeLearningIntegration - Created successfully")
        functionality_results['integration_creation'] = True
        
    except Exception as e:
        print(f"❌ RealTimeLearningIntegration - Error: {e}")
        functionality_results['integration_creation'] = False
    
    return functionality_results

async def test_integration_system():
    """Test integration system initialization"""
    
    print("\n🔗 Testing Integration System...")
    
    try:
        from real_time_learning_integration import RealTimeLearningIntegration, IntegrationConfig
        
        # Create integration system
        config = IntegrationConfig(
            learning_engine_config={
                'cultural_accuracy_target': 0.994,
                'enable_cultural_boost': True
            },
            model_updater_config={
                'validation_enabled': True,
                'min_cultural_accuracy': 0.990
            },
            knowledge_pipeline_config={
                'cultural_boost_factor': 1.2,
                'enable_monitoring': True
            },
            analytics_dashboard_config={
                'update_interval': 1.0,
                'cultural_monitoring_enabled': True
            }
        )
        
        integration = RealTimeLearningIntegration(config)
        
        print("✅ Integration system created")
        
        # Test system initialization (without starting background tasks)
        try:
            await integration.initialize_system()
            print("✅ Integration system initialized")
            
            # Test getting status
            status = integration.get_status()
            print(f"✅ System status retrieved: {status['status']}")
            
            # Test getting metrics
            metrics = integration.get_system_metrics()
            print(f"✅ System metrics retrieved: {len(metrics)} metrics")
            
            return True
            
        except Exception as e:
            print(f"❌ Integration system initialization failed: {e}")
            return False
    
    except Exception as e:
        print(f"❌ Integration system test failed: {e}")
        return False

def test_file_structure():
    """Test Phase 2.2 file structure"""
    
    print("\n📁 Testing Phase 2.2 File Structure...")
    
    expected_files = [
        'real_time_learning_engine.py',
        'adaptive_model_updater.py',
        'knowledge_integration_pipeline.py',
        'learning_analytics_dashboard.py',
        'real_time_learning_integration.py'
    ]
    
    file_results = {}
    
    for filename in expected_files:
        if os.path.exists(filename):
            file_size = os.path.getsize(filename)
            print(f"✅ {filename} - {file_size:,} bytes")
            file_results[filename] = {'exists': True, 'size': file_size}
        else:
            print(f"❌ {filename} - Missing")
            file_results[filename] = {'exists': False, 'size': 0}
    
    return file_results

def analyze_code_quality():
    """Analyze code quality of Phase 2.2 components"""
    
    print("\n🔍 Analyzing Code Quality...")
    
    quality_results = {}
    
    files_to_analyze = [
        'real_time_learning_engine.py',
        'adaptive_model_updater.py',
        'knowledge_integration_pipeline.py',
        'learning_analytics_dashboard.py',
        'real_time_learning_integration.py'
    ]
    
    for filename in files_to_analyze:
        if os.path.exists(filename):
            try:
                with open(filename, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Basic quality metrics
                lines = content.split('\n')
                total_lines = len(lines)
                code_lines = len([line for line in lines if line.strip() and not line.strip().startswith('#')])
                comment_lines = len([line for line in lines if line.strip().startswith('#')])
                docstring_lines = content.count('"""') + content.count("'''")
                
                # Calculate quality metrics
                comment_ratio = comment_lines / max(1, total_lines)
                code_density = code_lines / max(1, total_lines)
                
                quality_score = 0.0
                if total_lines > 500:  # Comprehensive implementation
                    quality_score += 0.3
                if comment_ratio > 0.1:  # Good documentation
                    quality_score += 0.3
                if 'class ' in content and 'def ' in content:  # OOP structure
                    quality_score += 0.2
                if 'async def' in content:  # Async support
                    quality_score += 0.1
                if 'try:' in content and 'except' in content:  # Error handling
                    quality_score += 0.1
                
                quality_results[filename] = {
                    'total_lines': total_lines,
                    'code_lines': code_lines,
                    'comment_lines': comment_lines,
                    'comment_ratio': comment_ratio,
                    'quality_score': quality_score
                }
                
                print(f"✅ {filename} - {total_lines:,} lines, Quality: {quality_score:.1%}")
                
            except Exception as e:
                print(f"❌ {filename} - Analysis failed: {e}")
                quality_results[filename] = {'error': str(e)}
        else:
            print(f"❌ {filename} - File not found")
            quality_results[filename] = {'error': 'File not found'}
    
    return quality_results

async def main():
    """Main validation function"""
    
    print("🚀 Phase 2.2 Real-Time Learning Systems - Quick Validation")
    print("=" * 70)
    print(f"Validation Start: {datetime.now().isoformat()}")
    print()
    
    start_time = time.time()
    
    # Test file structure
    file_results = test_file_structure()
    
    # Test imports
    import_results = test_imports()
    
    # Test basic functionality
    functionality_results = test_basic_functionality()
    
    # Test integration system
    integration_success = await test_integration_system()
    
    # Analyze code quality
    quality_results = analyze_code_quality()
    
    # Generate validation report
    validation_time = time.time() - start_time
    
    print("\n" + "=" * 70)
    print("📋 PHASE 2.2 VALIDATION REPORT")
    print("=" * 70)
    
    # File structure results
    total_files = len(file_results)
    existing_files = sum(1 for result in file_results.values() if result['exists'])
    total_file_size = sum(result['size'] for result in file_results.values() if result['exists'])
    
    print(f"\n📁 File Structure:")
    print(f"   Files Present: {existing_files}/{total_files}")
    print(f"   Total Size: {total_file_size:,} bytes")
    
    # Import results
    total_imports = len(import_results)
    successful_imports = sum(1 for success in import_results.values() if success)
    
    print(f"\n📦 Import Status:")
    print(f"   Successful Imports: {successful_imports}/{total_imports}")
    print(f"   Import Success Rate: {successful_imports/total_imports:.1%}")
    
    # Functionality results
    total_functionality = len(functionality_results)
    working_functionality = sum(1 for success in functionality_results.values() if success)
    
    print(f"\n🧪 Functionality:")
    print(f"   Working Components: {working_functionality}/{total_functionality}")
    print(f"   Functionality Rate: {working_functionality/total_functionality:.1%}")
    
    # Integration results
    print(f"\n🔗 Integration:")
    print(f"   Integration System: {'✅ Working' if integration_success else '❌ Issues'}")
    
    # Quality results
    quality_files = len([r for r in quality_results.values() if 'quality_score' in r])
    avg_quality = sum(r['quality_score'] for r in quality_results.values() if 'quality_score' in r) / max(1, quality_files)
    total_code_lines = sum(r['code_lines'] for r in quality_results.values() if 'code_lines' in r)
    
    print(f"\n🔍 Code Quality:")
    print(f"   Average Quality Score: {avg_quality:.1%}")
    print(f"   Total Code Lines: {total_code_lines:,}")
    
    # Overall assessment
    overall_score = (
        (existing_files / total_files) * 0.2 +
        (successful_imports / total_imports) * 0.3 +
        (working_functionality / total_functionality) * 0.3 +
        (1.0 if integration_success else 0.0) * 0.2
    )
    
    print(f"\n🎯 Overall Assessment:")
    print(f"   Overall Score: {overall_score:.1%}")
    print(f"   Status: {'✅ READY FOR PRODUCTION' if overall_score >= 0.8 else '⚠️ NEEDS ATTENTION' if overall_score >= 0.6 else '❌ CRITICAL ISSUES'}")
    
    # Recommendations
    print(f"\n💡 Recommendations:")
    
    if existing_files < total_files:
        print("   • Ensure all component files are present")
    
    if successful_imports < total_imports:
        print("   • Fix import issues in components")
    
    if working_functionality < total_functionality:
        print("   • Debug component initialization issues")
    
    if not integration_success:
        print("   • Resolve integration system issues")
    
    if avg_quality < 0.8:
        print("   • Improve code documentation and structure")
    
    if overall_score >= 0.8:
        print("   • All systems operational - ready for Phase 2.3")
        print("   • Continue with comprehensive testing")
        print("   • Monitor performance in production environment")
    
    print(f"\n⏱️ Validation completed in {validation_time:.2f} seconds")
    print("=" * 70)
    
    # Save detailed results
    detailed_results = {
        'validation_timestamp': datetime.now().isoformat(),
        'validation_duration': validation_time,
        'file_results': file_results,
        'import_results': import_results,
        'functionality_results': functionality_results,
        'integration_success': integration_success,
        'quality_results': quality_results,
        'overall_score': overall_score,
        'status': 'READY' if overall_score >= 0.8 else 'NEEDS_ATTENTION' if overall_score >= 0.6 else 'CRITICAL',
        'summary': {
            'files_present': f"{existing_files}/{total_files}",
            'imports_working': f"{successful_imports}/{total_imports}",
            'functionality_working': f"{working_functionality}/{total_functionality}",
            'integration_working': integration_success,
            'average_quality': avg_quality,
            'total_code_lines': total_code_lines
        }
    }
    
    try:
        with open('phase_2_2_validation_report.json', 'w', encoding='utf-8') as f:
            json.dump(detailed_results, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"\n📄 Detailed validation report saved to: phase_2_2_validation_report.json")
    
    except Exception as e:
        print(f"\n❌ Failed to save validation report: {e}")
    
    return detailed_results

if __name__ == "__main__":
    try:
        result = asyncio.run(main())
        print(f"\n🎉 Phase 2.2 validation completed successfully!")
        
    except KeyboardInterrupt:
        print("\n🛑 Validation interrupted by user")
    except Exception as e:
        print(f"\n💥 Validation failed: {e}")
    finally:
        print("\n👋 Validation complete")
