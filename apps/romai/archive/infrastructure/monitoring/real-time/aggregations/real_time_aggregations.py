# ROMAI Real-time Elasticsearch Aggregations
# Advanced aggregation queries for real-time analytics and monitoring

from elasticsearch import Elasticsearch
from datetime import datetime, timedelta
import json
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import asyncio
import time

logger = logging.getLogger(__name__)

@dataclass
class AggregationResult:
    name: str
    timestamp: str
    data: Dict[str, Any]
    execution_time_ms: float

class RealTimeAggregations:
    def __init__(self, es_host: str = "http://localhost:9200", 
                 username: str = "elastic", password: str = "elastic_secure_2025"):
        self.es_client = Elasticsearch(
            hosts=[es_host],
            http_auth=(username, password),
            verify_certs=False,
            ssl_show_warn=False
        )
        
    def get_time_range(self, minutes: int = 15) -> Dict[str, str]:
        """Get time range for aggregations"""
        now = datetime.utcnow()
        past = now - timedelta(minutes=minutes)
        
        return {
            "gte": past.isoformat(),
            "lte": now.isoformat()
        }

    async def real_time_log_volume(self, time_window_minutes: int = 15) -> AggregationResult:
        """Get real-time log volume aggregation by service and level"""
        start_time = time.time()
        
        query = {
            "size": 0,
            "query": {
                "bool": {
                    "filter": [
                        {
                            "range": {
                                "@timestamp": self.get_time_range(time_window_minutes)
                            }
                        }
                    ]
                }
            },
            "aggs": {
                "log_volume_over_time": {
                    "date_histogram": {
                        "field": "@timestamp",
                        "fixed_interval": "1m",
                        "time_zone": "UTC"
                    },
                    "aggs": {
                        "by_service": {
                            "terms": {
                                "field": "service",
                                "size": 20
                            },
                            "aggs": {
                                "by_level": {
                                    "terms": {
                                        "field": "level",
                                        "size": 10
                                    }
                                }
                            }
                        },
                        "total_logs": {
                            "value_count": {
                                "field": "@timestamp"
                            }
                        }
                    }
                },
                "service_distribution": {
                    "terms": {
                        "field": "service",
                        "size": 20
                    },
                    "aggs": {
                        "level_breakdown": {
                            "terms": {
                                "field": "level",
                                "size": 10
                            }
                        },
                        "avg_response_time": {
                            "avg": {
                                "field": "response_time_ms"
                            }
                        }
                    }
                }
            }
        }
        
        try:
            response = self.es_client.search(
                index="romai-logs-*,romai-realtime-*",
                body=query
            )
            
            execution_time = (time.time() - start_time) * 1000
            
            return AggregationResult(
                name="real_time_log_volume",
                timestamp=datetime.utcnow().isoformat(),
                data=response["aggregations"],
                execution_time_ms=execution_time
            )
            
        except Exception as e:
            logger.error(f"Error in real_time_log_volume aggregation: {e}")
            return AggregationResult(
                name="real_time_log_volume",
                timestamp=datetime.utcnow().isoformat(),
                data={"error": str(e)},
                execution_time_ms=0
            )

    async def performance_metrics_aggregation(self, time_window_minutes: int = 15) -> AggregationResult:
        """Get real-time performance metrics aggregation"""
        start_time = time.time()
        
        query = {
            "size": 0,
            "query": {
                "bool": {
                    "filter": [
                        {
                            "range": {
                                "@timestamp": self.get_time_range(time_window_minutes)
                            }
                        },
                        {
                            "exists": {
                                "field": "response_time_ms"
                            }
                        }
                    ]
                }
            },
            "aggs": {
                "performance_over_time": {
                    "date_histogram": {
                        "field": "@timestamp",
                        "fixed_interval": "1m",
                        "time_zone": "UTC"
                    },
                    "aggs": {
                        "avg_response_time": {
                            "avg": {
                                "field": "response_time_ms"
                            }
                        },
                        "max_response_time": {
                            "max": {
                                "field": "response_time_ms"
                            }
                        },
                        "min_response_time": {
                            "min": {
                                "field": "response_time_ms"
                            }
                        },
                        "response_time_percentiles": {
                            "percentiles": {
                                "field": "response_time_ms",
                                "percents": [50, 75, 90, 95, 99]
                            }
                        },
                        "request_count": {
                            "value_count": {
                                "field": "response_time_ms"
                            }
                        }
                    }
                },
                "service_performance": {
                    "terms": {
                        "field": "service",
                        "size": 20
                    },
                    "aggs": {
                        "avg_response_time": {
                            "avg": {
                                "field": "response_time_ms"
                            }
                        },
                        "response_time_percentiles": {
                            "percentiles": {
                                "field": "response_time_ms",
                                "percents": [50, 90, 95, 99]
                            }
                        },
                        "endpoint_performance": {
                            "terms": {
                                "field": "endpoint",
                                "size": 10
                            },
                            "aggs": {
                                "avg_response_time": {
                                    "avg": {
                                        "field": "response_time_ms"
                                    }
                                }
                            }
                        }
                    }
                },
                "status_code_distribution": {
                    "terms": {
                        "field": "status_code",
                        "size": 20
                    }
                },
                "error_rate": {
                    "filters": {
                        "filters": {
                            "success": {
                                "range": {
                                    "status_code": {
                                        "gte": 200,
                                        "lt": 400
                                    }
                                }
                            },
                            "client_error": {
                                "range": {
                                    "status_code": {
                                        "gte": 400,
                                        "lt": 500
                                    }
                                }
                            },
                            "server_error": {
                                "range": {
                                    "status_code": {
                                        "gte": 500
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        try:
            response = self.es_client.search(
                index="romai-logs-*,romai-realtime-*,romai-performance-*",
                body=query
            )
            
            execution_time = (time.time() - start_time) * 1000
            
            return AggregationResult(
                name="performance_metrics",
                timestamp=datetime.utcnow().isoformat(),
                data=response["aggregations"],
                execution_time_ms=execution_time
            )
            
        except Exception as e:
            logger.error(f"Error in performance_metrics_aggregation: {e}")
            return AggregationResult(
                name="performance_metrics",
                timestamp=datetime.utcnow().isoformat(),
                data={"error": str(e)},
                execution_time_ms=0
            )

    async def security_events_aggregation(self, time_window_minutes: int = 60) -> AggregationResult:
        """Get real-time security events aggregation"""
        start_time = time.time()
        
        query = {
            "size": 0,
            "query": {
                "bool": {
                    "filter": [
                        {
                            "range": {
                                "@timestamp": self.get_time_range(time_window_minutes)
                            }
                        }
                    ],
                    "should": [
                        {
                            "match": {
                                "message": "authentication"
                            }
                        },
                        {
                            "match": {
                                "message": "login"
                            }
                        },
                        {
                            "match": {
                                "level": "ERROR"
                            }
                        },
                        {
                            "exists": {
                                "field": "event_type"
                            }
                        }
                    ],
                    "minimum_should_match": 1
                }
            },
            "aggs": {
                "security_events_over_time": {
                    "date_histogram": {
                        "field": "@timestamp",
                        "fixed_interval": "5m",
                        "time_zone": "UTC"
                    },
                    "aggs": {
                        "event_types": {
                            "terms": {
                                "field": "event_type",
                                "size": 10,
                                "missing": "unknown"
                            }
                        },
                        "threat_levels": {
                            "terms": {
                                "field": "threat_level",
                                "size": 5,
                                "missing": "unknown"
                            }
                        }
                    }
                },
                "top_client_ips": {
                    "terms": {
                        "field": "client_ip",
                        "size": 20
                    },
                    "aggs": {
                        "event_count": {
                            "value_count": {
                                "field": "client_ip"
                            }
                        },
                        "unique_users": {
                            "cardinality": {
                                "field": "user_id"
                            }
                        }
                    }
                },
                "failed_login_attempts": {
                    "filter": {
                        "bool": {
                            "should": [
                                {
                                    "match": {
                                        "event_type": "failed_login"
                                    }
                                },
                                {
                                    "bool": {
                                        "must": [
                                            {
                                                "match": {
                                                    "message": "login"
                                                }
                                            },
                                            {
                                                "match": {
                                                    "level": "ERROR"
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    "aggs": {
                        "by_user": {
                            "terms": {
                                "field": "user_id",
                                "size": 20
                            }
                        },
                        "by_ip": {
                            "terms": {
                                "field": "client_ip",
                                "size": 20
                            }
                        }
                    }
                },
                "geographic_distribution": {
                    "terms": {
                        "field": "geoip.country_name",
                        "size": 20,
                        "missing": "Unknown"
                    },
                    "aggs": {
                        "cities": {
                            "terms": {
                                "field": "geoip.city_name",
                                "size": 10
                            }
                        }
                    }
                }
            }
        }
        
        try:
            response = self.es_client.search(
                index="romai-logs-*,romai-realtime-*,romai-security-*",
                body=query
            )
            
            execution_time = (time.time() - start_time) * 1000
            
            return AggregationResult(
                name="security_events",
                timestamp=datetime.utcnow().isoformat(),
                data=response["aggregations"],
                execution_time_ms=execution_time
            )
            
        except Exception as e:
            logger.error(f"Error in security_events_aggregation: {e}")
            return AggregationResult(
                name="security_events",
                timestamp=datetime.utcnow().isoformat(),
                data={"error": str(e)},
                execution_time_ms=0
            )

    async def user_behavior_aggregation(self, time_window_minutes: int = 30) -> AggregationResult:
        """Get real-time user behavior aggregation"""
        start_time = time.time()
        
        query = {
            "size": 0,
            "query": {
                "bool": {
                    "filter": [
                        {
                            "range": {
                                "@timestamp": self.get_time_range(time_window_minutes)
                            }
                        },
                        {
                            "exists": {
                                "field": "user_id"
                            }
                        }
                    ]
                }
            },
            "aggs": {
                "user_activity_over_time": {
                    "date_histogram": {
                        "field": "@timestamp",
                        "fixed_interval": "2m",
                        "time_zone": "UTC"
                    },
                    "aggs": {
                        "active_users": {
                            "cardinality": {
                                "field": "user_id"
                            }
                        },
                        "total_requests": {
                            "value_count": {
                                "field": "user_id"
                            }
                        }
                    }
                },
                "top_users": {
                    "terms": {
                        "field": "user_id",
                        "size": 50
                    },
                    "aggs": {
                        "request_count": {
                            "value_count": {
                                "field": "user_id"
                            }
                        },
                        "unique_endpoints": {
                            "cardinality": {
                                "field": "endpoint"
                            }
                        },
                        "avg_response_time": {
                            "avg": {
                                "field": "response_time_ms"
                            }
                        },
                        "top_endpoints": {
                            "terms": {
                                "field": "endpoint",
                                "size": 10
                            }
                        }
                    }
                },
                "endpoint_popularity": {
                    "terms": {
                        "field": "endpoint",
                        "size": 30
                    },
                    "aggs": {
                        "unique_users": {
                            "cardinality": {
                                "field": "user_id"
                            }
                        },
                        "avg_response_time": {
                            "avg": {
                                "field": "response_time_ms"
                            }
                        }
                    }
                },
                "session_analysis": {
                    "terms": {
                        "field": "correlation_id",
                        "size": 100
                    },
                    "aggs": {
                        "session_duration": {
                            "range": {
                                "field": "@timestamp",
                                "ranges": [
                                    {"key": "short", "to": "now-5m"},
                                    {"key": "medium", "from": "now-5m", "to": "now-15m"},
                                    {"key": "long", "from": "now-15m"}
                                ]
                            }
                        },
                        "request_count_in_session": {
                            "value_count": {
                                "field": "correlation_id"
                            }
                        }
                    }
                }
            }
        }
        
        try:
            response = self.es_client.search(
                index="romai-logs-*,romai-realtime-*",
                body=query
            )
            
            execution_time = (time.time() - start_time) * 1000
            
            return AggregationResult(
                name="user_behavior",
                timestamp=datetime.utcnow().isoformat(),
                data=response["aggregations"],
                execution_time_ms=execution_time
            )
            
        except Exception as e:
            logger.error(f"Error in user_behavior_aggregation: {e}")
            return AggregationResult(
                name="user_behavior",
                timestamp=datetime.utcnow().isoformat(),
                data={"error": str(e)},
                execution_time_ms=0
            )

    async def system_health_aggregation(self, time_window_minutes: int = 10) -> AggregationResult:
        """Get real-time system health aggregation"""
        start_time = time.time()
        
        query = {
            "size": 0,
            "query": {
                "bool": {
                    "filter": [
                        {
                            "range": {
                                "@timestamp": self.get_time_range(time_window_minutes)
                            }
                        }
                    ]
                }
            },
            "aggs": {
                "health_over_time": {
                    "date_histogram": {
                        "field": "@timestamp",
                        "fixed_interval": "30s",
                        "time_zone": "UTC"
                    },
                    "aggs": {
                        "error_rate": {
                            "filters": {
                                "filters": {
                                    "errors": {
                                        "match": {
                                            "level": "ERROR"
                                        }
                                    },
                                    "total": {
                                        "match_all": {}
                                    }
                                }
                            }
                        },
                        "avg_response_time": {
                            "avg": {
                                "field": "response_time_ms"
                            }
                        },
                        "service_availability": {
                            "terms": {
                                "field": "service",
                                "size": 20
                            },
                            "aggs": {
                                "success_rate": {
                                    "filters": {
                                        "filters": {
                                            "success": {
                                                "range": {
                                                    "status_code": {
                                                        "gte": 200,
                                                        "lt": 400
                                                    }
                                                }
                                            },
                                            "total": {
                                                "match_all": {}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "service_health_score": {
                    "terms": {
                        "field": "service",
                        "size": 20
                    },
                    "aggs": {
                        "error_count": {
                            "filter": {
                                "match": {
                                    "level": "ERROR"
                                }
                            }
                        },
                        "total_requests": {
                            "value_count": {
                                "field": "service"
                            }
                        },
                        "avg_response_time": {
                            "avg": {
                                "field": "response_time_ms"
                            }
                        },
                        "slow_requests": {
                            "filter": {
                                "range": {
                                    "response_time_ms": {
                                        "gte": 1000
                                    }
                                }
                            }
                        }
                    }
                },
                "critical_events": {
                    "filter": {
                        "bool": {
                            "should": [
                                {
                                    "match": {
                                        "level": "ERROR"
                                    }
                                },
                                {
                                    "range": {
                                        "response_time_ms": {
                                            "gte": 5000
                                        }
                                    }
                                },
                                {
                                    "range": {
                                        "status_code": {
                                            "gte": 500
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "aggs": {
                        "by_service": {
                            "terms": {
                                "field": "service",
                                "size": 20
                            }
                        }
                    }
                }
            }
        }
        
        try:
            response = self.es_client.search(
                index="romai-logs-*,romai-realtime-*,romai-performance-*",
                body=query
            )
            
            execution_time = (time.time() - start_time) * 1000
            
            return AggregationResult(
                name="system_health",
                timestamp=datetime.utcnow().isoformat(),
                data=response["aggregations"],
                execution_time_ms=execution_time
            )
            
        except Exception as e:
            logger.error(f"Error in system_health_aggregation: {e}")
            return AggregationResult(
                name="system_health",
                timestamp=datetime.utcnow().isoformat(),
                data={"error": str(e)},
                execution_time_ms=0
            )

    async def run_all_aggregations(self) -> List[AggregationResult]:
        """Run all real-time aggregations concurrently"""
        tasks = [
            self.real_time_log_volume(),
            self.performance_metrics_aggregation(),
            self.security_events_aggregation(),
            self.user_behavior_aggregation(),
            self.system_health_aggregation()
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions and return valid results
        valid_results = []
        for result in results:
            if isinstance(result, AggregationResult):
                valid_results.append(result)
            elif isinstance(result, Exception):
                logger.error(f"Aggregation failed: {result}")
        
        return valid_results

    def save_aggregation_results(self, results: List[AggregationResult], output_file: str = None):
        """Save aggregation results to file"""
        if not output_file:
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            output_file = f"romai_aggregations_{timestamp}.json"
        
        output_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "total_aggregations": len(results),
            "results": [
                {
                    "name": result.name,
                    "timestamp": result.timestamp,
                    "execution_time_ms": result.execution_time_ms,
                    "data": result.data
                }
                for result in results
            ]
        }
        
        try:
            with open(output_file, 'w') as f:
                json.dump(output_data, f, indent=2, default=str)
            logger.info(f"Aggregation results saved to {output_file}")
        except Exception as e:
            logger.error(f"Failed to save aggregation results: {e}")

# Example usage and testing
async def main():
    """Main function for testing aggregations"""
    aggregator = RealTimeAggregations()
    
    logger.info("Running real-time aggregations...")
    results = await aggregator.run_all_aggregations()
    
    logger.info(f"Completed {len(results)} aggregations")
    for result in results:
        logger.info(f"  - {result.name}: {result.execution_time_ms:.2f}ms")
    
    # Save results
    aggregator.save_aggregation_results(results)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
