"""
RomAI Action Executor

High-performance action execution engine that provides concrete implementations
for various action types. Works in conjunction with the Action Orchestrator
to deliver real-world task execution capabilities.

Key Features:
- Secure API interactions
- File system operations with safety constraints
- Web scraping and browser automation 
- Database operations
- Email and notification systems
- System integrations
- Romanian cultural context awareness

Author: RomAI Development Team
Version: 1.0.0
Date: August 25, 2025
"""

import os
import json
import asyncio
import aiohttp
import aiofiles
import smtplib
import sqlite3
import subprocess
from datetime import datetime
from typing import Dict, List, Any, Optional, Union
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path

import requests
from bs4 import BeautifulSoup
import pandas as pd

from .action_orchestrator import ActionType, ActionRequest, ActionResult, ActionStatus


class ActionExecutor:
    """Concrete implementation of action execution capabilities."""
    
    def __init__(self):
        self.session = None
        self.db_connections = {}
        self.email_configs = {}
        
    async def __aenter__(self):
        """Async context manager entry."""
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()
            
        # Close database connections
        for conn in self.db_connections.values():
            if hasattr(conn, 'close'):
                conn.close()
    
    # API Operations
    async def execute_api_call(self, request: ActionRequest) -> Dict[str, Any]:
        """Execute HTTP API calls with comprehensive support."""
        params = request.parameters
        
        method = params.get("method", "GET").upper()
        url = params.get("url")
        headers = params.get("headers", {})
        data = params.get("data")
        json_data = params.get("json")
        timeout = params.get("timeout", 30)
        
        if not url:
            raise ValueError("URL is required for API calls")
            
        # Security validation
        if not self._is_safe_url(url):
            raise ValueError("URL not allowed for security reasons")
            
        try:
            if self.session is None:
                self.session = aiohttp.ClientSession()
                
            async with self.session.request(
                method=method,
                url=url,
                headers=headers,
                data=data,
                json=json_data,
                timeout=aiohttp.ClientTimeout(total=timeout)
            ) as response:
                
                result = {
                    "status_code": response.status,
                    "headers": dict(response.headers),
                    "url": str(response.url)
                }
                
                # Try to parse as JSON first, then fall back to text
                try:
                    result["data"] = await response.json()
                except:
                    result["data"] = await response.text()
                    
                return result
                
        except asyncio.TimeoutError:
            raise ValueError(f"API call timed out after {timeout} seconds")
        except Exception as e:
            raise ValueError(f"API call failed: {str(e)}")
    
    def _is_safe_url(self, url: str) -> bool:
        """Validate URL for security."""
        # Block internal network addresses
        blocked_hosts = [
            "localhost", "127.0.0.1", "0.0.0.0", "::1",
            "192.168.", "10.", "172.16.", "172.17.", "172.18.",
            "172.19.", "172.20.", "172.21.", "172.22.", "172.23.",
            "172.24.", "172.25.", "172.26.", "172.27.", "172.28.",
            "172.29.", "172.30.", "172.31."
        ]
        
        for blocked in blocked_hosts:
            if blocked in url.lower():
                return False
                
        return url.startswith(("http://", "https://"))
    
    # File Operations
    async def execute_file_operation(self, request: ActionRequest) -> str:
        """Execute file system operations with security constraints."""
        params = request.parameters
        operation = params.get("operation")
        file_path = params.get("path")
        
        if not file_path:
            raise ValueError("File path is required")
            
        # Security validation
        if not self._is_safe_path(file_path):
            raise ValueError("File path not allowed for security reasons")
            
        path = Path(file_path)
        
        try:
            if operation == "read":
                if not path.exists():
                    raise ValueError(f"File does not exist: {file_path}")
                    
                async with aiofiles.open(path, "r", encoding="utf-8") as f:
                    content = await f.read()
                return content
                
            elif operation == "write":
                content = params.get("content", "")
                
                # Create directory if it doesn't exist
                path.parent.mkdir(parents=True, exist_ok=True)
                
                async with aiofiles.open(path, "w", encoding="utf-8") as f:
                    await f.write(content)
                return f"File written successfully: {file_path}"
                
            elif operation == "append":
                content = params.get("content", "")
                
                async with aiofiles.open(path, "a", encoding="utf-8") as f:
                    await f.write(content)
                return f"Content appended to file: {file_path}"
                
            elif operation == "delete":
                if path.exists():
                    path.unlink()
                    return f"File deleted: {file_path}"
                else:
                    return f"File does not exist: {file_path}"
                    
            elif operation == "list":
                if path.is_dir():
                    files = [str(p) for p in path.iterdir()]
                    return json.dumps(files, indent=2)
                else:
                    raise ValueError("Path is not a directory")
                    
            elif operation == "info":
                if path.exists():
                    stat = path.stat()
                    info = {
                        "path": str(path),
                        "size": stat.st_size,
                        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                        "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                        "is_file": path.is_file(),
                        "is_dir": path.is_dir()
                    }
                    return json.dumps(info, indent=2)
                else:
                    raise ValueError(f"Path does not exist: {file_path}")
                    
            else:
                raise ValueError(f"Unsupported file operation: {operation}")
                
        except Exception as e:
            raise ValueError(f"File operation failed: {str(e)}")
    
    def _is_safe_path(self, path: str) -> bool:
        """Validate file path for security."""
        # Convert to Path object for normalization
        try:
            path_obj = Path(path).resolve()
        except:
            return False
            
        # Block access outside of allowed directories
        allowed_dirs = [
            Path.cwd(),  # Current working directory
            Path.home() / "Documents",  # User documents
            Path.home() / "Downloads",  # User downloads
            Path("/tmp") if os.name != "nt" else Path(os.environ.get("TEMP", "C:\\temp"))
        ]
        
        # Check if path is within allowed directories
        for allowed_dir in allowed_dirs:
            try:
                path_obj.relative_to(allowed_dir.resolve())
                return True
            except ValueError:
                continue
                
        return False
    
    # Web Interaction
    async def execute_web_interaction(self, request: ActionRequest) -> Dict[str, Any]:
        """Execute web scraping and interaction tasks."""
        params = request.parameters
        action = params.get("action", "scrape")
        url = params.get("url")
        
        if not url:
            raise ValueError("URL is required for web interactions")
            
        if not self._is_safe_url(url):
            raise ValueError("URL not allowed for security reasons")
            
        try:
            if action == "scrape":
                return await self._scrape_webpage(url, params)
            elif action == "extract_links":
                return await self._extract_links(url, params)
            elif action == "extract_text":
                return await self._extract_text(url, params)
            else:
                raise ValueError(f"Unsupported web action: {action}")
                
        except Exception as e:
            raise ValueError(f"Web interaction failed: {str(e)}")
    
    async def _scrape_webpage(self, url: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Scrape webpage content."""
        selector = params.get("selector")
        
        if self.session is None:
            self.session = aiohttp.ClientSession()
            
        async with self.session.get(url) as response:
            html = await response.text()
            
        soup = BeautifulSoup(html, 'html.parser')
        
        result = {
            "url": url,
            "title": soup.title.string if soup.title else "",
            "status_code": response.status
        }
        
        if selector:
            elements = soup.select(selector)
            result["selected_content"] = [elem.get_text().strip() for elem in elements]
        else:
            result["content"] = soup.get_text().strip()
            
        return result
    
    async def _extract_links(self, url: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Extract links from webpage."""
        if self.session is None:
            self.session = aiohttp.ClientSession()
            
        async with self.session.get(url) as response:
            html = await response.text()
            
        soup = BeautifulSoup(html, 'html.parser')
        links = []
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.get_text().strip()
            
            # Convert relative URLs to absolute
            if href.startswith('/'):
                from urllib.parse import urljoin
                href = urljoin(url, href)
                
            links.append({"url": href, "text": text})
            
        return {"url": url, "links": links, "count": len(links)}
    
    async def _extract_text(self, url: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Extract clean text from webpage."""
        if self.session is None:
            self.session = aiohttp.ClientSession()
            
        async with self.session.get(url) as response:
            html = await response.text()
            
        soup = BeautifulSoup(html, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
            
        # Get text
        text = soup.get_text()
        
        # Break into lines and remove leading and trailing space on each
        lines = (line.strip() for line in text.splitlines())
        
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        
        # Drop blank lines
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return {"url": url, "text": text, "length": len(text)}
    
    # Database Operations
    async def execute_database_query(self, request: ActionRequest) -> Dict[str, Any]:
        """Execute database queries with security constraints."""
        params = request.parameters
        database = params.get("database", "default")
        query = params.get("query")
        query_params = params.get("params", [])
        
        if not query:
            raise ValueError("Query is required for database operations")
            
        # Security validation
        if not self._is_safe_query(query):
            raise ValueError("Query contains potentially dangerous operations")
            
        try:
            # For demo purposes, using SQLite. In production, would support multiple DB types
            db_path = f"data/{database}.db"
            
            # Ensure data directory exists
            Path("data").mkdir(exist_ok=True)
            
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row  # Enable dict-like access
            
            cursor = conn.cursor()
            
            if query.strip().upper().startswith('SELECT'):
                cursor.execute(query, query_params)
                rows = cursor.fetchall()
                result = {
                    "query": query,
                    "rows": [dict(row) for row in rows],
                    "count": len(rows)
                }
            else:
                cursor.execute(query, query_params)
                conn.commit()
                result = {
                    "query": query,
                    "rows_affected": cursor.rowcount,
                    "message": "Query executed successfully"
                }
                
            conn.close()
            return result
            
        except Exception as e:
            raise ValueError(f"Database query failed: {str(e)}")
    
    def _is_safe_query(self, query: str) -> bool:
        """Validate SQL query for security."""
        query_upper = query.upper().strip()
        
        # Block dangerous operations
        dangerous_keywords = [
            'DROP TABLE', 'DROP DATABASE', 'DROP INDEX', 'DROP VIEW',
            'ALTER TABLE', 'TRUNCATE', 'DELETE FROM',
            'GRANT', 'REVOKE', 'CREATE USER', 'DROP USER',
            'SHUTDOWN', 'EXEC', 'EXECUTE'
        ]
        
        for keyword in dangerous_keywords:
            if keyword in query_upper:
                return False
                
        return True
    
    # Email Operations
    async def execute_email_send(self, request: ActionRequest) -> Dict[str, Any]:
        """Send emails with proper configuration."""
        params = request.parameters
        
        to_email = params.get("to")
        subject = params.get("subject", "")
        body = params.get("body", "")
        from_email = params.get("from")
        smtp_server = params.get("smtp_server")
        smtp_port = params.get("smtp_port", 587)
        username = params.get("username")
        password = params.get("password")
        
        if not all([to_email, from_email, smtp_server, username, password]):
            raise ValueError("Missing required email configuration")
            
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = from_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add body to email
            msg.attach(MIMEText(body, 'plain'))
            
            # Gmail SMTP configuration
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()  # Enable security
            server.login(username, password)
            
            # Send email
            text = msg.as_string()
            server.sendmail(from_email, to_email, text)
            server.quit()
            
            return {
                "status": "sent",
                "to": to_email,
                "subject": subject,
                "message": "Email sent successfully"
            }
            
        except Exception as e:
            raise ValueError(f"Email send failed: {str(e)}")
    
    # Notification Operations
    async def execute_notification(self, request: ActionRequest) -> Dict[str, Any]:
        """Send notifications through various channels."""
        params = request.parameters
        
        notification_type = params.get("type", "console")
        message = params.get("message", "")
        title = params.get("title", "RomAI Notification")
        
        try:
            if notification_type == "console":
                print(f"🔔 {title}: {message}")
                return {"status": "sent", "type": "console", "message": message}
                
            elif notification_type == "desktop":
                # For cross-platform desktop notifications
                if os.name == "nt":  # Windows
                    import win10toast
                    toaster = win10toast.ToastNotifier()
                    toaster.show_toast(title, message, duration=10)
                else:  # Linux/Mac
                    subprocess.run([
                        "notify-send", title, message
                    ], check=False)
                    
                return {"status": "sent", "type": "desktop", "message": message}
                
            elif notification_type == "webhook":
                webhook_url = params.get("webhook_url")
                if not webhook_url:
                    raise ValueError("Webhook URL is required")
                    
                payload = {
                    "title": title,
                    "message": message,
                    "timestamp": datetime.now().isoformat()
                }
                
                if self.session is None:
                    self.session = aiohttp.ClientSession()
                    
                async with self.session.post(webhook_url, json=payload) as response:
                    return {
                        "status": "sent",
                        "type": "webhook", 
                        "message": message,
                        "webhook_status": response.status
                    }
                    
            else:
                raise ValueError(f"Unsupported notification type: {notification_type}")
                
        except Exception as e:
            raise ValueError(f"Notification send failed: {str(e)}")
    
    # System Command Operations
    async def execute_system_command(self, request: ActionRequest) -> Dict[str, Any]:
        """Execute system commands with security restrictions."""
        params = request.parameters
        command = params.get("command")
        
        if not command:
            raise ValueError("Command is required")
            
        # Security whitelist
        allowed_commands = [
            "ls", "dir", "pwd", "whoami", "date", "echo", "cat", "head", "tail",
            "python", "node", "npm", "pip", "git", "curl", "wget"
        ]
        
        command_parts = command.split()
        if not any(command_parts[0] == allowed_cmd for allowed_cmd in allowed_commands):
            raise ValueError(f"Command not allowed: {command_parts[0]}")
            
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30,
                cwd=Path.cwd()
            )
            
            return {
                "command": command,
                "return_code": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "success": result.returncode == 0
            }
            
        except subprocess.TimeoutExpired:
            raise ValueError("Command execution timed out")
        except Exception as e:
            raise ValueError(f"Command execution failed: {str(e)}")
    
    # Data Processing Operations
    async def execute_data_processing(self, request: ActionRequest) -> Dict[str, Any]:
        """Execute data processing tasks."""
        params = request.parameters
        operation = params.get("operation")
        data = params.get("data")
        
        if not operation:
            raise ValueError("Operation type is required")
            
        try:
            if operation == "csv_analysis":
                return await self._analyze_csv(data, params)
            elif operation == "json_transform":
                return await self._transform_json(data, params)
            elif operation == "data_validation":
                return await self._validate_data(data, params)
            elif operation == "statistical_analysis":
                return await self._statistical_analysis(data, params)
            else:
                raise ValueError(f"Unsupported data processing operation: {operation}")
                
        except Exception as e:
            raise ValueError(f"Data processing failed: {str(e)}")
    
    async def _analyze_csv(self, data: Any, params: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze CSV data."""
        if isinstance(data, str):
            # Assume it's a file path
            df = pd.read_csv(data)
        else:
            # Assume it's CSV content
            from io import StringIO
            df = pd.read_csv(StringIO(str(data)))
            
        analysis = {
            "shape": df.shape,
            "columns": df.columns.tolist(),
            "dtypes": df.dtypes.to_dict(),
            "missing_values": df.isnull().sum().to_dict(),
            "summary_stats": df.describe().to_dict()
        }
        
        return analysis
    
    async def _transform_json(self, data: Any, params: Dict[str, Any]) -> Dict[str, Any]:
        """Transform JSON data."""
        if isinstance(data, str):
            data = json.loads(data)
            
        transformation = params.get("transformation", "identity")
        
        if transformation == "flatten":
            # Flatten nested JSON
            def flatten_dict(d, parent_key='', sep='_'):
                items = []
                for k, v in d.items():
                    new_key = f"{parent_key}{sep}{k}" if parent_key else k
                    if isinstance(v, dict):
                        items.extend(flatten_dict(v, new_key, sep=sep).items())
                    else:
                        items.append((new_key, v))
                return dict(items)
                
            if isinstance(data, dict):
                result = flatten_dict(data)
            else:
                result = data
                
        elif transformation == "extract_keys":
            keys = params.get("keys", [])
            if isinstance(data, dict):
                result = {k: data.get(k) for k in keys if k in data}
            else:
                result = data
        else:
            result = data
            
        return {"original": data, "transformed": result, "transformation": transformation}
    
    async def _validate_data(self, data: Any, params: Dict[str, Any]) -> Dict[str, Any]:
        """Validate data against schema or rules."""
        rules = params.get("rules", {})
        errors = []
        
        if isinstance(data, dict):
            for key, rule in rules.items():
                if key not in data:
                    if rule.get("required", False):
                        errors.append(f"Missing required field: {key}")
                else:
                    value = data[key]
                    data_type = rule.get("type")
                    
                    if data_type and not isinstance(value, eval(data_type)):
                        errors.append(f"Field {key} should be {data_type}, got {type(value).__name__}")
                        
        return {"valid": len(errors) == 0, "errors": errors, "data": data}
    
    async def _statistical_analysis(self, data: Any, params: Dict[str, Any]) -> Dict[str, Any]:
        """Perform statistical analysis on numerical data."""
        if isinstance(data, str):
            # Try to parse as CSV
            from io import StringIO
            df = pd.read_csv(StringIO(data))
        elif isinstance(data, list):
            df = pd.DataFrame(data)
        else:
            df = pd.DataFrame([data])
            
        # Select only numeric columns
        numeric_df = df.select_dtypes(include=[np.number])
        
        if numeric_df.empty:
            return {"error": "No numeric data found for statistical analysis"}
            
        stats = {
            "count": numeric_df.count().to_dict(),
            "mean": numeric_df.mean().to_dict(),
            "median": numeric_df.median().to_dict(),
            "std": numeric_df.std().to_dict(),
            "min": numeric_df.min().to_dict(),
            "max": numeric_df.max().to_dict(),
            "correlation": numeric_df.corr().to_dict()
        }
        
        return stats


# Global executor instance
_executor_instance = None


def get_executor() -> ActionExecutor:
    """Get the global action executor instance."""
    global _executor_instance
    if _executor_instance is None:
        _executor_instance = ActionExecutor()
    return _executor_instance


if __name__ == "__main__":
    # Example usage and testing
    async def test_executor():
        """Test the action executor."""
        print("🔧 Testing RomAI Action Executor")
        
        async with ActionExecutor() as executor:
            # Test API call
            print("\n1. Testing API call...")
            api_request = ActionRequest(
                action_type=ActionType.API_CALL,
                parameters={
                    "method": "GET",
                    "url": "https://httpbin.org/json"
                }
            )
            
            try:
                api_result = await executor.execute_api_call(api_request)
                print(f"API Status: {api_result['status_code']}")
                print(f"API Data: {api_result.get('data', {})}")
            except Exception as e:
                print(f"API Error: {e}")
            
            # Test file operation
            print("\n2. Testing file operation...")
            file_request = ActionRequest(
                action_type=ActionType.FILE_OPERATION,
                parameters={
                    "operation": "write",
                    "path": "test_output.txt",
                    "content": "Hello from RomAI Action Executor!"
                }
            )
            
            try:
                file_result = await executor.execute_file_operation(file_request)
                print(f"File Result: {file_result}")
            except Exception as e:
                print(f"File Error: {e}")
            
            # Test notification
            print("\n3. Testing notification...")
            notif_request = ActionRequest(
                action_type=ActionType.NOTIFICATION,
                parameters={
                    "type": "console",
                    "title": "Test Notification",
                    "message": "Action Executor is working!"
                }
            )
            
            try:
                notif_result = await executor.execute_notification(notif_request)
                print(f"Notification Result: {notif_result}")
            except Exception as e:
                print(f"Notification Error: {e}")
            
        print("\n✅ Action Executor testing completed!")
    
    # Run the test
    import numpy as np  # Required for statistical analysis
    asyncio.run(test_executor())