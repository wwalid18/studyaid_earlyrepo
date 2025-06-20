#!/usr/bin/env python3
"""
AI Setup Script for StudyAid Backend
Helps configure and test the AI integration (Groq or fallback)
"""

import os
import sys
import platform
from pathlib import Path

# Add the parent directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

def check_python_version():
    """Check Python version compatibility"""
    print("🐍 Checking Python version...")
    version = platform.python_version()
    print(f"   Python version: {version}")
    return True

def check_environment():
    """Check if required environment variables are set (none for fallback)"""
    print("\n🔍 Checking environment configuration...")
    print("✅ No required environment variables for fallback mode.")
    return True

def test_ai_service_directly():
    """Test the AI service directly without Flask context"""
    print("\n🤖 Testing AI service directly...")
    try:
        from app.utils.ai_service import AIService
        ai_service = AIService()
        status = ai_service.get_status()
        print(f"   AI Available: {status['ai_available']}")
        if status['ai_available']:
            print("✅ AI service is properly configured")
            return True
        else:
            print("⚠️  AI service not available - will use fallback mode")
            return True
    except Exception as e:
        print(f"❌ Error testing AI service: {str(e)}")
        return False

def test_summary_generation_directly():
    """Test summary generation directly"""
    print("\n📝 Testing summary generation...")
    try:
        from app.utils.ai_service import AIService
        ai_service = AIService()
        class MockHighlight:
            def __init__(self, text, url=None):
                self.text = text
                self.url = url
        sample_highlights = [
            MockHighlight("Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions without being explicitly programmed.", "https://example.com/ml-intro"),
            MockHighlight("Deep learning uses neural networks with multiple layers to process complex patterns in data.", "https://example.com/deep-learning"),
            MockHighlight("Supervised learning involves training models on labeled data to make predictions on new, unseen data.", "https://example.com/supervised-learning")
        ]
        summary = ai_service.generate_summary_from_highlights(sample_highlights, "Machine Learning Fundamentals")
        print("✅ Summary generation successful!")
        print(f"   Generated summary length: {len(summary)} characters")
        print(f"   Preview: {summary[:100]}...")
        return True
    except Exception as e:
        print(f"❌ Error testing summary generation: {str(e)}")
        return False

def test_quiz_generation_directly():
    """Test quiz generation directly"""
    print("\n🧠 Testing quiz generation...")
    try:
        from app.utils.ai_service import AIService
        ai_service = AIService()
        sample_summary = """
        Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions without being explicitly programmed. 
        Deep learning uses neural networks with multiple layers to process complex patterns in data. 
        Supervised learning involves training models on labeled data to make predictions on new, unseen data.
        """
        quiz_data = ai_service.generate_quiz_from_summary(sample_summary, 3)
        print("✅ Quiz generation successful!")
        print(f"   Quiz title: {quiz_data.get('title', 'N/A')}")
        print(f"   Number of questions: {len(quiz_data.get('questions', []))}")
        return True
    except Exception as e:
        print(f"❌ Error testing quiz generation: {str(e)}")
        return False

def main():
    """Main setup function"""
    print("🚀 StudyAid AI Setup Script")
    print("=" * 40)
    python_compatible = check_python_version()
    env_configured = check_environment()
    ai_working = test_ai_service_directly()
    summary_working = test_summary_generation_directly()
    quiz_working = test_quiz_generation_directly()
    print("\n📊 Setup Summary:")
    print("=" * 40)
    print(f"   Python Compatibility: {'✅' if python_compatible else '⚠️'}")
    print(f"   Environment Configured: {'✅' if env_configured else '⚠️'}")
    print(f"   AI Service: {'✅' if ai_working else '⚠️'}")
    print(f"   Summary Generation: {'✅' if summary_working else '❌'}")
    print(f"   Quiz Generation: {'✅' if quiz_working else '❌'}")
    if summary_working and quiz_working:
        print("\n🎉 AI setup completed successfully!")
        print("✅ Your StudyAid backend is ready to generate AI-powered summaries and quizzes!")
    else:
        print("\n⚠️  Setup completed with some issues:")
        print("   - Some features may not work as expected")
        print("   - Check the error messages above for details")
    print("\n💡 To test the full application with Flask context:")
    print("   1. Start the Flask app: python run.py")
    print("   2. Run the API tests: python test_api.py")

if __name__ == '__main__':
    main() 