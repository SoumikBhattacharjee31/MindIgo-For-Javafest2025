import py_eureka_client.eureka_client as eureka_client
import os
from app.config.settings import settings

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