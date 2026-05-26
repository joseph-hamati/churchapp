import json
from pathlib import Path
import sys

base = Path('entities')
errors = False
for path in sorted(base.glob('*.js')):
    text = path.read_text(encoding='utf-8')
    try:
        json.loads(text)
    except Exception as e:
        print('ERROR', path, e)
        errors = True
        continue
    new_path = path.with_suffix('.json')
    path.rename(new_path)
    print('RENAMED', path, '->', new_path)

if errors:
    sys.exit(1)
