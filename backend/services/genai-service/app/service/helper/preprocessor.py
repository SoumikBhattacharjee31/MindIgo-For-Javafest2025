from re import sub, IGNORECASE

def preprocess_text(text: str) -> str:
        """Fast text preprocessing."""
        if not text:
            return ""
    
        text = sub(r'\s+', ' ', text.strip())
        text = sub(r'[!]{3,}', '!!', text)
        text = sub(r'[?]{3,}', '??', text)
        text = sub(r'[.]{4,}', '...', text)
        
        fixes = {
            r'\bu\b': 'you', r'\bur\b': 'your', r'\br\b': 'are',
            r'\bidk\b': "I don't know", r'\bomg\b': 'oh my god'
        }
        
        for pattern, replacement in fixes.items():
            text = sub(pattern, replacement, text, flags=IGNORECASE)
        
        return text

def quick_crisis_check(text: str) -> bool:
    """Fast crisis detection."""
    text_lower = text.lower()
    crisis_patterns = [
        'kill myself', 'end my life', 'suicide', 'want to die', 'better off dead',
        'hurt myself', 'self harm', 'cut myself', 'overdose', 'ending it all'
    ]
    return any(pattern in text_lower for pattern in crisis_patterns)
