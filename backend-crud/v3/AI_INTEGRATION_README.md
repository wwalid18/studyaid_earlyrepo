# 🤖 AI Integration Guide for StudyAid Backend

This guide explains how to set up and use the AI-powered features in StudyAid Backend using Google's Gemini API.

## 🎯 Overview

The AI integration adds intelligent features to your StudyAid application:

1. **AI-Generated Summaries**: Automatically create comprehensive summaries from highlights
2. **AI-Generated Quizzes**: Generate interactive quizzes based on summaries
3. **Smart Content Analysis**: Intelligent processing of study materials

## 🚀 Quick Setup

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Environment

Create a `.env` file in your project root:

```bash
# Flask Configuration
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Database Configuration
SQLALCHEMY_DATABASE_URI=mysql+mysqlconnector://username:password@localhost/studyaid

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Test AI Setup

Run the AI setup script to verify everything is working:

```bash
python scripts/setup_ai.py
```

## 🔧 Configuration Options

### AI Model Settings

You can customize AI behavior in `app/config.py`:

```python
# AI Configuration
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
GEMINI_MODEL = 'gemini-1.5-flash'  # or 'gemini-1.5-pro'
MAX_TOKENS = 2048
TEMPERATURE = 0.7
```

**Model Options:**
- `gemini-1.5-flash`: Fast, cost-effective (recommended)
- `gemini-1.5-pro`: More powerful, higher cost

**Temperature:**
- `0.0-0.3`: More focused, consistent outputs
- `0.7-1.0`: More creative, varied outputs

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
  "model": "gemini-1.5-flash",
  "api_key_configured": true
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
- ✅ API key validity
- ✅ AI service connection
- ✅ Summary generation
- ✅ Quiz generation

## 🔍 Troubleshooting

### Common Issues

#### 1. "GEMINI_API_KEY not found"
**Solution:** Set the environment variable in your `.env` file

#### 2. "AI service connection failed"
**Solutions:**
- Check your internet connection
- Verify API key is correct
- Check Gemini API quotas

#### 3. "Failed to generate summary/quiz"
**Solutions:**
- Check API key permissions
- Verify content length (not too long/short)
- Check API rate limits

#### 4. "Invalid quiz structure generated"
**Solutions:**
- The AI might return malformed JSON
- System will fallback to static content
- Check API response format

### Debug Mode

Enable debug logging in your Flask app:

```python
app.run(debug=True)
```

Check console output for AI service errors.

## 💡 Best Practices

### For Summary Generation

1. **Select relevant highlights**: Choose highlights that are related and meaningful
2. **Aim for 3-10 highlights**: Too few may not provide enough content, too many may overwhelm
3. **Include diverse sources**: Mix different types of content for better summaries

### For Quiz Generation

1. **Use comprehensive summaries**: Detailed summaries generate better questions
2. **Specify question count**: 3-5 questions work well for most content
3. **Review generated questions**: AI is good but human review helps

### Performance Optimization

1. **Use gemini-1.5-flash**: Faster and more cost-effective for most use cases
2. **Set appropriate temperature**: Lower values for more consistent outputs
3. **Implement caching**: Consider caching AI responses for repeated content

## 🔒 Security Considerations

1. **API Key Protection**: Never commit API keys to version control
2. **Rate Limiting**: Implement rate limiting for AI endpoints
3. **Content Validation**: Validate user content before sending to AI
4. **Error Handling**: Graceful fallbacks when AI service is unavailable

## 📊 Monitoring

### AI Health Monitoring

Use the admin endpoint to monitor AI service health:

```bash
curl -H "Authorization: Bearer <admin_token>" \
     http://localhost:5000/api/admin/ai-health
```

### Usage Tracking

Monitor API usage through:
- Gemini API console
- Application logs
- Database analytics

## 🚀 Advanced Features

### Custom Prompts

You can customize AI prompts in `app/utils/ai_service.py`:

```python
def generate_summary_from_highlights(self, highlights, collection_title=None):
    # Customize the prompt for your specific needs
    prompt = f"""
    You are an expert educational content summarizer...
    """
```

### Multiple AI Models

Support for different AI models can be added by extending the `AIService` class.

### Caching Layer

Implement caching for AI responses to improve performance and reduce costs.

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run the setup script: `python scripts/setup_ai.py`
3. Review application logs
4. Test with the comprehensive test suite: `python test_api.py`

## 🎉 Success!

Once setup is complete, your StudyAid backend will automatically:

- Generate intelligent summaries from highlights
- Create educational quizzes from summaries
- Provide fallback content when AI is unavailable
- Maintain all existing functionality

The AI integration enhances the learning experience while maintaining reliability and performance. 