import py_eureka_client.eureka_client as eureka_client
import os
from app.config.settings import settings
from .settings import Settings
import asyncio
from typing import Optional
import socket
import httpx
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_eureka():
    eureka_server = settings.EUREKA_SERVER_URL
    app_name = settings.APP_NAME
    instance_port = settings.SERVER_PORT
    instance_host = settings.EUREKA_HOSTNAME
    instance_id = f"{app_name}:{os.urandom(4).hex()}"
    health_check_url = f"http://{instance_host}:{instance_port}/health"  # For Eureka to monitor health


    await eureka_client.init_async(
        eureka_server=eureka_server,
        app_name=app_name,
        instance_port=instance_port,
        instance_host=instance_host,
        instance_id=instance_id,
        health_check_url=health_check_url
    )
    
class EurekaClient:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.instance_id = f"{settings.APP_NAME}:{os.urandom(4).hex()}"#settings.instance_id or f"{settings.APP_NAME}:{self._get_local_ip()}:{settings.SERVER_PORT}"
        self.app_url = f"http://{self._get_local_ip()}:{settings.SERVER_PORT}"
        self.eureka_url = settings.EUREKA_SERVER_URL
        self.heartbeat_task: Optional[asyncio.Task] = None
        
    def _get_local_ip(self) -> str:
        """Get the local IP address"""
        try:
            # Connect to a remote address to determine local IP
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                s.connect(("8.8.8.8", 80))
                return s.getsockname()[0]
        except Exception:
            return "localhost"
    
    def _get_registration_data(self) -> dict:
        """Prepare the registration data for Eureka"""
        local_ip = self._get_local_ip()
        
        return {
            "instance": {
                "instanceId": self.instance_id,
                "app": self.settings.APP_NAME.upper(),
                "hostName": local_ip,
                "ipAddr": local_ip,
                "port": {
                    "$": self.settings.SERVER_PORT,
                    "@enabled": "true"
                },
                "securePort": {
                    "$": 443,
                    "@enabled": "false"
                },
                "homePageUrl": f"{self.app_url}/",
                "statusPageUrl": f"{self.app_url}/health",
                "healthCheckUrl": f"{self.app_url}/health",
                "vipAddress": self.settings.APP_NAME,
                "secureVipAddress": self.settings.APP_NAME,
                "status": "UP",
                "dataCenterInfo": {
                    "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                    "name": "MyOwn"
                }
            }
        }
    
    async def register(self) -> bool:
        """Register this instance with Eureka"""
        try:
            registration_data = self._get_registration_data()
            url = f"{self.eureka_url}/apps/{self.settings.APP_NAME.upper()}"

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    json=registration_data,
                    headers={"Content-Type": "application/json"},
                    timeout=10.0
                )
                
            if response.status_code == 204:
                logger.info(f"Successfully registered with Eureka: {self.instance_id}")
                return True
            else:
                logger.error(f"Failed to register with Eureka. Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error registering with Eureka: {e}")
            return False
    
    async def deregister(self) -> bool:
        """Deregister this instance from Eureka"""
        try:
            url = f"{self.eureka_url}/apps/{self.settings.APP_NAME.upper()}/{self.instance_id}"
            
            async with httpx.AsyncClient() as client:
                response = await client.delete(url, timeout=10.0)
                
            if response.status_code == 200:
                logger.info(f"Successfully deregistered from Eureka: {self.instance_id}")
                return True
            else:
                logger.error(f"Failed to deregister from Eureka. Status: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error deregistering from Eureka: {e}")
            return False
    
    async def send_heartbeat(self) -> bool:
        """Send heartbeat to Eureka to keep the registration alive"""
        try:
            url = f"{self.eureka_url}/apps/{self.settings.APP_NAME.upper()}/{self.instance_id}"
            
            async with httpx.AsyncClient() as client:
                response = await client.put(url, timeout=10.0)
                
            if response.status_code == 200:
                logger.debug(f"Heartbeat sent successfully: {self.instance_id}")
                return True
            else:
                logger.warning(f"Heartbeat failed. Status: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending heartbeat: {e}")
            return False
    
    async def start_heartbeat(self):
        """Start the heartbeat task"""
        async def heartbeat_loop():
            while True:
                await asyncio.sleep(self.settings.health_check_interval)
                await self.send_heartbeat()
        
        self.heartbeat_task = asyncio.create_task(heartbeat_loop())
        logger.info(f"Started heartbeat task with interval: {self.settings.health_check_interval}s")
    
    async def stop_heartbeat(self):
        """Stop the heartbeat task"""
        if self.heartbeat_task:
            self.heartbeat_task.cancel()
            try:
                await self.heartbeat_task
            except asyncio.CancelledError:
                pass
            logger.info("Stopped heartbeat task")
            
eureka_client = EurekaClient(settings)