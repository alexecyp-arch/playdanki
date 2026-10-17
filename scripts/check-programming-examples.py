"""Execute only original, self-contained course examples; no file or network examples."""
import ast, contextlib, io, json, re, sys
examples = json.load(sys.stdin)
reports = []
allowed_imports = {'json', 'decimal', 'statistics', 'datetime', 'math', 'dataclasses'}
for item in examples:
    tree = ast.parse(item['code'])
    imports = [n for n in ast.walk(tree) if isinstance(n, (ast.Import, ast.ImportFrom))]
    if any((n.module if isinstance(n, ast.ImportFrom) else n.names[0].name).split('.')[0] not in allowed_imports for n in imports):
        continue
    if re.search(r'\b(open|Path|sqlite3|Tk|ThreadPoolExecutor|ProcessPoolExecutor|urlopen|requests|subprocess|os|logging|Thread|Queue|asyncio|unittest|tempfile)\b|\.(write|read)', item['code']):
        continue
    output = io.StringIO()
    try:
        with contextlib.redirect_stdout(output):
            exec(compile(tree, '<course-example>', 'exec'), {})
        reports.append({'term': item['term'], 'output': output.getvalue().strip(), 'result': item['result']})
    except Exception as error:
        reports.append({'term': item['term'], 'error': str(error), 'result': item['result']})
json.dump(reports, sys.stdout)
