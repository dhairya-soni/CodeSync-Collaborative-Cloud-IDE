from pydantic import BaseModel
from typing import Optional

SUPPORTED_LANGUAGES = {
    "python", "javascript", "typescript", "go", "cpp", "java", "rust"
}

class CodeRequest(BaseModel):
    code: str
    language: str = "python"

class ComplexityMetrics(BaseModel):
    big_o: str
    loop_depth: int
    loop_count: int
    explanation: str
    space_complexity: str = "O(1)"
    space_explanation: str = ""
    has_recursion: bool = False
    has_sort: bool = False

class CodeResponse(BaseModel):
    output: str
    error: str
    duration_ms: int = 0
    complexity: Optional[ComplexityMetrics] = None
