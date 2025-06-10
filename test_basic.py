#!/usr/bin/env python3
"""
Quick test script to verify EchoLearn backend functionality
Run this after setting up the backend to ensure everything works
"""

import requests
import json
import sys

API_BASE = "http://localhost:8000"

def test_health_check():
    """Test if the API is running"""
    try:
        response = requests.get(f"{API_BASE}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure the backend is running!")
        return False

def test_create_session():
    """Test session creation"""
    try:
        response = requests.post(f"{API_BASE}/sessions/", params={"title": "Test Session"})
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Session created: ID {data['session_id']}")
            return data['session_id']
        else:
            print(f"❌ Session creation failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Session creation error: {e}")
        return None

def test_asl_translation():
    """Test ASL translation"""
    try:
        test_text = "Hello world"
        response = requests.post(f"{API_BASE}/asl/translate/", params={"text": test_text})
        if response.status_code == 200:
            data = response.json()
            print(f"✅ ASL translation works: {len(data.get('signs', []))} signs generated")
            return True
        else:
            print(f"❌ ASL translation failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ASL translation error: {e}")
        return False

def test_api_docs():
    """Test if API documentation is accessible"""
    try:
        response = requests.get(f"{API_BASE}/docs")
        if response.status_code == 200:
            print("✅ API documentation is accessible at /docs")
            return True
        else:
            print(f"❌ API docs failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API docs error: {e}")
        return False

def main():
    print("🧪 Testing EchoLearn Backend...")
    print("=" * 50)
    
    # Run tests
    tests_passed = 0
    total_tests = 4
    
    if test_health_check():
        tests_passed += 1
    
    if test_api_docs():
        tests_passed += 1
    
    session_id = test_create_session()
    if session_id:
        tests_passed += 1
    
    if test_asl_translation():
        tests_passed += 1
    
    print("=" * 50)
    print(f"Tests passed: {tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("🎉 All tests passed! EchoLearn backend is working correctly.")
        print(f"🌐 API is running at: {API_BASE}")
        print(f"📚 Documentation: {API_BASE}/docs")
        return 0
    else:
        print("⚠️  Some tests failed. Check the backend setup.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 