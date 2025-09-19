#!/usr/bin/env python3
"""
Test script to verify MongoDB connection configuration.
This script tests both the settings loading and the MongoDB connection.
"""

import os
import sys
from pathlib import Path

# Add the app directory to the path
sys.path.insert(0, str(Path(__file__).parent / "app"))

def test_settings():
    """Test if settings are loaded correctly."""
    print("Testing settings configuration...")
    try:
        from app.config.settings import settings
        print(f"MONGO_URI from settings: {settings.MONGO_URI}")
        print(f"Environment MONGO_URI: {os.getenv('MONGO_URI', 'Not set')}")
        return True
    except Exception as e:
        print(f"Failed to load settings: {e}")
        return False

def test_mongo_connection():
    """Test MongoDB connection."""
    print("\nTesting MongoDB connection...")
    try:
        from app.db.mongo import get_database
        
        # Test with default settings
        print("Attempting connection with settings...")
        db = get_database()
        print("✓ MongoDB connection successful!")
        
        # Test basic operations
        print("Testing basic database operations...")
        session_info = db.get_session_info("test_session")
        print("✓ Database operations working!")
        
        return True
    except Exception as e:
        print(f"✗ MongoDB connection failed: {e}")
        return False

def main():
    print("MongoDB Connection Test")
    print("=" * 50)
    
    settings_ok = test_settings()
    if not settings_ok:
        print("Settings test failed, exiting...")
        return 1
    
    mongo_ok = test_mongo_connection()
    if not mongo_ok:
        print("MongoDB connection test failed")
        return 1
    
    print("\n✓ All tests passed!")
    return 0

if __name__ == "__main__":
    sys.exit(main())