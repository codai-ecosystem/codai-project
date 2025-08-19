"""
Real API Integration Layer
Eliminates ALL mock API responses with genuine external integrations
Production-ready API clients for RomAI AGI Platform
"""

import asyncio
import aiohttp
import logging
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
from datetime import datetime, timezone, timedelta
import os
import json
from abc import ABC, abstractmethod
from enum import Enum
import time
import hashlib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class APIProvider(Enum):
    """Real API providers"""
    YAHOO_FINANCE = "yahoo_finance"
    ALPHA_VANTAGE = "alpha_vantage"
    ROMANIAN_BNR = "bnr_romania"
    FIXER_IO = "fixer_io"
    OPENWEATHER = "openweather"
    STRIPE = "stripe"
    PAYPAL = "paypal"
    TWILIO = "twilio"
    SENDGRID = "sendgrid"

@dataclass
class APICredentials:
    """Real API credentials configuration"""
    provider: APIProvider
    api_key: str
    base_url: str
    rate_limit_per_minute: int = 60
    timeout_seconds: int = 30
    
    @classmethod
    def from_env(cls, provider: APIProvider) -> 'APICredentials':
        """Load real API credentials from environment variables"""
        env_mapping = {
            APIProvider.ALPHA_VANTAGE: {
                'api_key': 'ALPHA_VANTAGE_API_KEY',
                'base_url': 'https://www.alphavantage.co/query',
                'rate_limit': 5  # 5 API calls per minute for free tier
            },
            APIProvider.YAHOO_FINANCE: {
                'api_key': 'YAHOO_FINANCE_API_KEY',  # Often not required
                'base_url': 'https://query1.finance.yahoo.com/v8/finance/chart',
                'rate_limit': 120
            },
            APIProvider.ROMANIAN_BNR: {
                'api_key': '',  # Public API
                'base_url': 'https://www.bnr.ro/nbrfxrates.xml',
                'rate_limit': 30
            },
            APIProvider.FIXER_IO: {
                'api_key': 'FIXER_IO_API_KEY',
                'base_url': 'http://data.fixer.io/api',
                'rate_limit': 100
            },
            APIProvider.STRIPE: {
                'api_key': 'STRIPE_SECRET_KEY',
                'base_url': 'https://api.stripe.com/v1',
                'rate_limit': 100
            },
            APIProvider.TWILIO: {
                'api_key': 'TWILIO_AUTH_TOKEN',
                'base_url': 'https://api.twilio.com/2010-04-01',
                'rate_limit': 60
            }
        }
        
        config = env_mapping.get(provider)
        if not config:
            raise ValueError(f"Unsupported API provider: {provider}")
        
        api_key = os.getenv(config['api_key'], '')
        
        return cls(
            provider=provider,
            api_key=api_key,
            base_url=config['base_url'],
            rate_limit_per_minute=config['rate_limit']
        )

@dataclass
class APIResponse:
    """Real API response wrapper"""
    success: bool
    data: Any
    status_code: int
    response_time_ms: int
    provider: APIProvider
    timestamp: datetime
    error_message: Optional[str] = None
    rate_limit_remaining: Optional[int] = None

class RateLimiter:
    """Real rate limiting implementation"""
    
    def __init__(self, max_calls_per_minute: int):
        self.max_calls = max_calls_per_minute
        self.calls = []
        self.lock = asyncio.Lock()
    
    async def acquire(self) -> None:
        """Acquire rate limit token - blocks if limit exceeded"""
        async with self.lock:
            now = time.time()
            # Remove calls older than 1 minute
            self.calls = [call_time for call_time in self.calls if now - call_time < 60]
            
            if len(self.calls) >= self.max_calls:
                # Calculate wait time
                oldest_call = min(self.calls)
                wait_time = 60 - (now - oldest_call) + 0.1  # Add small buffer
                logger.warning(f"Rate limit reached, waiting {wait_time:.1f} seconds")
                await asyncio.sleep(wait_time)
                return await self.acquire()
            
            self.calls.append(now)

class BaseAPIClient(ABC):
    """Base class for real API clients"""
    
    def __init__(self, credentials: APICredentials):
        self.credentials = credentials
        self.rate_limiter = RateLimiter(credentials.rate_limit_per_minute)
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=self.credentials.timeout_seconds),
            headers=self._get_default_headers()
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    @abstractmethod
    def _get_default_headers(self) -> Dict[str, str]:
        """Get default headers for API requests"""
        pass
    
    async def _make_request(
        self,
        method: str,
        endpoint: str,
        params: Dict = None,
        data: Dict = None,
        headers: Dict = None
    ) -> APIResponse:
        """Make real API request with rate limiting and error handling"""
        await self.rate_limiter.acquire()
        
        start_time = time.time()
        
        try:
            url = f"{self.credentials.base_url}/{endpoint.lstrip('/')}"
            request_headers = self._get_default_headers()
            if headers:
                request_headers.update(headers)
            
            async with self.session.request(
                method=method,
                url=url,
                params=params,
                json=data,
                headers=request_headers
            ) as response:
                response_time_ms = int((time.time() - start_time) * 1000)
                response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                rate_limit_remaining = None
                if 'X-RateLimit-Remaining' in response.headers:
                    rate_limit_remaining = int(response.headers['X-RateLimit-Remaining'])
                
                return APIResponse(
                    success=response.status < 400,
                    data=response_data,
                    status_code=response.status,
                    response_time_ms=response_time_ms,
                    provider=self.credentials.provider,
                    timestamp=datetime.now(timezone.utc),
                    error_message=None if response.status < 400 else f"HTTP {response.status}",
                    rate_limit_remaining=rate_limit_remaining
                )
                
        except Exception as e:
            response_time_ms = int((time.time() - start_time) * 1000)
            logger.error(f"API request failed for {self.credentials.provider.value}: {e}")
            
            return APIResponse(
                success=False,
                data=None,
                status_code=500,
                response_time_ms=response_time_ms,
                provider=self.credentials.provider,
                timestamp=datetime.now(timezone.utc),
                error_message=str(e)
            )

class AlphaVantageClient(BaseAPIClient):
    """Real Alpha Vantage API client - NO MOCK DATA"""
    
    def _get_default_headers(self) -> Dict[str, str]:
        return {
            'User-Agent': 'RomAI-AGI/1.0',
            'Accept': 'application/json'
        }
    
    async def get_real_stock_quote(self, symbol: str) -> APIResponse:
        """Get real stock quote from Alpha Vantage"""
        params = {
            'function': 'GLOBAL_QUOTE',
            'symbol': symbol,
            'apikey': self.credentials.api_key
        }
        
        response = await self._make_request('GET', '', params=params)
        
        if response.success and response.data:
            # Parse Alpha Vantage response format
            if 'Global Quote' in response.data:
                quote_data = response.data['Global Quote']
                response.data = {
                    'symbol': quote_data.get('01. symbol'),
                    'price': float(quote_data.get('05. price', 0)),
                    'change': float(quote_data.get('09. change', 0)),
                    'change_percent': quote_data.get('10. change percent', '0%'),
                    'volume': int(quote_data.get('06. volume', 0)),
                    'latest_trading_day': quote_data.get('07. latest trading day'),
                    'provider': 'alpha_vantage'
                }
        
        return response
    
    async def get_real_time_series(self, symbol: str, interval: str = 'daily') -> APIResponse:
        """Get real time series data from Alpha Vantage"""
        function_map = {
            'daily': 'TIME_SERIES_DAILY',
            'weekly': 'TIME_SERIES_WEEKLY',
            'monthly': 'TIME_SERIES_MONTHLY'
        }
        
        params = {
            'function': function_map.get(interval, 'TIME_SERIES_DAILY'),
            'symbol': symbol,
            'apikey': self.credentials.api_key
        }
        
        response = await self._make_request('GET', '', params=params)
        
        if response.success and response.data:
            # Parse time series data
            time_series_key = f"Time Series ({interval.title()})"
            if time_series_key in response.data:
                time_series = response.data[time_series_key]
                parsed_data = []
                
                for date, values in time_series.items():
                    parsed_data.append({
                        'date': date,
                        'open': float(values.get('1. open', 0)),
                        'high': float(values.get('2. high', 0)),
                        'low': float(values.get('3. low', 0)),
                        'close': float(values.get('4. close', 0)),
                        'volume': int(values.get('5. volume', 0))
                    })
                
                response.data = {
                    'symbol': symbol,
                    'interval': interval,
                    'time_series': parsed_data,
                    'provider': 'alpha_vantage'
                }
        
        return response

class RomanianBNRClient(BaseAPIClient):
    """Real Romanian National Bank (BNR) API client - NO MOCK DATA"""
    
    def _get_default_headers(self) -> Dict[str, str]:
        return {
            'User-Agent': 'RomAI-AGI/1.0',
            'Accept': 'application/xml, text/xml'
        }
    
    async def get_real_exchange_rates(self) -> APIResponse:
        """Get real exchange rates from BNR"""
        response = await self._make_request('GET', '')
        
        if response.success and response.data:
            # Parse XML response (simplified parsing)
            try:
                import xml.etree.ElementTree as ET
                root = ET.fromstring(response.data)
                
                rates = {}
                for rate in root.findall('.//Rate'):
                    currency = rate.get('currency')
                    multiplier = int(rate.get('multiplier', 1))
                    value = float(rate.text)
                    rates[currency] = value / multiplier
                
                response.data = {
                    'base_currency': 'RON',
                    'rates': rates,
                    'date': datetime.now().strftime('%Y-%m-%d'),
                    'provider': 'bnr_romania'
                }
                
            except Exception as e:
                response.success = False
                response.error_message = f"Failed to parse BNR XML: {e}"
        
        return response

class StripeClient(BaseAPIClient):
    """Real Stripe API client - NO MOCK DATA"""
    
    def _get_default_headers(self) -> Dict[str, str]:
        return {
            'Authorization': f'Bearer {self.credentials.api_key}',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'RomAI-AGI/1.0'
        }
    
    async def create_real_payment_intent(
        self,
        amount: int,  # Amount in smallest currency unit
        currency: str = 'ron',
        customer_id: str = None,
        description: str = None
    ) -> APIResponse:
        """Create real Stripe payment intent"""
        data = {
            'amount': amount,
            'currency': currency.lower()
        }
        
        if customer_id:
            data['customer'] = customer_id
        if description:
            data['description'] = description
        
        return await self._make_request('POST', 'payment_intents', data=data)
    
    async def get_real_payment_status(self, payment_intent_id: str) -> APIResponse:
        """Get real payment status from Stripe"""
        return await self._make_request('GET', f'payment_intents/{payment_intent_id}')
    
    async def create_real_customer(
        self,
        email: str,
        name: str = None,
        phone: str = None
    ) -> APIResponse:
        """Create real Stripe customer"""
        data = {'email': email}
        if name:
            data['name'] = name
        if phone:
            data['phone'] = phone
        
        return await self._make_request('POST', 'customers', data=data)

class TwilioClient(BaseAPIClient):
    """Real Twilio API client - NO MOCK DATA"""
    
    def _get_default_headers(self) -> Dict[str, str]:
        import base64
        account_sid = os.getenv('TWILIO_ACCOUNT_SID', '')
        auth_token = self.credentials.api_key
        
        credentials = base64.b64encode(f"{account_sid}:{auth_token}".encode()).decode()
        
        return {
            'Authorization': f'Basic {credentials}',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'RomAI-AGI/1.0'
        }
    
    async def send_real_sms(
        self,
        to_number: str,
        message: str,
        from_number: str = None
    ) -> APIResponse:
        """Send real SMS via Twilio"""
        account_sid = os.getenv('TWILIO_ACCOUNT_SID', '')
        if not from_number:
            from_number = os.getenv('TWILIO_PHONE_NUMBER', '')
        
        data = {
            'To': to_number,
            'From': from_number,
            'Body': message
        }
        
        endpoint = f'Accounts/{account_sid}/Messages.json'
        return await self._make_request('POST', endpoint, data=data)

class RealAPIIntegrationManager:
    """
    Real API Integration Manager - NO MOCK DATA
    Manages all external API integrations for RomAI AGI
    """
    
    def __init__(self):
        self.clients: Dict[APIProvider, BaseAPIClient] = {}
        self.response_cache: Dict[str, APIResponse] = {}
        self.cache_ttl: Dict[str, datetime] = {}
    
    async def initialize_clients(self) -> None:
        """Initialize all real API clients"""
        try:
            # Initialize financial APIs
            if os.getenv('ALPHA_VANTAGE_API_KEY'):
                self.clients[APIProvider.ALPHA_VANTAGE] = AlphaVantageClient(
                    APICredentials.from_env(APIProvider.ALPHA_VANTAGE)
                )
            
            # Initialize BNR (no API key required)
            self.clients[APIProvider.ROMANIAN_BNR] = RomanianBNRClient(
                APICredentials.from_env(APIProvider.ROMANIAN_BNR)
            )
            
            # Initialize payment APIs
            if os.getenv('STRIPE_SECRET_KEY'):
                self.clients[APIProvider.STRIPE] = StripeClient(
                    APICredentials.from_env(APIProvider.STRIPE)
                )
            
            # Initialize communication APIs
            if os.getenv('TWILIO_AUTH_TOKEN'):
                self.clients[APIProvider.TWILIO] = TwilioClient(
                    APICredentials.from_env(APIProvider.TWILIO)
                )
            
            logger.info(f"✅ Initialized {len(self.clients)} real API clients")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize API clients: {e}")
            raise
    
    def _get_cache_key(self, provider: APIProvider, method: str, params: Dict) -> str:
        """Generate cache key for API responses"""
        params_str = json.dumps(params, sort_keys=True)
        key_data = f"{provider.value}:{method}:{params_str}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def _is_cache_valid(self, cache_key: str, ttl_minutes: int = 5) -> bool:
        """Check if cached response is still valid"""
        if cache_key not in self.cache_ttl:
            return False
        
        cached_time = self.cache_ttl[cache_key]
        return datetime.now(timezone.utc) - cached_time < timedelta(minutes=ttl_minutes)
    
    async def get_real_financial_data(
        self,
        symbol: str,
        provider: APIProvider = APIProvider.ALPHA_VANTAGE,
        use_cache: bool = True
    ) -> APIResponse:
        """Get real financial data - NO MOCK DATA"""
        cache_key = self._get_cache_key(provider, 'stock_quote', {'symbol': symbol})
        
        if use_cache and self._is_cache_valid(cache_key, ttl_minutes=5):
            logger.info(f"📋 Using cached financial data for {symbol}")
            return self.response_cache[cache_key]
        
        if provider not in self.clients:
            return APIResponse(
                success=False,
                data=None,
                status_code=503,
                response_time_ms=0,
                provider=provider,
                timestamp=datetime.now(timezone.utc),
                error_message=f"API client not available: {provider.value}"
            )
        
        client = self.clients[provider]
        
        async with client:
            if provider == APIProvider.ALPHA_VANTAGE:
                response = await client.get_real_stock_quote(symbol)
            else:
                response = APIResponse(
                    success=False,
                    data=None,
                    status_code=400,
                    response_time_ms=0,
                    provider=provider,
                    timestamp=datetime.now(timezone.utc),
                    error_message=f"Unsupported provider for financial data: {provider.value}"
                )
        
        # Cache successful responses
        if response.success and use_cache:
            self.response_cache[cache_key] = response
            self.cache_ttl[cache_key] = datetime.now(timezone.utc)
        
        return response
    
    async def get_real_exchange_rates(self, use_cache: bool = True) -> APIResponse:
        """Get real exchange rates from BNR - NO MOCK DATA"""
        cache_key = self._get_cache_key(APIProvider.ROMANIAN_BNR, 'exchange_rates', {})
        
        if use_cache and self._is_cache_valid(cache_key, ttl_minutes=60):
            logger.info("📋 Using cached exchange rates")
            return self.response_cache[cache_key]
        
        if APIProvider.ROMANIAN_BNR not in self.clients:
            return APIResponse(
                success=False,
                data=None,
                status_code=503,
                response_time_ms=0,
                provider=APIProvider.ROMANIAN_BNR,
                timestamp=datetime.now(timezone.utc),
                error_message="BNR API client not available"
            )
        
        client = self.clients[APIProvider.ROMANIAN_BNR]
        
        async with client:
            response = await client.get_real_exchange_rates()
        
        # Cache successful responses
        if response.success and use_cache:
            self.response_cache[cache_key] = response
            self.cache_ttl[cache_key] = datetime.now(timezone.utc)
        
        return response
    
    async def process_real_payment(
        self,
        amount: float,
        currency: str = 'RON',
        customer_email: str = None,
        description: str = None
    ) -> APIResponse:
        """Process real payment via Stripe - NO MOCK DATA"""
        if APIProvider.STRIPE not in self.clients:
            return APIResponse(
                success=False,
                data=None,
                status_code=503,
                response_time_ms=0,
                provider=APIProvider.STRIPE,
                timestamp=datetime.now(timezone.utc),
                error_message="Stripe API client not available"
            )
        
        client = self.clients[APIProvider.STRIPE]
        
        # Convert amount to smallest currency unit
        if currency.upper() == 'RON':
            amount_in_bani = int(amount * 100)  # RON to bani
        else:
            amount_in_bani = int(amount * 100)  # Assume cents for other currencies
        
        async with client:
            # Create customer if email provided
            customer_id = None
            if customer_email:
                customer_response = await client.create_real_customer(email=customer_email)
                if customer_response.success:
                    customer_id = customer_response.data.get('id')
            
            # Create payment intent
            response = await client.create_real_payment_intent(
                amount=amount_in_bani,
                currency=currency.lower(),
                customer_id=customer_id,
                description=description
            )
        
        return response
    
    async def send_real_notification(
        self,
        phone_number: str,
        message: str
    ) -> APIResponse:
        """Send real SMS notification via Twilio - NO MOCK DATA"""
        if APIProvider.TWILIO not in self.clients:
            return APIResponse(
                success=False,
                data=None,
                status_code=503,
                response_time_ms=0,
                provider=APIProvider.TWILIO,
                timestamp=datetime.now(timezone.utc),
                error_message="Twilio API client not available"
            )
        
        client = self.clients[APIProvider.TWILIO]
        
        async with client:
            response = await client.send_real_sms(
                to_number=phone_number,
                message=message
            )
        
        return response
    
    async def health_check_all_apis(self) -> Dict[str, bool]:
        """Health check all real APIs - NO MOCK DATA"""
        health_status = {}
        
        for provider, client in self.clients.items():
            try:
                async with client:
                    if provider == APIProvider.ALPHA_VANTAGE:
                        response = await client.get_real_stock_quote('AAPL')
                    elif provider == APIProvider.ROMANIAN_BNR:
                        response = await client.get_real_exchange_rates()
                    elif provider == APIProvider.STRIPE:
                        # Simple API test - list customers with limit 1
                        response = await client._make_request('GET', 'customers', params={'limit': 1})
                    elif provider == APIProvider.TWILIO:
                        # Simple API test - get account info
                        account_sid = os.getenv('TWILIO_ACCOUNT_SID', '')
                        response = await client._make_request('GET', f'Accounts/{account_sid}.json')
                    else:
                        response = APIResponse(success=False, data=None, status_code=501, 
                                             response_time_ms=0, provider=provider, 
                                             timestamp=datetime.now(timezone.utc))
                    
                    health_status[provider.value] = response.success
                    
            except Exception as e:
                logger.error(f"Health check failed for {provider.value}: {e}")
                health_status[provider.value] = False
        
        return health_status

# Global instance for real API integration
real_api_manager = RealAPIIntegrationManager()

async def initialize_real_apis():
    """Initialize real API integration manager"""
    logger.info("🚀 Initializing Real API Integrations...")
    await real_api_manager.initialize_clients()
    logger.info("✅ Real API integrations initialized successfully")

if __name__ == "__main__":
    # Test real API integrations
    async def test_real_apis():
        await initialize_real_apis()
        
        # Test financial data
        financial_response = await real_api_manager.get_real_financial_data('AAPL')
        print(f"Financial API test: {financial_response.success}")
        
        # Test exchange rates
        exchange_response = await real_api_manager.get_real_exchange_rates()
        print(f"Exchange rates test: {exchange_response.success}")
        
        # Health check
        health = await real_api_manager.health_check_all_apis()
        print(f"API health check: {health}")
    
    asyncio.run(test_real_apis())
