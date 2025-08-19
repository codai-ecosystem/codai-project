#!/usr/bin/env python3
"""
🎯 RomAI AGI - Phase 6.2 Customer Acquisition System
Advanced customer acquisition, lead generation, and conversion optimization

This module provides comprehensive customer acquisition capabilities including
lead scoring, conversion funnels, marketing automation, and acquisition analytics.

Author: RomAI Monetization Team
Version: 6.2.0
Date: 2025-08-08
"""

import asyncio
import logging
import json
import time
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
import sqlite3
import hashlib
import uuid
import threading
from decimal import Decimal, ROUND_HALF_UP
import random
import re

logger = logging.getLogger(__name__)

class LeadSource(Enum):
    """Lead source enumeration"""
    ORGANIC_SEARCH = "organic_search"
    PAID_SEARCH = "paid_search"
    SOCIAL_MEDIA = "social_media"
    EMAIL_MARKETING = "email_marketing"
    REFERRAL = "referral"
    DIRECT = "direct"
    CONTENT_MARKETING = "content_marketing"
    WEBINAR = "webinar"
    CONFERENCE = "conference"
    PARTNER = "partner"

class LeadStatus(Enum):
    """Lead status enumeration"""
    NEW = "new"
    QUALIFIED = "qualified"
    CONTACTED = "contacted"
    NURTURING = "nurturing"
    CONVERTED = "converted"
    LOST = "lost"
    UNQUALIFIED = "unqualified"

class ConversionStage(Enum):
    """Conversion funnel stage enumeration"""
    VISITOR = "visitor"
    LEAD = "lead"
    MARKETING_QUALIFIED = "marketing_qualified"
    SALES_QUALIFIED = "sales_qualified"
    TRIAL = "trial"
    CUSTOMER = "customer"
    ADVOCATE = "advocate"

class CampaignType(Enum):
    """Marketing campaign type enumeration"""
    EMAIL = "email"
    SOCIAL = "social"
    CONTENT = "content"
    PAID_ADS = "paid_ads"
    WEBINAR = "webinar"
    REFERRAL = "referral"
    RETARGETING = "retargeting"

@dataclass
class Lead:
    """Lead data structure"""
    id: str
    email: str
    name: Optional[str]
    company: Optional[str]
    job_title: Optional[str]
    country: str
    source: LeadSource
    status: LeadStatus
    score: int
    created_at: datetime
    last_contact: Optional[datetime]
    conversion_probability: float
    estimated_value: Decimal
    notes: List[str] = field(default_factory=list)

@dataclass
class ConversionFunnel:
    """Conversion funnel metrics"""
    stage: ConversionStage
    count: int
    conversion_rate: float
    avg_time_to_next: timedelta
    drop_off_rate: float

@dataclass
class Campaign:
    """Marketing campaign data structure"""
    id: str
    name: str
    type: CampaignType
    status: str
    start_date: datetime
    end_date: Optional[datetime]
    budget: Decimal
    spent: Decimal
    leads_generated: int
    conversions: int
    roi: float
    target_audience: Dict[str, Any]

@dataclass
class AcquisitionMetrics:
    """Customer acquisition metrics"""
    total_leads: int
    qualified_leads: int
    conversion_rate: float
    cost_per_lead: Decimal
    cost_per_acquisition: Decimal
    customer_lifetime_value: Decimal
    roi: float
    time_period: str

class CustomerAcquisitionSystem:
    """Advanced customer acquisition and lead management system"""
    
    def __init__(self):
        self.db_path = "customer_acquisition.db"
        self.leads: Dict[str, Lead] = {}
        self.campaigns: Dict[str, Campaign] = {}
        self.conversion_funnel: Dict[ConversionStage, ConversionFunnel] = {}
        self.lock = threading.Lock()
        
        # Lead scoring weights
        self.scoring_weights = {
            "email_domain": {"gmail.com": 1, "yahoo.com": 1, "company_domain": 5},
            "job_title": {
                "ceo": 10, "cto": 9, "director": 8, "manager": 6,
                "developer": 4, "analyst": 3, "intern": 1
            },
            "company_size": {"enterprise": 10, "medium": 6, "small": 3, "startup": 2},
            "source": {
                LeadSource.REFERRAL: 8,
                LeadSource.ORGANIC_SEARCH: 6,
                LeadSource.CONTENT_MARKETING: 5,
                LeadSource.PAID_SEARCH: 4,
                LeadSource.SOCIAL_MEDIA: 3,
                LeadSource.DIRECT: 3
            },
            "engagement": {"high": 8, "medium": 5, "low": 2}
        }
        
        # Romanian market focus
        self.romanian_indicators = {
            "domains": [".ro", "romania", "bucuresti", "cluj", "timisoara"],
            "companies": ["srl", "sa", "pfa", "ong"],
            "keywords": ["romania", "romanian", "bucuresti", "cluj", "timisoara", "constanta"]
        }
        
    async def initialize(self):
        """Initialize the customer acquisition system"""
        try:
            logger.info("🎯 Initializing Customer Acquisition System...")
            
            # Initialize database
            await self.init_database()
            
            # Load existing data
            await self.load_leads()
            await self.load_campaigns()
            
            # Initialize conversion funnel
            await self.initialize_conversion_funnel()
            
            logger.info("✅ Customer Acquisition System initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize customer acquisition system: {e}")
            raise
    
    async def init_database(self):
        """Initialize SQLite database for acquisition data"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Leads table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS leads (
                    id TEXT PRIMARY KEY,
                    email TEXT NOT NULL UNIQUE,
                    name TEXT,
                    company TEXT,
                    job_title TEXT,
                    country TEXT NOT NULL,
                    source TEXT NOT NULL,
                    status TEXT NOT NULL,
                    score INTEGER NOT NULL,
                    created_at DATETIME NOT NULL,
                    last_contact DATETIME,
                    conversion_probability REAL NOT NULL,
                    estimated_value DECIMAL(10,2) NOT NULL,
                    notes TEXT
                )
            """)
            
            # Campaigns table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS campaigns (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    status TEXT NOT NULL,
                    start_date DATETIME NOT NULL,
                    end_date DATETIME,
                    budget DECIMAL(10,2) NOT NULL,
                    spent DECIMAL(10,2) DEFAULT 0.00,
                    leads_generated INTEGER DEFAULT 0,
                    conversions INTEGER DEFAULT 0,
                    roi REAL DEFAULT 0.0,
                    target_audience TEXT
                )
            """)
            
            # Lead interactions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS lead_interactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    lead_id TEXT NOT NULL,
                    interaction_type TEXT NOT NULL,
                    interaction_data TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (lead_id) REFERENCES leads (id)
                )
            """)
            
            # Conversion funnel tracking
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS funnel_tracking (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    lead_id TEXT NOT NULL,
                    stage TEXT NOT NULL,
                    entered_at DATETIME NOT NULL,
                    exited_at DATETIME,
                    FOREIGN KEY (lead_id) REFERENCES leads (id)
                )
            """)
            
            # Acquisition metrics table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS acquisition_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    total_leads INTEGER NOT NULL,
                    qualified_leads INTEGER NOT NULL,
                    conversion_rate REAL NOT NULL,
                    cost_per_lead DECIMAL(10,2) NOT NULL,
                    cost_per_acquisition DECIMAL(10,2) NOT NULL,
                    customer_lifetime_value DECIMAL(10,2) NOT NULL,
                    roi REAL NOT NULL,
                    time_period TEXT NOT NULL,
                    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.commit()
            conn.close()
            
            logger.info("✅ Customer acquisition database initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            raise
    
    async def capture_lead(self, email: str, name: Optional[str] = None, 
                         company: Optional[str] = None, job_title: Optional[str] = None,
                         country: str = "Romania", source: LeadSource = LeadSource.DIRECT) -> Lead:
        """Capture and score a new lead"""
        try:
            lead_id = str(uuid.uuid4())
            
            # Calculate lead score
            score = await self.calculate_lead_score(email, company, job_title, source)
            
            # Calculate conversion probability based on score
            conversion_probability = min(score / 100.0, 0.95)
            
            # Estimate lead value based on Romanian market data
            estimated_value = await self.estimate_lead_value(score, company, country)
            
            lead = Lead(
                id=lead_id,
                email=email,
                name=name,
                company=company,
                job_title=job_title,
                country=country,
                source=source,
                status=LeadStatus.NEW,
                score=score,
                created_at=datetime.now(),
                last_contact=None,
                conversion_probability=conversion_probability,
                estimated_value=estimated_value,
                notes=[]
            )
            
            # Auto-qualify high-scoring leads
            if score >= 70:
                lead.status = LeadStatus.QUALIFIED
                await self.add_lead_note(lead_id, f"Auto-qualified: High score ({score})")
            
            # Save to database
            await self.save_lead(lead)
            
            # Track in funnel
            await self.track_funnel_entry(lead_id, ConversionStage.LEAD)
            
            # Store in memory
            with self.lock:
                self.leads[lead_id] = lead
            
            logger.info(f"✅ Lead captured: {email} (Score: {score}, Value: €{estimated_value})")
            
            return lead
            
        except Exception as e:
            logger.error(f"❌ Failed to capture lead: {e}")
            raise
    
    async def calculate_lead_score(self, email: str, company: Optional[str], 
                                 job_title: Optional[str], source: LeadSource) -> int:
        """Calculate lead score based on various factors"""
        try:
            score = 0
            
            # Email domain scoring
            domain = email.split('@')[1].lower() if '@' in email else ""
            if any(indicator in domain for indicator in self.romanian_indicators["domains"]):
                score += 15  # Romanian domain bonus
            elif domain in self.scoring_weights["email_domain"]:
                score += self.scoring_weights["email_domain"][domain]
            elif not domain.endswith(('.gmail.com', '.yahoo.com', '.outlook.com')):
                score += 5  # Company email
            
            # Job title scoring
            if job_title:
                title_lower = job_title.lower()
                for title, points in self.scoring_weights["job_title"].items():
                    if title in title_lower:
                        score += points
                        break
            
            # Company scoring
            if company:
                company_lower = company.lower()
                # Romanian company indicators
                if any(indicator in company_lower for indicator in self.romanian_indicators["companies"]):
                    score += 10
                # Enterprise indicators
                if any(word in company_lower for word in ["enterprise", "corporation", "international", "group"]):
                    score += 8
                elif any(word in company_lower for word in ["startup", "srl", "pfa"]):
                    score += 4
            
            # Source scoring
            if source in self.scoring_weights["source"]:
                score += self.scoring_weights["source"][source]
            
            # Romanian market bonus
            romanian_keywords = ["romania", "romanian", "bucuresti", "cluj"]
            email_or_company = f"{email} {company or ''}".lower()
            if any(keyword in email_or_company for keyword in romanian_keywords):
                score += 20
            
            # Ensure score is within bounds
            score = max(0, min(100, score))
            
            return score
            
        except Exception as e:
            logger.error(f"❌ Failed to calculate lead score: {e}")
            return 0
    
    async def estimate_lead_value(self, score: int, company: Optional[str], country: str) -> Decimal:
        """Estimate potential lead value based on Romanian market data"""
        try:
            base_value = Decimal('150.00')  # Base value for Romanian market
            
            # Score multiplier
            score_multiplier = Decimal(str(score / 50.0))
            
            # Company size multiplier
            company_multiplier = Decimal('1.0')
            if company:
                company_lower = company.lower()
                if any(word in company_lower for word in ["enterprise", "corporation", "international"]):
                    company_multiplier = Decimal('3.0')
                elif any(word in company_lower for word in ["group", "holding", "sa"]):
                    company_multiplier = Decimal('2.0')
                elif "srl" in company_lower:
                    company_multiplier = Decimal('1.5')
            
            # Country multiplier (Romanian focus)
            country_multiplier = Decimal('1.2') if country.lower() == "romania" else Decimal('1.0')
            
            estimated_value = base_value * score_multiplier * company_multiplier * country_multiplier
            
            # Round to 2 decimal places
            return estimated_value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            
        except Exception as e:
            logger.error(f"❌ Failed to estimate lead value: {e}")
            return Decimal('100.00')
    
    async def qualify_lead(self, lead_id: str, qualification_notes: str = "") -> bool:
        """Qualify a lead for sales follow-up"""
        try:
            lead = self.leads.get(lead_id)
            if not lead:
                raise ValueError(f"Lead not found: {lead_id}")
            
            # Update lead status
            lead.status = LeadStatus.QUALIFIED
            lead.last_contact = datetime.now()
            
            # Add qualification note
            if qualification_notes:
                await self.add_lead_note(lead_id, f"Qualified: {qualification_notes}")
            
            # Track in funnel
            await self.track_funnel_entry(lead_id, ConversionStage.MARKETING_QUALIFIED)
            
            # Save to database
            await self.save_lead(lead)
            
            logger.info(f"✅ Lead qualified: {lead.email}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to qualify lead: {e}")
            return False
    
    async def start_nurturing(self, lead_id: str, nurturing_track: str = "default") -> bool:
        """Start nurturing sequence for a lead"""
        try:
            lead = self.leads.get(lead_id)
            if not lead:
                raise ValueError(f"Lead not found: {lead_id}")
            
            # Update lead status
            lead.status = LeadStatus.NURTURING
            lead.last_contact = datetime.now()
            
            # Create nurturing sequence based on lead profile
            sequence = await self.create_nurturing_sequence(lead, nurturing_track)
            
            # Add nurturing note
            await self.add_lead_note(lead_id, f"Started nurturing: {nurturing_track} track")
            
            # Save to database
            await self.save_lead(lead)
            
            logger.info(f"✅ Nurturing started: {lead.email} ({nurturing_track})")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to start nurturing: {e}")
            return False
    
    async def create_nurturing_sequence(self, lead: Lead, track: str) -> List[Dict[str, Any]]:
        """Create personalized nurturing sequence"""
        try:
            base_sequence = [
                {"day": 0, "type": "welcome_email", "template": "welcome"},
                {"day": 2, "type": "value_content", "template": "romanian_ai_guide"},
                {"day": 5, "type": "case_study", "template": "success_story"},
                {"day": 8, "type": "demo_invite", "template": "personal_demo"},
                {"day": 12, "type": "free_trial", "template": "trial_offer"},
                {"day": 18, "type": "pricing_info", "template": "pricing_guide"},
                {"day": 25, "type": "testimonials", "template": "customer_testimonials"}
            ]
            
            # Customize based on lead profile
            if lead.score >= 80:
                # High-value lead - accelerated sequence
                base_sequence = [item for item in base_sequence if item["day"] <= 15]
            elif lead.country.lower() == "romania":
                # Romanian lead - add Romanian-specific content
                base_sequence.insert(2, {
                    "day": 3, "type": "romanian_content", "template": "romanian_market_insights"
                })
            
            return base_sequence
            
        except Exception as e:
            logger.error(f"❌ Failed to create nurturing sequence: {e}")
            return []
    
    async def convert_lead(self, lead_id: str, conversion_value: Decimal) -> bool:
        """Mark a lead as converted to customer"""
        try:
            lead = self.leads.get(lead_id)
            if not lead:
                raise ValueError(f"Lead not found: {lead_id}")
            
            # Update lead status
            lead.status = LeadStatus.CONVERTED
            lead.last_contact = datetime.now()
            
            # Track conversion in funnel
            await self.track_funnel_entry(lead_id, ConversionStage.CUSTOMER)
            
            # Add conversion note
            await self.add_lead_note(lead_id, f"Converted: €{conversion_value}")
            
            # Save to database
            await self.save_lead(lead)
            
            logger.info(f"🎉 Lead converted: {lead.email} (€{conversion_value})")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to convert lead: {e}")
            return False
    
    async def create_campaign(self, name: str, campaign_type: CampaignType, 
                            budget: Decimal, target_audience: Dict[str, Any]) -> Campaign:
        """Create a new marketing campaign"""
        try:
            campaign_id = str(uuid.uuid4())
            
            campaign = Campaign(
                id=campaign_id,
                name=name,
                type=campaign_type,
                status="active",
                start_date=datetime.now(),
                end_date=None,
                budget=budget,
                spent=Decimal('0.00'),
                leads_generated=0,
                conversions=0,
                roi=0.0,
                target_audience=target_audience
            )
            
            # Save to database
            await self.save_campaign(campaign)
            
            # Store in memory
            with self.lock:
                self.campaigns[campaign_id] = campaign
            
            logger.info(f"✅ Campaign created: {name} ({campaign_type.value})")
            
            return campaign
            
        except Exception as e:
            logger.error(f"❌ Failed to create campaign: {e}")
            raise
    
    async def track_funnel_entry(self, lead_id: str, stage: ConversionStage):
        """Track lead entry into funnel stage"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO funnel_tracking (lead_id, stage, entered_at)
                VALUES (?, ?, ?)
            """, (lead_id, stage.value, datetime.now()))
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Failed to track funnel entry: {e}")
    
    async def add_lead_note(self, lead_id: str, note: str):
        """Add note to lead"""
        try:
            lead = self.leads.get(lead_id)
            if lead:
                lead.notes.append(f"{datetime.now().strftime('%Y-%m-%d %H:%M')}: {note}")
        except Exception as e:
            logger.error(f"❌ Failed to add lead note: {e}")
    
    async def initialize_conversion_funnel(self):
        """Initialize conversion funnel tracking"""
        try:
            stages = [
                ConversionStage.VISITOR,
                ConversionStage.LEAD,
                ConversionStage.MARKETING_QUALIFIED,
                ConversionStage.SALES_QUALIFIED,
                ConversionStage.TRIAL,
                ConversionStage.CUSTOMER,
                ConversionStage.ADVOCATE
            ]
            
            for stage in stages:
                self.conversion_funnel[stage] = ConversionFunnel(
                    stage=stage,
                    count=0,
                    conversion_rate=0.0,
                    avg_time_to_next=timedelta(days=7),
                    drop_off_rate=0.0
                )
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize conversion funnel: {e}")
    
    async def calculate_acquisition_metrics(self) -> AcquisitionMetrics:
        """Calculate comprehensive acquisition metrics"""
        try:
            total_leads = len(self.leads)
            qualified_leads = len([l for l in self.leads.values() if l.status == LeadStatus.QUALIFIED])
            converted_leads = len([l for l in self.leads.values() if l.status == LeadStatus.CONVERTED])
            
            conversion_rate = (converted_leads / max(total_leads, 1)) * 100
            
            # Calculate costs (simplified for demo)
            total_campaign_spend = sum([c.spent for c in self.campaigns.values()], Decimal('0.00'))
            cost_per_lead = total_campaign_spend / max(total_leads, 1)
            cost_per_acquisition = total_campaign_spend / max(converted_leads, 1) if converted_leads > 0 else Decimal('0.00')
            
            # Calculate LTV (average estimated value of converted leads)
            converted_lead_values = [l.estimated_value for l in self.leads.values() if l.status == LeadStatus.CONVERTED]
            customer_ltv = sum(converted_lead_values, Decimal('0.00')) / max(len(converted_lead_values), 1)
            
            # Calculate ROI
            total_revenue = sum(converted_lead_values, Decimal('0.00'))
            roi = float((total_revenue - total_campaign_spend) / max(total_campaign_spend, Decimal('1.00'))) * 100
            
            metrics = AcquisitionMetrics(
                total_leads=total_leads,
                qualified_leads=qualified_leads,
                conversion_rate=conversion_rate,
                cost_per_lead=cost_per_lead,
                cost_per_acquisition=cost_per_acquisition,
                customer_lifetime_value=customer_ltv,
                roi=roi,
                time_period="current"
            )
            
            return metrics
            
        except Exception as e:
            logger.error(f"❌ Failed to calculate acquisition metrics: {e}")
            return AcquisitionMetrics(0, 0, 0.0, Decimal('0'), Decimal('0'), Decimal('0'), 0.0, "error")
    
    async def save_lead(self, lead: Lead):
        """Save lead to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO leads 
                (id, email, name, company, job_title, country, source, status, score,
                 created_at, last_contact, conversion_probability, estimated_value, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                lead.id, lead.email, lead.name, lead.company, lead.job_title,
                lead.country, lead.source.value, lead.status.value, lead.score,
                lead.created_at, lead.last_contact, lead.conversion_probability,
                float(lead.estimated_value), json.dumps(lead.notes)
            ))
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Failed to save lead: {e}")
            raise
    
    async def save_campaign(self, campaign: Campaign):
        """Save campaign to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO campaigns 
                (id, name, type, status, start_date, end_date, budget, spent,
                 leads_generated, conversions, roi, target_audience)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                campaign.id, campaign.name, campaign.type.value, campaign.status,
                campaign.start_date, campaign.end_date, float(campaign.budget),
                float(campaign.spent), campaign.leads_generated, campaign.conversions,
                campaign.roi, json.dumps(campaign.target_audience)
            ))
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Failed to save campaign: {e}")
            raise
    
    async def load_leads(self):
        """Load leads from database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM leads")
            rows = cursor.fetchall()
            
            for row in rows:
                lead = Lead(
                    id=row[0],
                    email=row[1],
                    name=row[2],
                    company=row[3],
                    job_title=row[4],
                    country=row[5],
                    source=LeadSource(row[6]),
                    status=LeadStatus(row[7]),
                    score=row[8],
                    created_at=datetime.fromisoformat(row[9]),
                    last_contact=datetime.fromisoformat(row[10]) if row[10] else None,
                    conversion_probability=row[11],
                    estimated_value=Decimal(str(row[12])),
                    notes=json.loads(row[13]) if row[13] else []
                )
                self.leads[lead.id] = lead
            
            conn.close()
            logger.info(f"✅ Loaded {len(self.leads)} leads from database")
            
        except Exception as e:
            logger.error(f"❌ Failed to load leads: {e}")
    
    async def load_campaigns(self):
        """Load campaigns from database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM campaigns")
            rows = cursor.fetchall()
            
            for row in rows:
                campaign = Campaign(
                    id=row[0],
                    name=row[1],
                    type=CampaignType(row[2]),
                    status=row[3],
                    start_date=datetime.fromisoformat(row[4]),
                    end_date=datetime.fromisoformat(row[5]) if row[5] else None,
                    budget=Decimal(str(row[6])),
                    spent=Decimal(str(row[7])),
                    leads_generated=row[8],
                    conversions=row[9],
                    roi=row[10],
                    target_audience=json.loads(row[11]) if row[11] else {}
                )
                self.campaigns[campaign.id] = campaign
            
            conn.close()
            logger.info(f"✅ Loaded {len(self.campaigns)} campaigns from database")
            
        except Exception as e:
            logger.error(f"❌ Failed to load campaigns: {e}")

# Main execution function
async def main():
    """Main execution function for Phase 6.2 Customer Acquisition System"""
    try:
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        
        logger.info("🎯 Starting RomAI Phase 6.2 Customer Acquisition System...")
        
        # Initialize customer acquisition system
        acquisition_system = CustomerAcquisitionSystem()
        await acquisition_system.initialize()
        
        # Demo: Create sample campaigns
        logger.info("📝 Creating demo campaigns...")
        
        # Romanian market campaign
        campaign1 = await acquisition_system.create_campaign(
            name="Romanian AI Market Entry",
            campaign_type=CampaignType.CONTENT,
            budget=Decimal('5000.00'),
            target_audience={
                "countries": ["Romania"],
                "industries": ["technology", "finance", "healthcare"],
                "company_sizes": ["small", "medium", "enterprise"]
            }
        )
        
        # Enterprise outreach campaign
        campaign2 = await acquisition_system.create_campaign(
            name="Enterprise AI Solutions",
            campaign_type=CampaignType.EMAIL,
            budget=Decimal('10000.00'),
            target_audience={
                "job_titles": ["ceo", "cto", "it director"],
                "company_sizes": ["medium", "enterprise"],
                "industries": ["financial services", "healthcare", "manufacturing"]
            }
        )
        
        # Demo: Capture sample leads
        logger.info("📝 Capturing demo leads...")
        
        # High-value Romanian enterprise lead
        lead1 = await acquisition_system.capture_lead(
            email="director@techcorp.ro",
            name="Ion Popescu",
            company="TechCorp SRL",
            job_title="IT Director",
            country="Romania",
            source=LeadSource.CONTENT_MARKETING
        )
        
        # Startup lead
        lead2 = await acquisition_system.capture_lead(
            email="founder@startup.com",
            name="Maria Ionescu",
            company="AI Startup",
            job_title="CEO",
            country="Romania",
            source=LeadSource.REFERRAL
        )
        
        # International enterprise lead
        lead3 = await acquisition_system.capture_lead(
            email="manager@enterprise.com",
            name="John Smith",
            company="Global Enterprise Corp",
            job_title="AI Manager",
            country="Germany",
            source=LeadSource.PAID_SEARCH
        )
        
        # Qualify high-scoring leads
        if lead1.score >= 70:
            await acquisition_system.qualify_lead(lead1.id, "High-value Romanian enterprise lead")
        
        if lead2.score >= 60:
            await acquisition_system.start_nurturing(lead2.id, "startup_track")
        
        # Convert one lead for demo
        await acquisition_system.convert_lead(lead1.id, Decimal('299.99'))
        
        # Calculate acquisition metrics
        metrics = await acquisition_system.calculate_acquisition_metrics()
        
        # Display results
        logger.info("\n" + "=" * 80)
        logger.info("🎯 PHASE 6.2 CUSTOMER ACQUISITION RESULTS")
        logger.info("=" * 80)
        
        logger.info(f"📊 Acquisition Metrics:")
        logger.info(f"   👥 Total Leads: {metrics.total_leads}")
        logger.info(f"   ✅ Qualified Leads: {metrics.qualified_leads}")
        logger.info(f"   🎯 Conversion Rate: {metrics.conversion_rate:.2f}%")
        logger.info(f"   💰 Cost per Lead: €{metrics.cost_per_lead:.2f}")
        logger.info(f"   💸 Cost per Acquisition: €{metrics.cost_per_acquisition:.2f}")
        logger.info(f"   💎 Customer LTV: €{metrics.customer_lifetime_value:.2f}")
        logger.info(f"   📈 ROI: {metrics.roi:.2f}%")
        
        logger.info(f"\n📋 Lead Breakdown:")
        for lead in acquisition_system.leads.values():
            logger.info(f"   {lead.email}: Score={lead.score}, Status={lead.status.value}, Value=€{lead.estimated_value}")
        
        logger.info(f"\n📢 Campaign Overview:")
        for campaign in acquisition_system.campaigns.values():
            logger.info(f"   {campaign.name}: Budget=€{campaign.budget}, Type={campaign.type.value}")
        
        # Success determination
        success = (
            metrics.total_leads >= 3 and
            metrics.qualified_leads >= 1 and
            metrics.conversion_rate > 0
        )
        
        if success:
            logger.info("🎉 Phase 6.2 Customer Acquisition System SUCCESSFUL!")
        else:
            logger.info("⚠️ Phase 6.2 Customer Acquisition System completed with areas for improvement.")
        
        return success
        
    except Exception as e:
        logger.error(f"❌ Phase 6.2 execution failed: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(0 if result else 1)
