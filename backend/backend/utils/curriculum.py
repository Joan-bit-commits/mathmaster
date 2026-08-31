"""Ugandan secondary school curriculum levels and S1–S4 syllabus outline."""

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

# Fully seeded levels: S1–S4. S5/S6/UNIVERSITY are placeholders.
SEEDED_LEVELS = ('S1', 'S2', 'S3', 'S4')
PLACEHOLDER_LEVELS = ('S5', 'S6', 'UNIVERSITY')

# topic name -> (subject, description)
TOPICS = {
    'Number & Numeration': ('Mathematics', 'Number bases, indices, standard form, ratios and percentages.'),
    'Algebra': ('Mathematics', 'Algebraic expressions, equations, inequalities and formulae.'),
    'Geometry & Measurement': ('Mathematics', 'Angles, polygons, constructions, perimeter, area and volume.'),
    'Statistics & Probability': ('Mathematics', 'Data collection, charts, averages and basic probability.'),
    'Trigonometry': ('Mathematics', 'Sine, cosine and tangent ratios and their applications.'),
    'Sets': ('Mathematics', 'Set notation, Venn diagrams and set operations.'),
    'Matrices & Transformation': ('Mathematics', 'Matrix operations, determinants and geometric transformations.'),
}

# For each level, which topics apply (all core topics for S1–S4, fewer for placeholders).
LEVEL_TOPICS = {
    'S1': ['Number & Numeration', 'Algebra', 'Geometry & Measurement', 'Sets'],
    'S2': ['Number & Numeration', 'Algebra', 'Geometry & Measurement', 'Statistics & Probability', 'Sets'],
    'S3': ['Algebra', 'Geometry & Measurement', 'Statistics & Probability', 'Trigonometry', 'Matrices & Transformation'],
    'S4': ['Algebra', 'Statistics & Probability', 'Trigonometry', 'Matrices & Transformation', 'Number & Numeration'],
    'S5': ['Algebra', 'Trigonometry'],
    'S6': ['Algebra', 'Trigonometry'],
    'UNIVERSITY': ['Algebra'],
}

# Lesson outlines per topic: list of (title, content).
LESSONS = {
    'Number & Numeration': [
        ('Number Bases',
         'Numbers can be expressed in different bases. Learn to convert between base 10 and other bases, '
         'and to add and subtract numbers in a given base.'),
        ('Indices and Standard Form',
         'Indices are shorthand for repeated multiplication. Standard form writes numbers as A x 10^n '
         'where 1 <= A < 10.'),
    ],
    'Algebra': [
        ('Introduction to Algebra',
         'Variables represent unknown values. Learn to simplify expressions by collecting like terms '
         'and substituting values.'),
        ('Solving Linear Equations',
         'A linear equation has one unknown raised to power one. Solve by isolating the variable using '
         'inverse operations on both sides.'),
    ],
    'Geometry & Measurement': [
        ('Angles and Polygons',
         'Angle facts: angles on a straight line add to 180 degrees; the interior angles of an '
         'n-sided polygon sum to (n-2) x 180 degrees.'),
        ('Perimeter, Area and Volume',
         'Compute the perimeter and area of common shapes and the volume of prisms and cylinders.'),
    ],
    'Statistics & Probability': [
        ('Data Collection and Charts',
         'Data can be shown in bar charts, pie charts and histograms. Choose the right chart for '
         'the data type.'),
        ('Averages: Mean, Mode and Median',
         'The mean is the sum divided by the count; the mode is the most frequent value; the median '
         'is the middle value when ordered.'),
    ],
    'Trigonometry': [
        ('Trigonometric Ratios',
         'In a right-angled triangle: sin = opposite/hypotenuse, cos = adjacent/hypotenuse, '
         'tan = opposite/adjacent (SOH-CAH-TOA).'),
        ('Applications of Trigonometry',
         'Use trigonometric ratios to find heights and distances, including angles of elevation '
         'and depression.'),
    ],
    'Sets': [
        ('Set Notation',
         'A set is a collection of distinct objects. Members are written inside curly braces, '
         'e.g. A = {1, 2, 3}.'),
        ('Venn Diagrams',
         'Venn diagrams show relationships between sets: union, intersection and complement. '
         'Use them to solve counting problems.'),
    ],
    'Matrices & Transformation': [
        ('Introduction to Matrices',
         'A matrix is a rectangular array of numbers. Learn the order of a matrix, addition, '
         'subtraction and scalar multiplication.'),
        ('Matrices as Transformations',
         '2x2 matrices can rotate, reflect, enlarge or shear points on the coordinate plane.'),
    ],
}

# Quiz questions per lesson topic: list of (question, choices, correct_answer).
# choices == [] means short-answer (no choices provided).
QUESTIONS = {
    'Introduction to Algebra': [
        ('What does x represent in algebra?', ['An unknown value', 'A number that is always 1', 'A shape', 'A constant'], 'An unknown value'),
        ('Simplify: 3a + 2a.', ['5a', '6a', 'a^5', '5a^2'], '5a'),
        ('If x + 2 = 5, what is x?', ['1', '2', '3', '4'], '3'),
        ('Simplify: 4b - b.', ['3b', '4b', '3b^2', 'b^3'], '3b'),
        ('What is the value of 2y when y = 6?', [], '12'),
    ],
    'Solving Linear Equations': [
        ('Solve: 5x = 20. What is x?', ['2', '3', '4', '5'], '4'),
        ('Solve: x - 7 = 1. What is x?', ['5', '6', '7', '8'], '8'),
        ('Solve: 2x + 3 = 11. What is x?', [], '4'),
        ('Solve: 3(x - 1) = 9. What is x?', ['2', '3', '4', '5'], '4'),
        ('If 4x = x + 9, what is x?', [], '3'),
    ],
    'Number Bases': [
        ('What is 1011 in base 2 expressed in base 10?', ['9', '10', '11', '12'], '11'),
        ('Convert 7 (base 10) to base 2.', ['101', '110', '111', '1000'], '111'),
        ('What is 10 + 11 in base 2?', ['101', '110', '111', '100'], '101'),
        ('In base 5, the digits allowed are:', ['0 to 4', '1 to 5', '0 to 5', '0 to 9'], '0 to 4'),
        ('Convert 25 (base 10) to base 5.', [], '100'),
    ],
    'Indices and Standard Form': [
        ('Simplify: 2^3 x 2^2.', ['2^5', '2^6', '4^5', '2^1'], '2^5'),
        ('Write 4500 in standard form.', ['4.5 x 10^3', '45 x 10^2', '4.5 x 10^4', '0.45 x 10^4'], '4.5 x 10^3'),
        ('What is 5^0?', ['0', '1', '5', 'undefined'], '1'),
        ('Simplify: a^6 / a^2.', ['a^3', 'a^4', 'a^8', 'a^12'], 'a^4'),
        ('Write 0.0072 in standard form.', [], '7.2 x 10^-3'),
    ],
    'Angles and Polygons': [
        ('How many degrees are in the angles of a triangle added together?', ['90', '180', '270', '360'], '180'),
        ('Which shape has four equal sides and four right angles?', ['Square', 'Rectangle', 'Triangle', 'Circle'], 'Square'),
        ('Sum of interior angles of a quadrilateral:', ['180', '270', '360', '540'], '360'),
        ('An angle on a straight line with 110 degrees leaves:', [], '70'),
        ('Sum of interior angles of a pentagon:', [], '540'),
    ],
    'Perimeter, Area and Volume': [
        ('What is the area of a rectangle with width 4 and height 3?', ['7', '10', '12', '14'], '12'),
        ('Perimeter of a square with side 5:', ['10', '15', '20', '25'], '20'),
        ('Area of a triangle with base 6 and height 4:', ['10', '12', '24', '48'], '12'),
        ('Volume of a cube with side 3:', [], '27'),
        ('Circumference of a circle with radius 7 (use pi = 22/7):', [], '44'),
    ],
    'Data Collection and Charts': [
        ('Which chart is best for showing parts of a whole?', ['Bar chart', 'Pie chart', 'Line graph', 'Pictogram'], 'Pie chart'),
        ('Qualitative data is best displayed using:', ['Histogram', 'Bar chart of categories', 'Scatter plot', 'Box plot'], 'Bar chart of categories'),
        ('A histogram uses:', ['Separate bars for categories', 'Continuous intervals', 'Pictures', 'Lines'], 'Continuous intervals'),
        ('A line graph is best for showing:', [], 'Trends over time'),
    ],
    'Averages: Mean, Mode and Median': [
        ('Find the mean of 2, 4, 6, 8.', ['4', '5', '6', '8'], '5'),
        ('Find the mode of 1, 2, 2, 3, 4.', ['1', '2', '3', '4'], '2'),
        ('Find the median of 3, 1, 4, 2, 5.', ['2', '3', '4', '1'], '3'),
        ('The mean of 10 scores is 50. Their sum is:', [], '500'),
        ('Find the median of 2, 4, 6, 8.', [], '5'),
    ],
    'Trigonometric Ratios': [
        ('In a right triangle, sin(theta) equals:', ['Opposite/Hypotenuse', 'Adjacent/Hypotenuse', 'Opposite/Adjacent', 'Hypotenuse/Opposite'], 'Opposite/Hypotenuse'),
        ('tan(theta) equals:', ['Opposite/Adjacent', 'Adjacent/Opposite', 'Opposite/Hypotenuse', 'Adjacent/Hypotenuse'], 'Opposite/Adjacent'),
        ('If sin(theta) = 0.5 and theta is acute, theta =', ['30', '45', '60', '90'], '30'),
        ('For a right triangle with opposite 3 and adjacent 4, tan(theta) =', [], '0.75'),
    ],
    'Applications of Trigonometry': [
        ('The angle of elevation is measured from the:', ['Horizontal up', 'Horizontal down', 'Vertical', 'Object'], 'Horizontal up'),
        ('A 10 m ladder leans at 60 degrees to the ground. Height reached (use sin 60 = 0.87):', ['5.0 m', '8.7 m', '10 m', '11.5 m'], '8.7 m'),
        ('Angles of depression are measured from the horizontal:', [], 'Downward'),
        ('A tower casts a shadow 20 m long when the sun is 45 degrees high. Tower height:', [], '20'),
    ],
    'Set Notation': [
        ('If A = {1, 2, 3}, the number of elements (n(A)) is:', ['2', '3', '4', '5'], '3'),
        ('The symbol for "is a member of" is:', ['U', '∈', '⊂', '∅'], '∈'),
        ('The empty set is written as:', ['{0}', '∅', 'U', 'A'], '∅'),
        ('List all subsets of {1, 2}.', [], '{}, {1}, {2}, {1,2}'),
    ],
    'Venn Diagrams': [
        ('If n(A)=10, n(B)=8 and n(A∩B)=3, then n(A∪B)=', ['15', '18', '21', '5'], '15'),
        ('The union of two sets contains elements in:', ['Either set', 'Both sets only', 'Neither set', 'The first set only'], 'Either set'),
        ('The intersection of A and B contains elements in:', [], 'Both A and B'),
        ('In a class of 40, 25 like maths and 20 like physics, 10 like both. How many like neither?', [], '5'),
    ],
    'Introduction to Matrices': [
        ('A matrix with 2 rows and 3 columns has order:', ['2x3', '3x2', '6x1', '2^3'], '2x3'),
        ('If A = [[1,2],[3,4]], then 2A =', ['[[2,4],[6,8]]', '[[1,4],[6,4]]', '[[2,2],[3,3]]', '[[1,2],[3,4]]'], '[[2,4],[6,8]]'),
        ('Matrix addition requires matrices of the same:', ['Order', 'Determinant', 'Row only', 'Values'], 'Order'),
        ('Compute [[1,0],[0,1]] + [[2,3],[4,5]].', [], '[[3,3],[4,6]]'),
    ],
    'Matrices as Transformations': [
        ('The identity matrix represents which transformation?', ['No change', 'Rotation', 'Reflection', 'Enlargement'], 'No change'),
        ('The matrix [[-1,0],[0,1]] reflects points in the:', ['y-axis', 'x-axis', 'origin', 'line y=x'], 'y-axis'),
        ('A rotation matrix for 90 degrees maps (1,0) to:', ['(0,1)', '(0,-1)', '(1,0)', '(-1,0)'], '(0,1)'),
        ('The determinant of [[2,0],[0,3]] is:', [], '6'),
    ],
}
