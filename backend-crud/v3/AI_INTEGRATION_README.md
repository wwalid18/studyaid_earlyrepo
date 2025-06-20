# 🤖 AI Integration Guide for StudyAid Backend

This guide explains how to set up and use the AI-powered features in StudyAid Backend.

## 🎯 Overview

The AI integration adds intelligent features to your StudyAid application:

1. **AI-Generated Summaries**: Automatically create comprehensive summaries from highlights
2. **AI-Generated Quizzes**: Generate interactive quizzes based on summaries
3. **Smart Content Analysis**: Intelligent processing of study materials

## 🚀 Quick Setup

### 1. Configure Environment

Add any required AI config for Groq here (coming soon).

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Test AI Setup

Run the AI setup script to verify everything is working:

```bash
python scripts/setup_ai.py
```

## 📝 How It Works

### Summary Generation Process

1. **User creates highlights** from web content
2. **User selects highlights** for summary generation
3. **AI processes highlights** using intelligent prompts
4. **AI generates comprehensive summary** with:
   - Key concepts synthesis
   - Logical flow and coherence
   - Academic language
   - Structured organization

### Quiz Generation Process

1. **User creates summary** (AI-generated or manual)
2. **User requests quiz generation**
3. **AI analyzes summary content**
4. **AI generates multiple-choice questions** with:
   - 4 options per question (A, B, C, D)
   - One correct answer
   - Clear, unambiguous language
   - Educational assessment quality

## 🛠️ API Endpoints

### Summary Endpoints

#### Create AI Summary
```http
POST /api/summaries
Content-Type: application/json
Authorization: Bearer <token>

{
  "collection_id": "uuid",
  "highlight_ids": ["uuid1", "uuid2", "uuid3"]
}
```

#### Regenerate Summary with AI
```http
POST /api/summaries/{summary_id}/regenerate
Authorization: Bearer <token>
```

### Quiz Endpoints

#### Create AI Quiz
```http
POST /api/quizzes
Content-Type: application/json
Authorization: Bearer <token>

{
  "summary_id": "uuid",
  "num_questions": 4
}
```

#### Regenerate Quiz with AI
```http
POST /api/quizzes/{quiz_id}/regenerate
Content-Type: application/json
Authorization: Bearer <token>

{
  "num_questions": 3
}
```

### Admin Endpoints

#### Check AI Health
```http
GET /api/admin/ai-health
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "ai_service_status": "working",
  "model": null,
  "api_key_configured": false
}
```

## 🧪 Testing

### Run Comprehensive Tests

```bash
python test_api.py
```

This will test:
- ✅ AI summary generation
- ✅ AI quiz generation
- ✅ Summary regeneration
- ✅ Quiz regeneration
- ✅ AI health checks
- ✅ All existing functionality

### Test AI Setup

```bash
python scripts/setup_ai.py
```

This will verify:
- ✅ Environment configuration
- ✅ AI service connection
- ✅ Summary generation
- ✅ Quiz generation

## 🔍 Troubleshooting

If you encounter issues:

1. Run the setup script: `python scripts/setup_ai.py`
2. Review application logs
3. Test with the comprehensive test suite: `python test_api.py`

## 🎉 Success!

Once setup is complete, your StudyAid backend will automatically:

- Generate intelligent summaries from highlights
- Create educational quizzes from summaries
- Provide fallback content when AI is unavailable
- Maintain all existing functionality

The AI integration enhances the learning experience while maintaining reliability and performance. 