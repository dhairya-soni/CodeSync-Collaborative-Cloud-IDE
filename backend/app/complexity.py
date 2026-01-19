
import ast

class ComplexityAnalyzer(ast.NodeVisitor):
    def __init__(self):
        self.max_depth = 0
        self.current_depth = 0
        self.loop_count = 0

    def visit_For(self, node):
        self.loop_count += 1
        self.current_depth += 1
        self.max_depth = max(self.max_depth, self.current_depth)
        self.generic_visit(node)
        self.current_depth -= 1

    def visit_While(self, node):
        self.loop_count += 1
        self.current_depth += 1
        self.max_depth = max(self.max_depth, self.current_depth)
        self.generic_visit(node)
        self.current_depth -= 1

def analyze_complexity(code: str):
    try:
        tree = ast.parse(code)
        analyzer = ComplexityAnalyzer()
        analyzer.visit(tree)

        # Basic Big-O Heuristic
        if analyzer.max_depth == 0:
            notation = "O(1)"
            explanation = "No loops detected. Operations are constant time."
        elif analyzer.max_depth == 1:
            notation = "O(n)"
            explanation = "Single loop detected. Time complexity grows linearly with input."
        elif analyzer.max_depth == 2:
            notation = "O(n²)"
            explanation = "Nested loops detected. This indicates quadratic time complexity."
        else:
            notation = f"O(n^{analyzer.max_depth})"
            explanation = f"Deeply nested loops (depth {analyzer.max_depth}) detected."

        return {
            "notation": notation,
            "max_depth": analyzer.max_depth,
            "loop_count": analyzer.loop_count,
            "explanation": explanation
        }
    except SyntaxError:
        return {
            "notation": "N/A",
            "max_depth": 0,
            "loop_count": 0,
            "explanation": "Code contains syntax errors. Analysis aborted."
        }
    except Exception as e:
        return {
            "notation": "Error",
            "max_depth": 0,
            "loop_count": 0,
            "explanation": f"Complexity analyzer failed: {str(e)}"
        }
