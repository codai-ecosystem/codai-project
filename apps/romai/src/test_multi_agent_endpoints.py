#!/usr/bin/env python3
"""
Test Multi-Agent Reasoning System Endpoints
"""

import requests
import json
import sys

def test_multi_agent_endpoints():
    """Test multi-agent reasoning system endpoints"""
    
    base_url = "http://localhost:6101"
    
    print("🧪 Testing Multi-Agent Reasoning System Endpoints...")
    print("=" * 60)
    
    # Test 1: System Status
    print("1️⃣ Testing system status endpoint...")
    try:
        response = requests.get(f"{base_url}/api/v3/multi-agent/system-status")
        if response.status_code == 200:
            status = response.json()
            print("✅ System status endpoint working!")
            system_status = status.get("system_status", {})
            capabilities = status.get("multi_agent_capabilities", {})
            
            print(f"   📊 System health: {system_status.get('system_health', 'unknown')}")
            print(f"   🤖 Total agents: {capabilities.get('specialized_agents', 0)}")
            print(f"   🌍 Domain coverage: {len(capabilities.get('domain_coverage', []))}")
            print(f"   📈 Problems solved: {capabilities.get('problems_solved', 0)}")
        else:
            print(f"❌ Status endpoint returned {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Status endpoint test failed: {e}")
    
    print()
    
    # Test 2: Problem Solving
    print("2️⃣ Testing problem solving endpoint...")
    
    problem_request = {
        "problem": {
            "problem_id": "test_endpoint_001",
            "description": "Calculează aria unui triunghi cu baza 5 și înălțimea 3, apoi explică semnificația geometriei în cultura românească",
            "problem_type": "mathematical_cultural",
            "complexity": "moderate",
            "domains_required": ["mathematical", "cultural"],
            "cultural_requirements": {
                "romanian_context": True,
                "educational_format": True
            },
            "quality_threshold": 0.8
        },
        "collaboration_mode": "hierarchical"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/v3/multi-agent/solve-problem",
            json=problem_request,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Problem solving endpoint working!")
            
            solution = result.get("solution", {})
            print(f"   📈 Reasoning quality: {solution.get('reasoning_quality', 0):.2f}")
            print(f"   🇷🇴 Cultural integration: {solution.get('cultural_integration_score', 0):.2f}")
            print(f"   🤝 Collaboration effectiveness: {solution.get('collaboration_effectiveness', 0):.2f}")
            print(f"   👥 Contributing agents: {len(solution.get('contributing_agents', []))}")
            print(f"   ⏱️ Solving time: {result.get('solving_time_seconds', 0):.2f}s")
            
            # Show agent contributions
            contributions = result.get("agent_contributions", [])
            print(f"   🔍 Agent contributions:")
            for contrib in contributions[:3]:  # Show first 3
                agent_id = contrib.get("agent_id", "unknown")
                domain = contrib.get("domain", "unknown")
                confidence = contrib.get("confidence", 0)
                print(f"      • {agent_id} ({domain}): {confidence:.2f} confidence")
                
        else:
            print(f"❌ Problem solving endpoint returned {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Problem solving endpoint test failed: {e}")
    
    print()
    
    # Test 3: Multi-Agent Collaboration
    print("3️⃣ Testing collaboration endpoint...")
    
    collab_request = {
        "task_description": "Analizează impactul tehnologiei asupra educației în România și propune soluții inovative",
        "agents_requested": ["analytical", "creative", "cultural"],
        "collaboration_mode": "democratic",
        "cultural_context": {
            "romanian_education_system": True,
            "technology_adoption": True
        }
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/v3/multi-agent/collaborate",
            json=collab_request,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Collaboration endpoint working!")
            
            collab_result = result.get("collaboration_result", {})
            print(f"   🤝 Collaboration effectiveness: {collab_result.get('collaboration_effectiveness', 0):.2f}")
            print(f"   🇷🇴 Cultural integration: {collab_result.get('cultural_integration', 0):.2f}")
            print(f"   👥 Agent participation: {collab_result.get('agent_participation', 0)}")
            print(f"   ⏱️ Execution time: {result.get('execution_time_seconds', 0):.2f}s")
            
        else:
            print(f"❌ Collaboration endpoint returned {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Collaboration endpoint test failed: {e}")
    
    print()
    
    # Test 4: Cultural Reasoning
    print("4️⃣ Testing cultural reasoning endpoint...")
    
    cultural_request = {
        "query": "Explică tradițiile de Crăciun din România și cum pot fi adaptate în era digitală",
        "cultural_context": {
            "traditional_focus": True,
            "modern_adaptation": True
        },
        "reasoning_depth": "complex"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/v3/multi-agent/cultural-reasoning",
            json=cultural_request,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Cultural reasoning endpoint working!")
            
            cultural = result.get("cultural_reasoning", {})
            analysis = result.get("reasoning_analysis", {})
            
            print(f"   🇷🇴 Cultural appropriateness: {cultural.get('cultural_appropriateness', 'unknown')}")
            print(f"   📊 Cultural integration score: {cultural.get('cultural_integration_score', 0):.2f}")
            print(f"   🧠 Reasoning quality: {analysis.get('reasoning_quality', 0):.2f}")
            print(f"   🌍 Domains integrated: {len(analysis.get('domains_integrated', []))}")
            print(f"   ⏱️ Reasoning time: {result.get('reasoning_time_seconds', 0):.2f}s")
            
        else:
            print(f"❌ Cultural reasoning endpoint returned {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Cultural reasoning endpoint test failed: {e}")
    
    print()
    print("=" * 60)
    print("🎯 Multi-Agent Reasoning Endpoint Testing Complete!")

if __name__ == "__main__":
    try:
        test_multi_agent_endpoints()
        print("✅ All endpoint tests completed")
    except KeyboardInterrupt:
        print("\n⚠️ Test interrupted by user")
    except Exception as e:
        print(f"❌ Test suite failed: {e}")
        sys.exit(1)