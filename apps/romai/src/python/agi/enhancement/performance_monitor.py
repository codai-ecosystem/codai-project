"""
RomAI Real-Time Performance Monitor
Monitors actual AGI performance and provides enhancement recommendations.
"""

import asyncio
import json
import aiohttp
import numpy as np
from datetime import datetime
from typing import Dict, Any, List

class RealTimeMonitor:
    """Real-time performance monitoring for RomAI AGI"""
    
    def __init__(self, base_url: str = "http://localhost:6100"):
        self.base_url = base_url
        
    async def get_capability_scores(self) -> Dict[str, float]:
        """Get current capability scores"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/api/agi/capability-scores") as response:
                    data = await response.json()
                    return data.get("data", {})
        except Exception as e:
            print(f"Error getting capability scores: {e}")
            return {}
    
    async def get_system_health(self) -> Dict[str, Any]:
        """Get system health metrics"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/api/health") as response:
                    return await response.json()
        except Exception as e:
            print(f"Error getting system health: {e}")
            return {}
    
    async def get_analytics(self) -> Dict[str, Any]:
        """Get analytics data"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/api/analytics") as response:
                    data = await response.json()
                    return data.get("data", {})
        except Exception as e:
            print(f"Error getting analytics: {e}")
            return {}
    
    async def analyze_performance(self) -> Dict[str, Any]:
        """Comprehensive performance analysis"""
        
        print("🔍 Analyzing RomAI AGI Performance...")
        print("=" * 50)
        
        # Get all metrics
        capabilities = await self.get_capability_scores()
        health = await self.get_system_health()
        analytics = await self.get_analytics()
        
        if not capabilities:
            print("❌ Unable to retrieve capability data")
            return {}
        
        # Calculate overall performance
        capability_scores = []
        for value in capabilities.values():
            if isinstance(value, (int, float)):
                capability_scores.append(float(value))
            elif isinstance(value, str) and value.replace('.', '').replace('-', '').isdigit():
                try:
                    capability_scores.append(float(value))
                except ValueError:
                    continue  # Skip non-numeric strings
        
        if capability_scores:
            overall_score = sum(capability_scores) / len(capability_scores)
        else:
            overall_score = 0
        
        # Identify strengths and weaknesses
        numeric_capabilities = {}
        for k, v in capabilities.items():
            if isinstance(v, (int, float)):
                numeric_capabilities[k] = float(v)
            elif isinstance(v, str) and v.replace('.', '').replace('-', '').isdigit():
                try:
                    numeric_capabilities[k] = float(v)
                except ValueError:
                    continue  # Skip non-numeric values
        
        strengths = [(k, v) for k, v in numeric_capabilities.items() if v >= 90]
        needs_improvement = [(k, v) for k, v in numeric_capabilities.items() if v < 85]
        
        # Performance analysis
        analysis = {
            "timestamp": datetime.now().isoformat(),
            "overall_score": overall_score,
            "capabilities": capabilities,
            "numeric_capabilities": numeric_capabilities,
            "strengths": strengths,
            "needs_improvement": needs_improvement,
            "health_status": health.get("status", "unknown"),
            "response_time": health.get("responseTime", "unknown"),
            "analytics": analytics
        }
        
        # Display results
        print(f"🎯 Overall AGI Score: {overall_score:.2f}%")
        print(f"📊 Health Status: {health.get('status', 'unknown')}")
        print(f"⚡ Response Time: {health.get('responseTime', 'unknown')}")
        
        print(f"\n💪 Strengths (≥90%):")
        for capability, score in strengths:
            print(f"  ✅ {capability}: {score:.2f}%")
        
        print(f"\n⚠️  Areas for Improvement (<85%):")
        for capability, score in needs_improvement:
            print(f"  🔧 {capability}: {score:.2f}%")
        
        print(f"\n📈 All Capability Scores:")
        for capability, score in sorted(numeric_capabilities.items(), key=lambda x: x[1], reverse=True):
            status = "✅" if score >= 90 else "⚠️" if score >= 85 else "🔧"
            print(f"  {status} {capability}: {score:.2f}%")
        
        # Recommendations
        recommendations = self.generate_recommendations(analysis)
        
        print(f"\n🎯 Enhancement Recommendations:")
        for i, rec in enumerate(recommendations, 1):
            print(f"  {i}. {rec}")
        
        return analysis
    
    def generate_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate enhancement recommendations based on analysis"""
        
        recommendations = []
        needs_improvement = analysis["needs_improvement"]
        overall_score = analysis["overall_score"]
        
        # Overall performance recommendations
        if overall_score < 85:
            recommendations.append("🚨 CRITICAL: Overall performance below 85% - implement comprehensive optimization")
        elif overall_score < 90:
            recommendations.append("📈 Focus on improving weakest capabilities for balanced performance")
        
        # Specific capability recommendations
        for capability, score in needs_improvement:
            if "autonomy" in capability and score < 80:
                recommendations.append(f"🤖 Enhance autonomous decision-making and self-monitoring systems")
            elif "creativity" in capability and score < 85:
                recommendations.append(f"🎨 Implement divergent thinking and Romanian creative pattern training")
            elif "mathematical" in capability and score < 87:
                recommendations.append(f"📐 Strengthen symbolic reasoning and proof verification systems")
            elif "reasoning" in capability and score < 89:
                recommendations.append(f"🧠 Improve logical inference and causal reasoning capabilities")
            elif "ethical" in capability and score < 90:
                recommendations.append(f"⚖️ Enhance ethical reasoning framework with Romanian cultural values")
        
        # Romanian-specific recommendations
        numeric_capabilities = analysis.get("numeric_capabilities", {})
        romanian_fluency = 0
        for k, v in numeric_capabilities.items():
            if "romanian" in k.lower() or "fluency" in k.lower():
                romanian_fluency = v
                break
        
        if romanian_fluency < 95:
            recommendations.append(f"🇷🇴 Expand Romanian corpus training and cultural pattern recognition")
        
        # Performance recommendations
        response_time = analysis.get("response_time", "")
        if "ms" in str(response_time) and int(response_time.replace("ms", "")) > 1000:
            recommendations.append("⚡ Optimize response time through caching and algorithm improvements")
        
        if not recommendations:
            recommendations.append("🎉 Excellent performance! Focus on maintaining current capabilities")
        
        return recommendations

async def main():
    """Main monitoring function"""
    
    monitor = RealTimeMonitor()
    analysis = await monitor.analyze_performance()
    
    if analysis:
        print(f"\n📊 Performance Analysis Complete")
        print(f"🎯 Overall Score: {analysis['overall_score']:.2f}%")
        print(f"💪 Strengths: {len(analysis['strengths'])}")
        print(f"🔧 Areas for Improvement: {len(analysis['needs_improvement'])}")
    else:
        print("❌ Performance analysis failed")

if __name__ == "__main__":
    asyncio.run(main())
