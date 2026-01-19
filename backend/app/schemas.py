
from pydantic import BaseModel
from typing import Optional, Dict, Any

class CodeRequest(BaseModel):
    code: str
    language: str = "python"

class ComplexityMetrics(BaseModel):
    notation: str
    max_depth: int
    loop_count: int
    explanation: str

class CodeResponse(BaseModel):
    output: str
    error: str
    complexity: Optional[ComplexityMetrics] = None
