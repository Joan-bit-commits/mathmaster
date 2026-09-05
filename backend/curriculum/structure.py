"""Static Uganda NCDC/UNEB mathematics curriculum metadata."""

UGANDA_LEVELS = {
    'P7': 'Primary 7',
    'S1': 'Senior 1',
    'S2': 'Senior 2',
    'S3': 'Senior 3',
    'S4': 'Senior 4',
    'S5': 'Senior 5',
    'S6': 'Senior 6',
    'UNIVERSITY': 'University',
}


def _objective(code, text, topics, difficulty='medium', page=1):
    return {
        'code': code,
        'text': text,
        'topics': topics,
        'difficulty': difficulty,
        'estimated_hours': 6,
        'common_misconceptions': ['Ignoring units or signs in the final answer'],
        'workbook_refs': [
            {'textbook': f'Mathematics for Uganda Book {code[1]}', 'publisher': 'MK Publishers', 'page': page}
        ],
    }


def _subject(level, strands):
    return {'name': 'Mathematics', 'code': f'{level}.M', 'strands': strands}


def _strand(level, suffix, name, items):
    return {
        'name': name,
        'code': f'{level}.M.{suffix}',
        'objectives': [
            _objective(f'{level}.M.{suffix}.{i}', text, topics, difficulty, 20 + i * 7)
            for i, (text, topics, difficulty) in enumerate(items, 1)
        ],
    }


_SEED = {
    'S1': [
        (
            'N',
            'Number & Numeration',
            [
                (
                    'Convert numbers between base 10, base 2, base 8 and base 16.',
                    ['Number bases', 'Base conversions'],
                    'easy',
                ),
                (
                    'Work with fractions, decimals, percentages and ratio.',
                    ['Fractions', 'Percentages', 'Ratio'],
                    'easy',
                ),
            ],
        ),
        (
            'A',
            'Algebra',
            [
                (
                    'Solve linear equations in one variable.',
                    ['Linear equations', 'One-step equations'],
                    'easy',
                ),
                (
                    'Form and solve linear equations from word problems.',
                    ['Word problems', 'Translating to algebra'],
                    'medium',
                ),
                (
                    'Simplify algebraic expressions by collecting like terms.',
                    ['Expressions', 'Like terms'],
                    'easy',
                ),
            ],
        ),
        (
            'G',
            'Geometry & Measurement',
            [
                ('Use angle properties of lines and polygons.', ['Angles', 'Polygons'], 'easy'),
                ('Calculate perimeter and area of plane shapes.', ['Perimeter', 'Area'], 'medium'),
            ],
        ),
        (
            'S',
            'Sets',
            [
                (
                    'Represent sets using notation and Venn diagrams.',
                    ['Set notation', 'Venn diagrams'],
                    'easy',
                ),
                (
                    'Solve problems involving union and intersection of sets.',
                    ['Union', 'Intersection'],
                    'medium',
                ),
            ],
        ),
    ],
    'S2': [
        (
            'N',
            'Number & Numeration',
            [
                (
                    'Solve problems involving percentages, profit and loss, discount and commission.',
                    ['Percentages', 'Profit and loss', 'Discount'],
                    'medium',
                ),
                (
                    'Use direct and inverse proportion in practical problems.',
                    ['Proportion', 'Rates'],
                    'medium',
                ),
            ],
        ),
        (
            'A',
            'Algebra',
            [
                ('Solve simultaneous linear equations.', ['Simultaneous equations'], 'medium'),
                ('Factorise and solve quadratic expressions.', ['Quadratics', 'Factorisation'], 'medium'),
            ],
        ),
        (
            'G',
            'Geometry & Measurement',
            [
                ('Use theorems on triangles and quadrilaterals.', ['Congruency', 'Similarity'], 'medium'),
                ('Calculate volume and surface area of solids.', ['Volume', 'Surface area'], 'medium'),
            ],
        ),
        (
            'S',
            'Statistics & Probability',
            [
                ('Calculate and interpret averages from data.', ['Mean', 'Median', 'Mode'], 'easy'),
                ('Represent data using tables and graphs.', ['Bar charts', 'Pie charts'], 'easy'),
            ],
        ),
        (
            'SE',
            'Sets',
            [('Apply set operations to counting problems.', ['Venn diagrams', 'Counting'], 'medium')],
        ),
    ],
    'S3': [
        (
            'A',
            'Algebra',
            [
                (
                    'Solve quadratic equations by factorisation and formula.',
                    ['Quadratic equations'],
                    'medium',
                ),
                ('Use sequences and nth-term rules.', ['Sequences', 'Patterns'], 'medium'),
            ],
        ),
        (
            'G',
            'Geometry & Measurement',
            [
                ('Use circle theorems to solve geometric problems.', ['Circle theorems'], 'hard'),
                ('Use coordinates to find gradients and distances.', ['Coordinates', 'Gradient'], 'medium'),
            ],
        ),
        (
            'S',
            'Statistics & Probability',
            [('Calculate probability of combined events.', ['Probability', 'Events'], 'medium')],
        ),
        (
            'T',
            'Trigonometry',
            [
                (
                    'Use sine, cosine and tangent ratios to find sides and angles of right-angled triangles.',
                    ['SOH CAH TOA', 'Right-angled triangles', 'Bearings'],
                    'medium',
                ),
                (
                    'Solve problems involving angles of elevation and depression.',
                    ['Elevation', 'Depression'],
                    'medium',
                ),
            ],
        ),
        (
            'M',
            'Matrices & Transformation',
            [
                (
                    'Perform matrix operations and use matrices for transformations.',
                    ['Matrices', 'Transformations'],
                    'medium',
                )
            ],
        ),
    ],
    'S4': [
        (
            'A',
            'Algebra',
            [
                (
                    'Solve simultaneous and quadratic equations in examination problems.',
                    ['Equations', 'Quadratics'],
                    'hard',
                ),
                ('Use variation, functions and inequalities.', ['Functions', 'Inequalities'], 'hard'),
            ],
        ),
        (
            'S',
            'Statistics & Probability',
            [
                (
                    'Use cumulative frequency and statistical diagrams.',
                    ['Cumulative frequency', 'Histograms'],
                    'medium',
                )
            ],
        ),
        (
            'T',
            'Trigonometry',
            [
                (
                    'Apply the sine and cosine rules to non-right-angled triangles.',
                    ['Sine rule', 'Cosine rule'],
                    'hard',
                )
            ],
        ),
        (
            'M',
            'Matrices & Transformation',
            [
                (
                    'Use matrices to represent combined transformations.',
                    ['Matrices', 'Combined transformations'],
                    'hard',
                )
            ],
        ),
        (
            'N',
            'Number & Numeration',
            [
                (
                    'Use logarithms and standard form in calculations.',
                    ['Logarithms', 'Standard form'],
                    'medium',
                )
            ],
        ),
    ],
}

UGANDA_SYLLABUS = {}
for _level, _strands in _SEED.items():
    UGANDA_SYLLABUS[_level] = {
        'Mathematics': _subject(
            _level, {name: _strand(_level, suffix, name, items) for suffix, name, items in _strands}
        )
    }
for _level in ('P7', 'S5', 'S6', 'UNIVERSITY'):
    UGANDA_SYLLABUS[_level] = {'Mathematics': _subject(_level, {})}

LOCAL_CONVENTIONS = {
    'currency_symbol': 'shs.',
    'currency_code': 'UGX',
    'english_variant': 'British',
    'units': {
        'mass': ['kg', 'g'],
        'length': ['km', 'm', 'cm', 'mm'],
        'volume': ['litres', 'ml', 'm³'],
        'speed': ['km/h'],
        'temperature': ['°C'],
    },
    'math_notation': {
        'LCM': 'LCM',
        'HCF': 'HCF',
        'indices': 'indices',
        'standard_form': 'standard form',
        'subtend': 'subtends',
    },
    'local_contexts': [
        'market',
        'school',
        'farming',
        'bodaboda',
        'home',
        'football',
        'church',
        'clinic',
        'mobile_money',
        'matoke_trade',
    ],
    'marking_scheme': {
        'M': 'Method mark',
        'A': 'Accuracy mark',
        'B': 'Independent/follow-through mark',
        'cao': 'Correct answer only',
    },
}

WORKED_EXAMPLES = {
    'S1.M.A.1': [
        {
            'id': 'we-s1ma1-001',
            'problem': 'Solve: 3x + 7 = 22',
            'context': 'school',
            'difficulty': 'easy',
            'solution_steps': [
                {'step': 1, 'text': '3x = 15', 'mark': 'M1'},
                {'step': 2, 'text': 'x = 5', 'mark': 'A1'},
            ],
            'final_answer': 'x = 5',
        }
    ]
}
LOCAL_PROBLEMS = {
    'S1.M.A.1': [
        {'id': 'lp-s1ma1-001', 'problem': 'Solve: 5x - 4 = 21', 'difficulty': 'easy', 'answer': 'x = 5'}
    ]
}
APPROVED_TEXTBOOKS = {
    f'S{i}': [
        {'title': f'Mathematics for Uganda Book {i}', 'authors': [], 'publisher': 'MK Publishers', 'isbn': ''}
    ]
    for i in range(1, 7)
}
UNEB_FORMAT = {
    'UCE': {
        'name': 'Uganda Certificate of Education',
        'level': 'S4',
        'papers': [
            {
                'code': 'Paper 1',
                'name': 'Pure Mathematics',
                'duration_minutes': 120,
                'total_marks': 100,
                'sections': [
                    {'name': 'A', 'questions': 20, 'marks_each': 2, 'instruction': 'Attempt all'},
                    {'name': 'B', 'questions': 6, 'marks_each': 10, 'instruction': 'Attempt any 4'},
                ],
            }
        ],
        'topics_weight': {
            'Algebra': 30,
            'Number & Numeration': 15,
            'Geometry & Measurement': 20,
            'Statistics & Probability': 15,
            'Trigonometry': 15,
            'Matrices & Transformation': 5,
        },
    },
    'UACE': {'name': 'Uganda Advanced Certificate of Education', 'level': 'S6', 'papers': []},
}


def get_objective(code):
    for level, subjects in UGANDA_SYLLABUS.items():
        for subject, data in subjects.items():
            for strand_name, strand in data['strands'].items():
                for objective in strand['objectives']:
                    if objective['code'] == code:
                        return {**objective, 'level': level, 'subject': subject, 'strand': strand_name}
    return None


def get_strand(level, strand_code):
    subject = UGANDA_SYLLABUS.get(level, {}).get('Mathematics')
    for name, strand in (subject or {}).get('strands', {}).items():
        if strand['code'] == strand_code:
            return {'name': name, **strand}
    return None


def search_objectives(query):
    query = query.lower()
    return [
        {**objective, 'level': level, 'subject': subject, 'strand': strand_name}
        for level, subjects in UGANDA_SYLLABUS.items()
        for subject, data in subjects.items()
        for strand_name, strand in data['strands'].items()
        for objective in strand['objectives']
        if query in objective['text'].lower()
        or any(query in topic.lower() for topic in objective.get('topics', []))
    ]


def format_curriculum_context(level=None, code=None):
    parts = [
        'You are a math tutor for Ugandan students following the NCDC syllabus and UNEB exam format.',
        '',
        'LOCAL CONVENTIONS:',
        "- Currency: 'shs.' (e.g., shs. 5,000)",
        '- English variant: British',
        '- Math terms: LCM, HCF (not GCD), indices, standard form',
        '- Units: kg, km, litres, °C, km/h',
        '',
        'MARKING SCHEME STYLE:',
        '- M = method mark, A = accuracy mark, B = independent mark, cao = correct answer only',
        '',
        'RESPONSE FORMAT:',
        '- Show step-by-step working with clear mathematical notation',
        '- Use local context where natural',
        '- List 2-3 common mistakes after the solution',
    ]
    if code and (objective := get_objective(code)):
        parts[:0] = [
            f'FOCUS: UNEB objective {code} — {objective["text"]}',
            f'LEVEL: {objective["level"]} · STRAND: {objective["strand"]}',
        ]
        parts.extend(
            [
                '',
                'COMMON MISCONCEPTIONS TO ADDRESS:',
                *[f'- {item}' for item in objective['common_misconceptions']],
            ]
        )
    elif level:
        parts.insert(0, f'LEVEL: {level} (use the appropriate syllabus depth)')
    return '\n'.join(parts)
