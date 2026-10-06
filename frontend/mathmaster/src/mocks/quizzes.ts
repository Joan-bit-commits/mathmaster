import type { Quiz, Question } from '@/types/learning';

export const mockQuizzes: Quiz[] = [
  // Topic 1: Linear Equations (3 quizzes)
  { id: 'quiz-1-1', lesson_id: 'lesson-1-1', title: 'Linear Equations Basics', description: 'Test your understanding of basic linear equations.', questions_count: 5, best_score: 80, attempted: true },
  { id: 'quiz-1-2', lesson_id: 'lesson-1-3', title: 'Multi-Step Equations Quiz', description: 'Practice solving complex equations step by step.', questions_count: 5, best_score: 60, attempted: true },
  { id: 'quiz-1-3', lesson_id: 'lesson-1-5', title: 'Inequalities Challenge', description: 'Solve and graph inequalities with confidence.', questions_count: 5, best_score: null, attempted: false },
  // Topic 2: Quadratic Functions (2 quizzes)
  { id: 'quiz-2-1', lesson_id: 'lesson-2-1', title: 'Parabolas & Quadratics', description: 'Check your knowledge of quadratic graphs.', questions_count: 5, best_score: null, attempted: false },
  { id: 'quiz-2-2', lesson_id: 'lesson-2-3', title: 'Quadratic Formula Quiz', description: 'Apply the quadratic formula to solve equations.', questions_count: 5, best_score: null, attempted: false },
  // Topic 3: Geometry (4 quizzes)
  { id: 'quiz-3-1', lesson_id: 'lesson-3-1', title: 'Angles Quiz', description: 'Test your knowledge of angle types and pairs.', questions_count: 5, best_score: null, attempted: false },
  { id: 'quiz-3-2', lesson_id: 'lesson-3-2', title: 'Triangle Properties', description: 'Verify your understanding of triangle theorems.', questions_count: 5, best_score: null, attempted: false },
  { id: 'quiz-3-3', lesson_id: 'lesson-3-3', title: 'Congruence & Similarity', description: 'Determine congruent and similar figures.', questions_count: 5, best_score: null, attempted: false },
  { id: 'quiz-3-4', lesson_id: 'lesson-3-4', title: 'Circle Theorems Quiz', description: 'Master inscribed angles and arc lengths.', questions_count: 5, best_score: null, attempted: false },
  // Topic 4: Calculus (3 quizzes)
  { id: 'quiz-4-1', lesson_id: 'lesson-4-1', title: 'Limits Quiz', description: 'Evaluate limits and understand continuity.', questions_count: 5, best_score: 100, attempted: true },
  { id: 'quiz-4-2', lesson_id: 'lesson-4-2', title: 'Derivatives Practice', description: 'Find derivatives using the power rule.', questions_count: 5, best_score: 80, attempted: true },
  { id: 'quiz-4-3', lesson_id: 'lesson-4-3', title: 'Chain Rule Challenge', description: 'Apply product, quotient, and chain rules.', questions_count: 5, best_score: null, attempted: false },
  // Topic 5: Statistics (3 quizzes)
  { id: 'quiz-5-1', lesson_id: 'lesson-5-1', title: 'Descriptive Statistics', description: 'Calculate mean, median, and standard deviation.', questions_count: 5, best_score: 100, attempted: true },
  { id: 'quiz-5-2', lesson_id: 'lesson-5-3', title: 'Probability Quiz', description: 'Test your understanding of probability rules.', questions_count: 5, best_score: 80, attempted: true },
  { id: 'quiz-5-3', lesson_id: 'lesson-5-4', title: 'Normal Distribution', description: 'Work with z-scores and the bell curve.', questions_count: 5, best_score: null, attempted: false },
  // Topic 6: Trigonometry (3 quizzes)
  { id: 'quiz-6-1', lesson_id: 'lesson-6-1', title: 'Trig Ratios Quiz', description: 'Practice sine, cosine, and tangent.', questions_count: 5, best_score: 100, attempted: true },
  { id: 'quiz-6-2', lesson_id: 'lesson-6-3', title: 'Solving Triangles', description: 'Apply Laws of Sines and Cosines.', questions_count: 5, best_score: 80, attempted: true },
  { id: 'quiz-6-3', lesson_id: 'lesson-6-4', title: 'Trig Identities', description: 'Simplify using fundamental identities.', questions_count: 5, best_score: 100, attempted: true },
];

export const mockQuestions: Question[] = [
  // Quiz 1-1: Linear Equations Basics
  { id: 'q-1-1-1', quiz_id: 'quiz-1-1', text: 'Solve for x: 2x + 5 = 13', type: 'multiple_choice', choices: ['x = 3', 'x = 4', 'x = 5', 'x = 6'], correct_answer: 'x = 4', explanation: 'Subtract 5 from both sides: 2x = 8. Divide by 2: x = 4.', order: 1 },
  { id: 'q-1-1-2', quiz_id: 'quiz-1-1', text: 'What is the slope of y = 3x - 7?', type: 'multiple_choice', choices: ['-7', '3', '7', '-3'], correct_answer: '3', explanation: 'In y = mx + b, m is the slope. Here m = 3.', order: 2 },
  { id: 'q-1-1-3', quiz_id: 'quiz-1-1', text: 'Solve: x - 8 = -3', type: 'multiple_choice', choices: ['x = 5', 'x = -5', 'x = 11', 'x = -11'], correct_answer: 'x = 5', explanation: 'Add 8 to both sides: x = -3 + 8 = 5.', order: 3 },
  { id: 'q-1-1-4', quiz_id: 'quiz-1-1', text: 'What is the y-intercept of y = -2x + 6?', type: 'multiple_choice', choices: ['-2', '2', '6', '-6'], correct_answer: '6', explanation: 'In y = mx + b, b is the y-intercept. Here b = 6.', order: 4 },
  { id: 'q-1-1-5', quiz_id: 'quiz-1-1', text: 'Solve for x: 3x = 21', type: 'short_answer', correct_answer: '7', explanation: 'Divide both sides by 3: x = 21/3 = 7.', order: 5 },
  // Quiz 1-2: Multi-Step Equations
  { id: 'q-1-2-1', quiz_id: 'quiz-1-2', text: 'Solve: 3(x + 4) = 2x + 17', type: 'multiple_choice', choices: ['x = 3', 'x = 5', 'x = 7', 'x = 9'], correct_answer: 'x = 5', explanation: 'Distribute: 3x + 12 = 2x + 17. Subtract 2x: x + 12 = 17. Subtract 12: x = 5.', order: 1 },
  { id: 'q-1-2-2', quiz_id: 'quiz-1-2', text: 'Solve: 5x - 3 = 2x + 12', type: 'multiple_choice', choices: ['x = 3', 'x = 5', 'x = 7', 'x = 15'], correct_answer: 'x = 5', explanation: 'Subtract 2x: 3x - 3 = 12. Add 3: 3x = 15. Divide by 3: x = 5.', order: 2 },
  { id: 'q-1-2-3', quiz_id: 'quiz-1-2', text: 'Solve: 2(x - 3) + 4 = 3x - 5', type: 'multiple_choice', choices: ['x = -1', 'x = 1', 'x = 3', 'x = -3'], correct_answer: 'x = -1', explanation: 'Distribute: 2x - 6 + 4 = 3x - 5. Simplify: 2x - 2 = 3x - 5. Rearrange: x = -1.', order: 3 },
  { id: 'q-1-2-4', quiz_id: 'quiz-1-2', text: 'Solve: 4x + 7 = 3(x + 2) + x', type: 'multiple_choice', choices: ['No solution', 'x = 1', 'x = -1', 'Infinite solutions'], correct_answer: 'No solution', explanation: 'Distribute: 4x + 7 = 3x + 6 + x = 4x + 6. Subtract 4x: 7 = 6, which is false.', order: 4 },
  { id: 'q-1-2-5', quiz_id: 'quiz-1-2', text: 'Solve for x: 7x - 2 = 5x + 8', type: 'short_answer', correct_answer: '5', explanation: 'Subtract 5x: 2x - 2 = 8. Add 2: 2x = 10. Divide by 2: x = 5.', order: 5 },
  // Quiz 1-3: Inequalities
  { id: 'q-1-3-1', quiz_id: 'quiz-1-3', text: 'Solve: -3x + 6 > 12', type: 'multiple_choice', choices: ['x > -2', 'x < -2', 'x > 2', 'x < 2'], correct_answer: 'x < -2', explanation: 'Subtract 6: -3x > 6. Divide by -3 (flip sign): x < -2.', order: 1 },
  { id: 'q-1-3-2', quiz_id: 'quiz-1-3', text: 'Which symbol makes this true: 3 + 2 ___ 6?', type: 'multiple_choice', choices: ['<', '>', '=', '≥'], correct_answer: '<', explanation: '3 + 2 = 5, and 5 < 6.', order: 2 },
  { id: 'q-1-3-3', quiz_id: 'quiz-1-3', text: 'Solve: 2x ≤ 10', type: 'multiple_choice', choices: ['x ≤ 5', 'x ≥ 5', 'x ≤ 8', 'x ≥ 8'], correct_answer: 'x ≤ 5', explanation: 'Divide both sides by 2: x ≤ 5.', order: 3 },
  { id: 'q-1-3-4', quiz_id: 'quiz-1-3', text: 'When graphing x > 3, what type of circle do you use?', type: 'multiple_choice', choices: ['Closed', 'Open', 'Filled', 'Shaded'], correct_answer: 'Open', explanation: 'Use an open circle for strict inequalities (< and >).', order: 4 },
  { id: 'q-1-3-5', quiz_id: 'quiz-1-3', text: 'Solve: 5 - x ≥ 2', type: 'short_answer', correct_answer: 'x ≤ 3', explanation: 'Subtract 5: -x ≥ -3. Divide by -1 (flip sign): x ≤ 3.', order: 5 },
  // Quiz 2-1: Parabolas
  { id: 'q-2-1-1', quiz_id: 'quiz-2-1', text: 'What shape does y = x² produce?', type: 'multiple_choice', choices: ['A line', 'A circle', 'A parabola', 'A hyperbola'], correct_answer: 'A parabola', explanation: 'Quadratic functions always produce parabolas when graphed.', order: 1 },
  { id: 'q-2-1-2', quiz_id: 'quiz-2-1', text: 'If a > 0 in y = ax² + bx + c, the parabola opens...', type: 'multiple_choice', choices: ['Upward', 'Downward', 'Left', 'Right'], correct_answer: 'Upward', explanation: 'A positive leading coefficient means the parabola opens upward.', order: 2 },
  { id: 'q-2-1-3', quiz_id: 'quiz-2-1', text: 'What is the vertex of y = x² - 4x + 3?', type: 'multiple_choice', choices: ['(2, -1)', '(2, 1)', '(-2, -1)', '(0, 3)'], correct_answer: '(2, -1)', explanation: 'x = -b/2a = 4/2 = 2. y = 4 - 8 + 3 = -1. Vertex is (2, -1).', order: 3 },
  { id: 'q-2-1-4', quiz_id: 'quiz-2-1', text: 'The axis of symmetry is always a ___ line.', type: 'multiple_choice', choices: ['Horizontal', 'Vertical', 'Diagonal', 'Curved'], correct_answer: 'Vertical', explanation: 'The axis of symmetry is a vertical line through the vertex.', order: 4 },
  { id: 'q-2-1-5', quiz_id: 'quiz-2-1', text: 'What is the y-intercept of y = x² + 2x - 3?', type: 'short_answer', correct_answer: '-3', explanation: 'Set x = 0: y = 0 + 0 - 3 = -3.', order: 5 },
  // Quiz 2-2: Quadratic Formula
  { id: 'q-2-2-1', quiz_id: 'quiz-2-2', text: 'The quadratic formula is x = (-b ± √(b²-4ac)) / ___', type: 'multiple_choice', choices: ['2a', 'a', '2b', '4a'], correct_answer: '2a', explanation: 'The denominator of the quadratic formula is 2a.', order: 1 },
  { id: 'q-2-2-2', quiz_id: 'quiz-2-2', text: 'What is the discriminant of 2x² + 3x - 2 = 0?', type: 'multiple_choice', choices: ['9', '16', '25', '-7'], correct_answer: '25', explanation: 'b² - 4ac = 9 + 16 = 25.', order: 2 },
  { id: 'q-2-2-3', quiz_id: 'quiz-2-2', text: 'If the discriminant is 0, how many real solutions?', type: 'multiple_choice', choices: ['0', '1', '2', 'Infinite'], correct_answer: '1', explanation: 'A discriminant of 0 means exactly one real solution (a repeated root).', order: 3 },
  { id: 'q-2-2-4', quiz_id: 'quiz-2-2', text: 'Solve: x² - 5x + 6 = 0', type: 'multiple_choice', choices: ['x = 1, 6', 'x = 2, 3', 'x = -2, -3', 'x = 1, 5'], correct_answer: 'x = 2, 3', explanation: 'Factor: (x-2)(x-3) = 0, so x = 2 or x = 3.', order: 4 },
  { id: 'q-2-2-5', quiz_id: 'quiz-2-2', text: 'Solve using the formula: x² + 4x - 5 = 0', type: 'short_answer', correct_answer: 'x = 1, x = -5', explanation: 'x = (-4 ± √(16+20))/2 = (-4 ± 6)/2. x = 1 or x = -5.', order: 5 },
  // Quiz 3-1: Angles
  { id: 'q-3-1-1', quiz_id: 'quiz-3-1', text: 'An angle measuring 45° is called...', type: 'multiple_choice', choices: ['Right', 'Acute', 'Obtuse', 'Straight'], correct_answer: 'Acute', explanation: 'An angle less than 90° is acute.', order: 1 },
  { id: 'q-3-1-2', quiz_id: 'quiz-3-1', text: 'Two angles that sum to 90° are...', type: 'multiple_choice', choices: ['Supplementary', 'Complementary', 'Vertical', 'Adjacent'], correct_answer: 'Complementary', explanation: 'Complementary angles sum to 90°.', order: 2 },
  { id: 'q-3-1-3', quiz_id: 'quiz-3-1', text: 'Vertical angles are always...', type: 'multiple_choice', choices: ['Complementary', 'Supplementary', 'Equal', 'Right angles'], correct_answer: 'Equal', explanation: 'Vertical (opposite) angles formed by intersecting lines are always equal.', order: 3 },
  { id: 'q-3-1-4', quiz_id: 'quiz-3-1', text: 'Two angles that sum to 180° are...', type: 'multiple_choice', choices: ['Complementary', 'Supplementary', 'Vertical', 'Corresponding'], correct_answer: 'Supplementary', explanation: 'Supplementary angles sum to 180°.', order: 4 },
  { id: 'q-3-1-5', quiz_id: 'quiz-3-1', text: 'What is the supplement of a 70° angle?', type: 'short_answer', correct_answer: '110', explanation: '180 - 70 = 110 degrees.', order: 5 },
  // Quiz 3-2: Triangles
  { id: 'q-3-2-1', quiz_id: 'quiz-3-2', text: 'The interior angles of a triangle sum to...', type: 'multiple_choice', choices: ['90°', '180°', '270°', '360°'], correct_answer: '180°', explanation: 'The angle sum theorem states interior angles always sum to 180°.', order: 1 },
  { id: 'q-3-2-2', quiz_id: 'quiz-3-2', text: 'In a right triangle, a² + b² = c² is called the...', type: 'multiple_choice', choices: ['Law of Sines', 'Pythagorean Theorem', 'Law of Cosines', 'Thales Theorem'], correct_answer: 'Pythagorean Theorem', explanation: 'The Pythagorean Theorem relates the sides of a right triangle.', order: 2 },
  { id: 'q-3-2-3', quiz_id: 'quiz-3-2', text: 'An equilateral triangle has angles of...', type: 'multiple_choice', choices: ['30° each', '45° each', '60° each', '90° each'], correct_answer: '60° each', explanation: '180°/3 = 60° per angle in an equilateral triangle.', order: 3 },
  { id: 'q-3-2-4', quiz_id: 'quiz-3-2', text: 'If two sides of a triangle are equal, it is...', type: 'multiple_choice', choices: ['Equilateral', 'Isosceles', 'Scalene', 'Right'], correct_answer: 'Isosceles', explanation: 'An isosceles triangle has exactly two equal sides.', order: 4 },
  { id: 'q-3-2-5', quiz_id: 'quiz-3-2', text: 'Find the hypotenuse: legs 3 and 4.', type: 'short_answer', correct_answer: '5', explanation: '√(9 + 16) = √25 = 5.', order: 5 },
  // Quiz 3-3: Congruence
  { id: 'q-3-3-1', quiz_id: 'quiz-3-3', text: 'SSS means two triangles are congruent if...', type: 'multiple_choice', choices: ['Two sides and an angle match', 'All three sides match', 'Two angles match', 'One side matches'], correct_answer: 'All three sides match', explanation: 'SSS = Side-Side-Side, all three corresponding sides are equal.', order: 1 },
  { id: 'q-3-3-2', quiz_id: 'quiz-3-3', text: 'Similar triangles have...', type: 'multiple_choice', choices: ['Same size', 'Same shape, proportional sides', 'Same area', 'Same perimeter'], correct_answer: 'Same shape, proportional sides', explanation: 'Similar triangles have equal angles but sides are proportional, not equal.', order: 2 },
  { id: 'q-3-3-3', quiz_id: 'quiz-3-3', text: 'ASA stands for...', type: 'multiple_choice', choices: ['Angle-Side-Angle', 'All-Sides-Are', 'Angle-Strait-Angle', 'Area-Side-Area'], correct_answer: 'Angle-Side-Angle', explanation: 'ASA: two angles and the included side are equal.', order: 3 },
  { id: 'q-3-3-4', quiz_id: 'quiz-3-3', text: 'If triangles are similar with ratio 1:3, the area ratio is...', type: 'multiple_choice', choices: ['1:3', '1:6', '1:9', '1:12'], correct_answer: '1:9', explanation: 'Area ratio is the square of the side ratio: 1²:3² = 1:9.', order: 4 },
  { id: 'q-3-3-5', quiz_id: 'quiz-3-3', text: 'SAS means two sides and the ___ angle are equal.', type: 'short_answer', correct_answer: 'included', explanation: 'SAS: two sides and the angle between them (included angle) are equal.', order: 5 },
  // Quiz 3-4: Circle Theorems
  { id: 'q-3-4-1', quiz_id: 'quiz-3-4', text: 'The angle in a semicircle is always...', type: 'multiple_choice', choices: ['45°', '60°', '90°', '180°'], correct_answer: '90°', explanation: 'Any angle inscribed in a semicircle is a right angle (90°).', order: 1 },
  { id: 'q-3-4-2', quiz_id: 'quiz-3-4', text: 'A tangent to a circle is ___ to the radius at the point of contact.', type: 'multiple_choice', choices: ['Parallel', 'Perpendicular', 'Equal', 'Adjacent'], correct_answer: 'Perpendicular', explanation: 'The tangent is perpendicular to the radius at the point of tangency.', order: 2 },
  { id: 'q-3-4-3', quiz_id: 'quiz-3-4', text: 'Opposite angles of a cyclic quadrilateral sum to...', type: 'multiple_choice', choices: ['90°', '180°', '270°', '360°'], correct_answer: '180°', explanation: 'Opposite angles of a cyclic quadrilateral are supplementary (sum to 180°).', order: 3 },
  { id: 'q-3-4-4', quiz_id: 'quiz-3-4', text: 'The inscribed angle is ___ the central angle for the same arc.', type: 'multiple_choice', choices: ['Equal to', 'Half of', 'Double', 'Triple'], correct_answer: 'Half of', explanation: 'An inscribed angle is half the central angle subtending the same arc.', order: 4 },
  { id: 'q-3-4-5', quiz_id: 'quiz-3-4', text: 'Find the arc length for θ=180°, r=4 (use π≈3.14).', type: 'short_answer', correct_answer: '12.56', explanation: 'arc = (180/360) × 2 × 3.14 × 4 = 0.5 × 25.12 = 12.56.', order: 5 },
  // Quiz 4-1: Limits
  { id: 'q-4-1-1', quiz_id: 'quiz-4-1', text: 'Evaluate: lim(x→2) (x² + 3)', type: 'multiple_choice', choices: ['5', '7', '6', '4'], correct_answer: '7', explanation: 'Substitute x = 2: 4 + 3 = 7.', order: 1 },
  { id: 'q-4-1-2', quiz_id: 'quiz-4-1', text: 'lim(x→0) (sin(x)/x) = ?', type: 'multiple_choice', choices: ['0', '1', '∞', 'Undefined'], correct_answer: '1', explanation: 'This is a fundamental limit: lim(x→0) sin(x)/x = 1.', order: 2 },
  { id: 'q-4-1-3', quiz_id: 'quiz-4-1', text: 'If lim(x→a) f(x) = L, what does L represent?', type: 'multiple_choice', choices: ['The value at a', 'What f approaches near a', 'The maximum', 'The derivative'], correct_answer: 'What f approaches near a', explanation: 'A limit describes what the function approaches, not necessarily its value at the point.', order: 3 },
  { id: 'q-4-1-4', quiz_id: 'quiz-4-1', text: 'lim(x→3) (x² - 9)/(x - 3) = ?', type: 'multiple_choice', choices: ['0', '3', '6', 'Undefined'], correct_answer: '6', explanation: 'Factor: (x+3)(x-3)/(x-3) = x+3. At x=3: 6.', order: 4 },
  { id: 'q-4-1-5', quiz_id: 'quiz-4-1', text: 'Evaluate: lim(x→1) (2x + 5)', type: 'short_answer', correct_answer: '7', explanation: 'Substitute x = 1: 2(1) + 5 = 7.', order: 5 },
  // Quiz 4-2: Derivatives
  { id: 'q-4-2-1', quiz_id: 'quiz-4-2', text: 'd/dx [x³] = ?', type: 'multiple_choice', choices: ['3x', 'x²', '3x²', '3x³'], correct_answer: '3x²', explanation: 'Power rule: d/dx[xⁿ] = n·xⁿ⁻¹. So d/dx[x³] = 3x².', order: 1 },
  { id: 'q-4-2-2', quiz_id: 'quiz-4-2', text: 'd/dx [5] = ?', type: 'multiple_choice', choices: ['5', '0', '1', '5x'], correct_answer: '0', explanation: 'The derivative of any constant is 0.', order: 2 },
  { id: 'q-4-2-3', quiz_id: 'quiz-4-2', text: 'd/dx [7x²] = ?', type: 'multiple_choice', choices: ['7x', '14x', '14x²', '7'], correct_answer: '14x', explanation: 'Power rule: 7 × 2x = 14x.', order: 3 },
  { id: 'q-4-2-4', quiz_id: 'quiz-4-2', text: 'The derivative gives the slope of the ___ line.', type: 'multiple_choice', choices: ['Secant', 'Chord', 'Tangent', 'Normal'], correct_answer: 'Tangent', explanation: 'f\'(x) is the slope of the tangent line at point x.', order: 4 },
  { id: 'q-4-2-5', quiz_id: 'quiz-4-2', text: 'Find f\'(x) for f(x) = 4x³ - 2x + 1', type: 'short_answer', correct_answer: '12x^2 - 2', explanation: 'Power rule on each term: 12x² - 2 + 0 = 12x² - 2.', order: 5 },
  // Quiz 4-3: Chain Rule
  { id: 'q-4-3-1', quiz_id: 'quiz-4-3', text: 'The chain rule: d/dx[f(g(x))] = ?', type: 'multiple_choice', choices: ["f'(x)g'(x)", "f'(g(x))g'(x)", "f(g'(x))", "f'(g(x))"], correct_answer: "f'(g(x))g'(x)", explanation: 'The chain rule: multiply the derivative of the outer by the derivative of the inner.', order: 1 },
  { id: 'q-4-3-2', quiz_id: 'quiz-4-3', text: 'd/dx [(3x+1)⁴] = ?', type: 'multiple_choice', choices: ['4(3x+1)³', '12(3x+1)³', '4(3x+1)³·3', '12x(3x+1)³'], correct_answer: '12(3x+1)³', explanation: '4(3x+1)³ × 3 = 12(3x+1)³.', order: 2 },
  { id: 'q-4-3-3', quiz_id: 'quiz-4-3', text: 'Product rule: (fg)\' = ?', type: 'multiple_choice', choices: ["f'g'", "f'g + fg'", "fg' + f'g", "f'g - fg'"], correct_answer: "f'g + fg'", explanation: 'The product rule: (fg)\' = f\'g + fg\'.', order: 3 },
  { id: 'q-4-3-4', quiz_id: 'quiz-4-3', text: 'Quotient rule: (f/g)\' = ?', type: 'multiple_choice', choices: ["f'g - fg' / g²", "(f'g - fg') / g²", "(f'g + fg') / g²", "f' / g'"], correct_answer: "(f'g - fg') / g²", explanation: 'The quotient rule: (f\'g - fg\') / g².', order: 4 },
  { id: 'q-4-3-5', quiz_id: 'quiz-4-3', text: 'Differentiate: f(x) = (x² + 1)³', type: 'short_answer', correct_answer: '6x(x^2 + 1)^2', explanation: '3(x²+1)² × 2x = 6x(x²+1)².', order: 5 },
  // Quiz 5-1: Descriptive Stats
  { id: 'q-5-1-1', quiz_id: 'quiz-5-1', text: 'Find the mean of: 4, 8, 6, 5, 7', type: 'multiple_choice', choices: ['5', '6', '7', '8'], correct_answer: '6', explanation: '(4+8+6+5+7)/5 = 30/5 = 6.', order: 1 },
  { id: 'q-5-1-2', quiz_id: 'quiz-5-1', text: 'Find the median of: 3, 7, 9, 1, 5', type: 'multiple_choice', choices: ['3', '5', '7', '9'], correct_answer: '5', explanation: 'Sorted: 1, 3, 5, 7, 9. Middle value is 5.', order: 2 },
  { id: 'q-5-1-3', quiz_id: 'quiz-5-1', text: 'The most frequent value in a data set is the...', type: 'multiple_choice', choices: ['Mean', 'Median', 'Mode', 'Range'], correct_answer: 'Mode', explanation: 'The mode is the most frequently occurring value.', order: 3 },
  { id: 'q-5-1-4', quiz_id: 'quiz-5-1', text: 'Range = ? - ?', type: 'multiple_choice', choices: ['max - min', 'max - mean', 'mean - min', 'Q3 - Q1'], correct_answer: 'max - min', explanation: 'Range is the maximum value minus the minimum value.', order: 4 },
  { id: 'q-5-1-5', quiz_id: 'quiz-5-1', text: 'Find the mean of: 10, 20, 30', type: 'short_answer', correct_answer: '20', explanation: '(10+20+30)/3 = 60/3 = 20.', order: 5 },
  // Quiz 5-2: Probability
  { id: 'q-5-2-1', quiz_id: 'quiz-5-2', text: 'P(A) ranges from...', type: 'multiple_choice', choices: ['-1 to 1', '0 to 1', '0 to 100', '1 to 10'], correct_answer: '0 to 1', explanation: 'Probabilities always range from 0 (impossible) to 1 (certain).', order: 1 },
  { id: 'q-5-2-2', quiz_id: 'quiz-5-2', text: 'Roll a die. P(even) = ?', type: 'multiple_choice', choices: ['1/6', '1/3', '1/2', '2/3'], correct_answer: '1/2', explanation: 'Even numbers: 2, 4, 6. That\'s 3 out of 6 = 1/2.', order: 2 },
  { id: 'q-5-2-3', quiz_id: 'quiz-5-2', text: 'P(not A) = ?', type: 'multiple_choice', choices: ['1 - P(A)', 'P(A)', '1 + P(A)', '1/P(A)'], correct_answer: '1 - P(A)', explanation: 'The complement rule: P(not A) = 1 - P(A).', order: 3 },
  { id: 'q-5-2-4', quiz_id: 'quiz-5-2', text: 'If A and B are independent, P(A and B) = ?', type: 'multiple_choice', choices: ['P(A) + P(B)', 'P(A) × P(B)', 'P(A) - P(B)', 'P(A) / P(B)'], correct_answer: 'P(A) × P(B)', explanation: 'For independent events, multiply their probabilities.', order: 4 },
  { id: 'q-5-2-5', quiz_id: 'quiz-5-2', text: 'Flip 2 coins. P(both heads) = ?', type: 'short_answer', correct_answer: '1/4', explanation: 'P(H) × P(H) = 0.5 × 0.5 = 0.25 = 1/4.', order: 5 },
  // Quiz 5-3: Normal Distribution
  { id: 'q-5-3-1', quiz_id: 'quiz-5-3', text: 'The normal distribution is also called the...', type: 'multiple_choice', choices: ['Bell curve', 'U-curve', 'Linear curve', 'S-curve'], correct_answer: 'Bell curve', explanation: 'The normal distribution has a characteristic bell shape.', order: 1 },
  { id: 'q-5-3-2', quiz_id: 'quiz-5-3', text: 'What % of data falls within 1 standard deviation?', type: 'multiple_choice', choices: ['50%', '68%', '95%', '99.7%'], correct_answer: '68%', explanation: 'The 68-95-99.7 rule: ~68% within 1σ.', order: 2 },
  { id: 'q-5-3-3', quiz_id: 'quiz-5-3', text: 'The z-score formula is z = ?', type: 'multiple_choice', choices: ['(x - μ) / σ', '(μ - x) / σ', 'x / σ', '(x + μ) / σ'], correct_answer: '(x - μ) / σ', explanation: 'z = (x - μ) / σ, measuring standard deviations from the mean.', order: 3 },
  { id: 'q-5-3-4', quiz_id: 'quiz-5-3', text: 'What % falls within 2 standard deviations?', type: 'multiple_choice', choices: ['68%', '90%', '95%', '99.7%'], correct_answer: '95%', explanation: 'The 68-95-99.7 rule: ~95% within 2σ.', order: 4 },
  { id: 'q-5-3-5', quiz_id: 'quiz-5-3', text: 'If μ=50, σ=10, find z for x=70.', type: 'short_answer', correct_answer: '2', explanation: 'z = (70 - 50) / 10 = 2.', order: 5 },
  // Quiz 6-1: Trig Ratios
  { id: 'q-6-1-1', quiz_id: 'quiz-6-1', text: 'sin(θ) = ? / hypotenuse', type: 'multiple_choice', choices: ['Adjacent', 'Opposite', 'Adjacent side', 'Base'], correct_answer: 'Opposite', explanation: 'SOH: sin = opposite / hypotenuse.', order: 1 },
  { id: 'q-6-1-2', quiz_id: 'quiz-6-1', text: 'cos(θ) = ? / hypotenuse', type: 'multiple_choice', choices: ['Opposite', 'Adjacent', 'Base', 'Perpendicular'], correct_answer: 'Adjacent', explanation: 'CAH: cos = adjacent / hypotenuse.', order: 2 },
  { id: 'q-6-1-3', quiz_id: 'quiz-6-1', text: 'tan(θ) = ? / adjacent', type: 'multiple_choice', choices: ['Hypotenuse', 'Opposite', 'Sine', 'Cosine'], correct_answer: 'Opposite', explanation: 'TOA: tan = opposite / adjacent.', order: 3 },
  { id: 'q-6-1-4', quiz_id: 'quiz-6-1', text: 'SOH-CAH-TOA helps remember...', type: 'multiple_choice', choices: ['Area formulas', 'Trig ratios', 'Circle theorems', 'Pythagorean theorem'], correct_answer: 'Trig ratios', explanation: 'SOH-CAH-TOA is a mnemonic for sine, cosine, and tangent ratios.', order: 4 },
  { id: 'q-6-1-5', quiz_id: 'quiz-6-1', text: 'In a right triangle, if opp=3 and hyp=5, find sin(θ).', type: 'short_answer', correct_answer: '3/5', explanation: 'sin(θ) = opposite / hypotenuse = 3/5.', order: 5 },
  // Quiz 6-2: Solving Triangles
  { id: 'q-6-2-1', quiz_id: 'quiz-6-2', text: 'Law of Sines: a/sin(A) = ?', type: 'multiple_choice', choices: ['b/cos(B)', 'b/sin(B)', 'a/cos(A)', 'c/tan(C)'], correct_answer: 'b/sin(B)', explanation: 'The Law of Sines: a/sin(A) = b/sin(B) = c/sin(C).', order: 1 },
  { id: 'q-6-2-2', quiz_id: 'quiz-6-2', text: 'Law of Cosines: c² = ?', type: 'multiple_choice', choices: ['a² + b²', 'a² + b² - 2ab·cos(C)', 'a² + b² + 2ab', 'a² - b²'], correct_answer: 'a² + b² - 2ab·cos(C)', explanation: 'The Law of Cosines: c² = a² + b² - 2ab·cos(C).', order: 2 },
  { id: 'q-6-2-3', quiz_id: 'quiz-6-2', text: 'When do you use the Law of Cosines?', type: 'multiple_choice', choices: ['ASA only', 'SAS or SSS', 'AAS only', 'AAA'], correct_answer: 'SAS or SSS', explanation: 'Law of Cosines is used for SAS (two sides + included angle) or SSS (three sides).', order: 3 },
  { id: 'q-6-2-4', quiz_id: 'quiz-6-2', text: 'When do you use the Law of Sines?', type: 'multiple_choice', choices: ['SAS', 'SSS', 'ASA or AAS', 'SSS only'], correct_answer: 'ASA or AAS', explanation: 'Law of Sines works for ASA, AAS, or SSA cases.', order: 4 },
  { id: 'q-6-2-5', quiz_id: 'quiz-6-2', text: 'sin²(θ) + cos²(θ) = ?', type: 'short_answer', correct_answer: '1', explanation: 'The Pythagorean identity: sin²(θ) + cos²(θ) = 1.', order: 5 },
  // Quiz 6-3: Trig Identities
  { id: 'q-6-3-1', quiz_id: 'quiz-6-3', text: 'sin²(θ) + cos²(θ) = ?', type: 'multiple_choice', choices: ['0', '1', '2', 'sin(2θ)'], correct_answer: '1', explanation: 'The fundamental Pythagorean identity.', order: 1 },
  { id: 'q-6-3-2', quiz_id: 'quiz-6-3', text: 'tan(θ) = ?', type: 'multiple_choice', choices: ['sin(θ)/cos(θ)', 'cos(θ)/sin(θ)', 'sin(θ)·cos(θ)', '1/sin(θ)'], correct_answer: 'sin(θ)/cos(θ)', explanation: 'tan(θ) = sin(θ) / cos(θ) by definition.', order: 2 },
  { id: 'q-6-3-3', quiz_id: 'quiz-6-3', text: 'sin(2θ) = ?', type: 'multiple_choice', choices: ['2·sin(θ)', '2·sin(θ)·cos(θ)', 'sin²(θ)', 'cos²(θ)'], correct_answer: '2·sin(θ)·cos(θ)', explanation: 'The double angle formula: sin(2θ) = 2sin(θ)cos(θ).', order: 3 },
  { id: 'q-6-3-4', quiz_id: 'quiz-6-3', text: 'cos(2θ) = ?', type: 'multiple_choice', choices: ['cos²(θ) - sin²(θ)', '2·cos(θ)', 'sin²(θ) - cos²(θ)', '2·sin(θ)'], correct_answer: 'cos²(θ) - sin²(θ)', explanation: 'The double angle formula: cos(2θ) = cos²(θ) - sin²(θ).', order: 4 },
  { id: 'q-6-3-5', quiz_id: 'quiz-6-3', text: 'sin(A+B) = ?', type: 'short_answer', correct_answer: 'sin(A)cos(B) + cos(A)sin(B)', explanation: 'The sum formula: sin(A+B) = sin(A)cos(B) + cos(A)sin(B).', order: 5 },
];
