import ast
from typing import Tuple, Dict, Any


class ComplexityAnalyzer(ast.NodeVisitor):
    def __init__(self):
        self.max_loop_depth = 0
        self.current_loop_depth = 0
        self.loop_count = 0

        # Sorting / searching signals
        self.has_sort = False           # sorted() or .sort()
        self.has_binary_ops = False     # // 2 inside a while loop

        # Recursion
        self.has_recursion = False
        self.recursive_calls = 0
        self.current_func: str | None = None
        self.defined_funcs: set[str] = set()

        # Space signals
        self.dynamic_allocs = 0          # list/dict/set comprehensions, explicit []
        self.inside_loop = False
        self.alloc_inside_loop = 0       # allocations inside a loop
        self.recursive_depth_est = 0

    # ── Functions ─────────────────────────────────────────────
    def visit_FunctionDef(self, node: ast.FunctionDef):
        self.defined_funcs.add(node.name)
        prev = self.current_func
        self.current_func = node.name
        self.generic_visit(node)
        self.current_func = prev

    visit_AsyncFunctionDef = visit_FunctionDef

    # ── Loops ─────────────────────────────────────────────────
    def visit_For(self, node: ast.For):
        self.loop_count += 1
        self.current_loop_depth += 1
        prev_inside = self.inside_loop
        self.inside_loop = True
        self.max_loop_depth = max(self.max_loop_depth, self.current_loop_depth)
        self.generic_visit(node)
        self.current_loop_depth -= 1
        self.inside_loop = prev_inside

    def visit_While(self, node: ast.While):
        self.loop_count += 1
        self.current_loop_depth += 1
        prev_inside = self.inside_loop
        self.inside_loop = True
        self.max_loop_depth = max(self.max_loop_depth, self.current_loop_depth)
        # Detect binary-search / logarithmic pattern: n = n // 2
        for child in ast.walk(node):
            if isinstance(child, ast.AugAssign) and isinstance(child.op, ast.FloorDiv):
                self.has_binary_ops = True
            if isinstance(child, ast.Assign):
                for val in ast.walk(child.value):
                    if isinstance(val, ast.BinOp) and isinstance(val.op, ast.FloorDiv):
                        self.has_binary_ops = True
        self.generic_visit(node)
        self.current_loop_depth -= 1
        self.inside_loop = prev_inside

    # ── Calls ─────────────────────────────────────────────────
    def visit_Call(self, node: ast.Call):
        # Detect sort / sorted
        if isinstance(node.func, ast.Attribute) and node.func.attr in ("sort", "sorted"):
            self.has_sort = True
        elif isinstance(node.func, ast.Name):
            if node.func.id == "sorted":
                self.has_sort = True
            # Detect recursion
            if self.current_func and node.func.id == self.current_func:
                self.has_recursion = True
                self.recursive_calls += 1
        self.generic_visit(node)

    # ── Memory allocations ────────────────────────────────────
    def _count_alloc(self):
        self.dynamic_allocs += 1
        if self.inside_loop:
            self.alloc_inside_loop += 1

    def visit_ListComp(self, node):
        self._count_alloc()
        self.generic_visit(node)

    def visit_DictComp(self, node):
        self._count_alloc()
        self.generic_visit(node)

    def visit_SetComp(self, node):
        self._count_alloc()
        self.generic_visit(node)

    def visit_GeneratorExp(self, node):
        self._count_alloc()
        self.generic_visit(node)

    def visit_List(self, node):
        # Only count non-empty list literals that suggest dynamic sizing
        if len(node.elts) > 2:
            self._count_alloc()
        self.generic_visit(node)

    def visit_Dict(self, node):
        if len(node.keys) > 2:
            self._count_alloc()
        self.generic_visit(node)


# ── Heuristic rules ───────────────────────────────────────────

def _determine_time(a: ComplexityAnalyzer) -> Tuple[str, str]:
    # Exponential: recursion with multiple recursive calls (fibonacci-style)
    if a.has_recursion and a.recursive_calls >= 2:
        return (
            "O(2ⁿ)",
            "Multiple recursive calls per invocation detected. "
            "Without memoization/DP this is exponential — consider caching results.",
        )

    # Recursive (single call — likely O(n) or O(log n))
    if a.has_recursion:
        if a.has_binary_ops:
            return "O(log n)", "Recursive function with halving pattern — logarithmic time."
        return "O(n)", "Single-branch recursion detected — linear stack depth."

    # n log n: loop + sort, or just sort on a meaningful structure
    if a.has_sort and a.max_loop_depth >= 1:
        return (
            "O(n log n)",
            "Sorting inside a loop. Timsort is O(n log n) and the outer loop multiplies that.",
        )
    if a.has_sort:
        return (
            "O(n log n)",
            "Built-in sort / sorted uses Timsort: O(n log n) average and worst case.",
        )

    # Logarithmic: while loop with halving, no nested loops
    if a.has_binary_ops and a.max_loop_depth == 1:
        return (
            "O(log n)",
            "Loop halves the search space each iteration — classic binary search pattern.",
        )

    # Polynomial by nesting depth
    depth = a.max_loop_depth
    if depth == 0:
        return "O(1)", "No loops, sorting, or recursion detected. Constant time."
    if depth == 1:
        return "O(n)", "Single loop — time grows linearly with input size."
    if depth == 2:
        return "O(n²)", "Nested loops (depth 2) — quadratic time. Consider a hash-map approach."
    if depth == 3:
        return "O(n³)", "Triple-nested loops — cubic time. Likely avoidable with better data structures."
    return (
        f"O(n^{depth})",
        f"Loops nested {depth} levels deep — polynomial time. Consider restructuring.",
    )


def _determine_space(a: ComplexityAnalyzer) -> Tuple[str, str]:
    if a.has_recursion:
        if a.recursive_calls >= 2:
            return "O(n)", "Each recursive call frame stays on the stack until base case is reached."
        return "O(n)", "Recursive call stack grows up to O(n) depth."

    if a.alloc_inside_loop >= 1:
        return (
            "O(n)",
            "Dynamic data structure created inside a loop — space grows with input.",
        )

    if a.dynamic_allocs >= 2:
        return "O(n)", "Multiple dynamic allocations — space proportional to input size."

    if a.dynamic_allocs == 1:
        return "O(n)", "One dynamic allocation (list/dict/set comprehension)."

    return "O(1)", "No dynamic allocations detected. Constant extra space."


# ── Public API ────────────────────────────────────────────────

def analyze_complexity(code: str) -> Dict[str, Any]:
    try:
        tree = ast.parse(code)
        a = ComplexityAnalyzer()
        a.visit(tree)

        time_notation, time_explanation = _determine_time(a)
        space_notation, space_explanation = _determine_space(a)

        return {
            "big_o":             time_notation,
            "loop_depth":        a.max_loop_depth,
            "loop_count":        a.loop_count,
            "explanation":       time_explanation,
            "space_complexity":  space_notation,
            "space_explanation": space_explanation,
            "has_recursion":     a.has_recursion,
            "has_sort":          a.has_sort,
        }
    except SyntaxError as e:
        return {
            "big_o":             "N/A",
            "loop_depth":        0,
            "loop_count":        0,
            "explanation":       f"Syntax error at line {e.lineno}: {e.msg}",
            "space_complexity":  "N/A",
            "space_explanation": "Cannot analyse — fix syntax errors first.",
            "has_recursion":     False,
            "has_sort":          False,
        }
    except Exception as e:
        return {
            "big_o":             "Error",
            "loop_depth":        0,
            "loop_count":        0,
            "explanation":       f"Analyser error: {e}",
            "space_complexity":  "Error",
            "space_explanation": str(e),
            "has_recursion":     False,
            "has_sort":          False,
        }
