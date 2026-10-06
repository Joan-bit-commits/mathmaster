import type { Lesson } from '@/types/learning';

export const mockLessons: Lesson[] = [
  // Topic 1: Linear Equations (5 lessons)
  {
    id: 'lesson-1-1',
    topic_id: 'topic-1',
    title: 'What is a Linear Equation?',
    description: 'Understand the building blocks of linear equations.',
    duration_minutes: 15,
    difficulty: 'Beginner',
    order: 1,
    completed: true,
    content: `# What is a Linear Equation?

A **linear equation** is an equation that forms a straight line when graphed. The general form is:

\`\`\`
y = mx + b
\`\`\`

Where:
- **m** is the slope (steepness of the line)
- **b** is the y-intercept (where the line crosses the y-axis)

## Example

Solve for x:

\`\`\`
2x + 5 = 13
\`\`\`

Step 1: Subtract 5 from both sides.
\`\`\`
2x = 8
\`\`\`

Step 2: Divide both sides by 2.
\`\`\`
x = 4
\`\`\`

## Key Takeaway

Linear equations have variables raised to the **first power** only — no squares, cubes, or roots.`,
  },
  {
    id: 'lesson-1-2',
    topic_id: 'topic-1',
    title: 'Solving One-Step Equations',
    description: 'Learn the four basic operations for solving simple equations.',
    duration_minutes: 20,
    difficulty: 'Beginner',
    order: 2,
    completed: true,
    content: `# Solving One-Step Equations

To solve a one-step equation, isolate the variable using **inverse operations**.

## Addition & Subtraction

\`\`\`
x + 7 = 12  →  x = 12 - 7 = 5
x - 3 = 8   →  x = 8 + 3 = 11
\`\`\`

## Multiplication & Division

\`\`\`
3x = 15     →  x = 15 / 3 = 5
x / 4 = 6   →  x = 6 × 4 = 24
\`\`\`

## Remember

Whatever you do to one side, you must do to the other.`,
  },
  {
    id: 'lesson-1-3',
    topic_id: 'topic-1',
    title: 'Multi-Step Equations',
    description: 'Combine like terms and distribute to solve complex equations.',
    duration_minutes: 25,
    difficulty: 'Intermediate',
    order: 3,
    completed: true,
    content: `# Multi-Step Equations

Some equations require multiple steps to solve.

## Strategy

1. **Distribute** if there are parentheses
2. **Combine like terms** on each side
3. Move variables to one side
4. Isolate the variable

## Example

\`\`\`
3(x + 4) = 2x + 13
\`\`\`

Step 1: Distribute.
\`\`\`
3x + 12 = 2x + 13
\`\`\`

Step 2: Subtract 2x from both sides.
\`\`\`
x + 12 = 13
\`\`\`

Step 3: Subtract 12.
\`\`\`
x = 1
\`\`\``,
  },
  {
    id: 'lesson-1-4',
    topic_id: 'topic-1',
    title: 'Graphing Linear Equations',
    description: 'Plot lines on a coordinate plane using slope and intercept.',
    duration_minutes: 30,
    difficulty: 'Intermediate',
    order: 4,
    completed: false,
    content: `# Graphing Linear Equations

## The Coordinate Plane

Every point is written as **(x, y)**.

## Graphing with Slope-Intercept Form

Given **y = 2x + 3**:

1. Plot the y-intercept at **(0, 3)**
2. Use the slope **m = 2** (rise 2, run 1)
3. Plot a second point and draw the line

## Tips

- Positive slope → line goes up left to right
- Negative slope → line goes down left to right
- Slope of 0 → horizontal line`,
  },
  {
    id: 'lesson-1-5',
    topic_id: 'topic-1',
    title: 'Inequalities and Number Lines',
    description: 'Solve and graph inequalities with one variable.',
    duration_minutes: 20,
    difficulty: 'Intermediate',
    order: 5,
    completed: false,
    content: `# Inequalities

Inequalities use symbols: **<, >, ≤, ≥**

## Solving

Treat inequalities just like equations — with one exception:

> When you **multiply or divide by a negative number**, flip the inequality sign.

## Example

\`\`\`
-2x + 6 > 10
-2x > 4
x < -2
\`\`\`

Notice the sign flipped because we divided by -2.

## Graphing

Use an **open circle** for < and >, and a **closed circle** for ≤ and ≥.`,
  },
  // Topic 2: Quadratic Functions (4 lessons)
  {
    id: 'lesson-2-1',
    topic_id: 'topic-2',
    title: 'Introduction to Parabolas',
    description: 'Discover the shape and properties of quadratic graphs.',
    duration_minutes: 25,
    difficulty: 'Intermediate',
    order: 1,
    completed: true,
    content: `# Introduction to Parabolas

A **quadratic function** has the form:

\`\`\`
y = ax² + bx + c
\`\`\`

Its graph is a **parabola** — a U-shaped curve.

## Key Features

- **Vertex**: the highest or lowest point
- **Axis of symmetry**: vertical line through the vertex
- **Direction**: opens up if a > 0, down if a < 0

## Example

y = x² - 4x + 3 has vertex at (2, -1) and opens upward.`,
  },
  {
    id: 'lesson-2-2',
    topic_id: 'topic-2',
    title: 'Factoring Quadratics',
    description: 'Break down quadratics into binomial factors.',
    duration_minutes: 30,
    difficulty: 'Intermediate',
    order: 2,
    completed: false,
    content: `# Factoring Quadratics

To factor **x² + 5x + 6**, find two numbers that:
- Multiply to **6** (the constant)
- Add to **5** (the middle coefficient)

Those numbers are **2 and 3**, so:

\`\`\`
x² + 5x + 6 = (x + 2)(x + 3)
\`\`\`

## Special Cases

- **Difference of squares**: a² - b² = (a+b)(a-b)
- **Perfect square**: a² + 2ab + b² = (a+b)²`,
  },
  {
    id: 'lesson-2-3',
    topic_id: 'topic-2',
    title: 'The Quadratic Formula',
    description: 'The universal method for solving any quadratic equation.',
    duration_minutes: 20,
    difficulty: 'Advanced',
    order: 3,
    completed: false,
    content: `# The Quadratic Formula

For any equation **ax² + bx + c = 0**:

\`\`\`
x = (-b ± √(b² - 4ac)) / 2a
\`\`\`

## The Discriminant

The part under the square root, **b² - 4ac**, tells us:

- **> 0**: two real solutions
- **= 0**: one real solution
- **< 0**: no real solutions (complex roots)

## Example

For 2x² + 3x - 2 = 0:
\`\`\`
x = (-3 ± √(9 + 16)) / 4 = (-3 ± 5) / 4
x = 1/2 or x = -2
\`\`\``,
  },
  {
    id: 'lesson-2-4',
    topic_id: 'topic-2',
    title: 'Real-World Applications',
    description: 'Use quadratics to model projectile motion and area problems.',
    duration_minutes: 25,
    difficulty: 'Advanced',
    order: 4,
    completed: false,
    content: `# Real-World Quadratics

## Projectile Motion

The height of a ball thrown upward:

\`\`\`
h = -16t² + v₀t + h₀
\`\`\`

Where v₀ is initial velocity and h₀ is starting height.

## Area Problems

A rectangle with width w and length (w + 5) has area:

\`\`\`
A = w(w + 5) = w² + 5w
\`\`\`

If the area is 36, solve w² + 5w - 36 = 0 to find dimensions.`,
  },
  // Topic 3: Euclidean Geometry (6 lessons)
  {
    id: 'lesson-3-1',
    topic_id: 'topic-3',
    title: 'Angles and Lines',
    description: 'Learn about complementary, supplementary, and vertical angles.',
    duration_minutes: 20,
    difficulty: 'Beginner',
    order: 1,
    completed: false,
    content: `# Angles and Lines

## Types of Angles

- **Acute**: less than 90°
- **Right**: exactly 90°
- **Obtuse**: between 90° and 180°
- **Straight**: exactly 180°

## Angle Pairs

- **Complementary**: two angles that sum to 90°
- **Supplementary**: two angles that sum to 180°
- **Vertical**: opposite angles formed by intersecting lines — always equal`,
  },
  {
    id: 'lesson-3-2',
    topic_id: 'topic-3',
    title: 'Triangle Properties',
    description: 'Explore types of triangles and the angle sum theorem.',
    duration_minutes: 25,
    difficulty: 'Beginner',
    order: 2,
    completed: false,
    content: `# Triangle Properties

## Types of Triangles

- **Equilateral**: all sides and angles equal (60° each)
- **Isosceles**: two sides equal
- **Scalene**: no sides equal
- **Right**: one 90° angle

## Angle Sum Theorem

The interior angles of any triangle add up to **180°**.

## Pythagorean Theorem

For a right triangle with legs a, b and hypotenuse c:

\`\`\`
a² + b² = c²
\`\`\``,
  },
  {
    id: 'lesson-3-3',
    topic_id: 'topic-3',
    title: 'Congruence and Similarity',
    description: 'Determine when shapes are congruent or similar.',
    duration_minutes: 30,
    difficulty: 'Intermediate',
    order: 3,
    completed: false,
    content: `# Congruence and Similarity

## Congruent Shapes

Same shape **and** same size. Triangles are congruent if:

- **SSS**: all three sides equal
- **SAS**: two sides and included angle equal
- **ASA**: two angles and included side equal

## Similar Shapes

Same shape but different size. All angles equal, sides are **proportional**.

## Example

If triangle ABC is similar to DEF with ratio 1:2, then each side of DEF is twice the corresponding side of ABC.`,
  },
  {
    id: 'lesson-3-4',
    topic_id: 'topic-3',
    title: 'Circle Theorems',
    description: 'Master inscribed angles, arcs, and tangent properties.',
    duration_minutes: 35,
    difficulty: 'Advanced',
    order: 4,
    completed: false,
    content: `# Circle Theorems

## Key Theorems

1. **Inscribed angle** = half the central angle subtending the same arc
2. **Angle in a semicircle** = 90°
3. **Tangent** is perpendicular to the radius at the point of contact
4. **Opposite angles** of a cyclic quadrilateral sum to 180°

## Arc Length

\`\`\`
arc = (θ / 360) × 2πr
\`\`\`

Where θ is the central angle in degrees and r is the radius.`,
  },
  {
    id: 'lesson-3-5',
    topic_id: 'topic-3',
    title: 'Polygons and Quadrilaterals',
    description: 'Properties of regular and irregular polygons.',
    duration_minutes: 25,
    difficulty: 'Intermediate',
    order: 5,
    completed: false,
    content: `# Polygons and Quadrilaterals

## Interior Angle Sum

For an n-sided polygon:

\`\`\`
sum = (n - 2) × 180°
\`\`\`

## Quadrilateral Types

- **Parallelogram**: opposite sides parallel and equal
- **Rectangle**: parallelogram with right angles
- **Rhombus**: parallelogram with all sides equal
- **Square**: both rectangle and rhombus
- **Trapezoid**: exactly one pair of parallel sides`,
  },
  {
    id: 'lesson-3-6',
    topic_id: 'topic-3',
    title: 'Geometric Proofs',
    description: 'Write formal two-column and paragraph proofs.',
    duration_minutes: 40,
    difficulty: 'Advanced',
    order: 6,
    completed: false,
    content: `# Geometric Proofs

## Structure

A proof has:
1. **Given** — what we know
2. **To prove** — what we need to show
3. **Statements** — logical steps
4. **Reasons** — justifications (definitions, postulates, theorems)

## Tips

- Start with the given information
- Each statement must follow from previous ones
- Use correct notation (≅ for congruent, ∥ for parallel)`,
  },
  // Topic 4: Calculus (5 lessons)
  {
    id: 'lesson-4-1',
    topic_id: 'topic-4',
    title: 'Understanding Limits',
    description: 'The foundation concept of calculus.',
    duration_minutes: 30,
    difficulty: 'Advanced',
    order: 1,
    completed: true,
    content: `# Understanding Limits

A **limit** describes what value a function approaches as x gets closer to some value.

## Notation

\`\`\`
lim(x→a) f(x) = L
\`\`\`

## Example

\`\`\`
lim(x→2) (x² + 3) = 7
\`\`\`

As x gets close to 2, x² + 3 gets close to 7.

## Key Idea

Limits let us talk about behavior at a point even when the function is not defined there.`,
  },
  {
    id: 'lesson-4-2',
    topic_id: 'topic-4',
    title: 'Derivatives: The Rate of Change',
    description: 'Learn how to find instantaneous rates of change.',
    duration_minutes: 35,
    difficulty: 'Advanced',
    order: 2,
    completed: true,
    content: `# Derivatives

The **derivative** of f(x) measures the instantaneous rate of change:

\`\`\`
f'(x) = lim(h→0) [f(x+h) - f(x)] / h
\`\`\`

## Power Rule

\`\`\`
d/dx [xⁿ] = n·xⁿ⁻¹
\`\`\`

## Examples

- d/dx [x³] = 3x²
- d/dx [5x²] = 10x
- d/dx [7] = 0

The derivative gives the **slope of the tangent line** at any point.`,
  },
  {
    id: 'lesson-4-3',
    topic_id: 'topic-4',
    title: 'Derivative Rules',
    description: 'Product, quotient, and chain rules for complex functions.',
    duration_minutes: 30,
    difficulty: 'Advanced',
    order: 3,
    completed: false,
    content: `# Derivative Rules

## Product Rule

\`\`\`
(fg)' = f'g + fg'
\`\`\`

## Quotient Rule

\`\`\`
(f/g)' = (f'g - fg') / g²
\`\`\`

## Chain Rule

\`\`\`
d/dx [f(g(x))] = f'(g(x)) · g'(x)
\`\`\`

## Example

d/dx [(3x + 1)⁴] = 4(3x + 1)³ · 3 = 12(3x + 1)³`,
  },
  {
    id: 'lesson-4-4',
    topic_id: 'topic-4',
    title: 'Optimization Problems',
    description: 'Use derivatives to find maxima and minima.',
    duration_minutes: 35,
    difficulty: 'Advanced',
    order: 4,
    completed: false,
    content: `# Optimization Problems

## Strategy

1. Write a function for the quantity to maximize/minimize
2. Find the derivative and set it to zero
3. Solve for the critical points
4. Verify it's a max or min (second derivative test)

## Example

Find the dimensions of a rectangle with perimeter 20 that has maximum area.

Let width = w, length = (20 - 2w)/2 = 10 - w.
Area A = w(10 - w) = 10w - w².
A' = 10 - 2w = 0 → w = 5.
Maximum area: 5 × 5 = 25 (a square!).`,
  },
  {
    id: 'lesson-4-5',
    topic_id: 'topic-4',
    title: 'Applications of Derivatives',
    description: 'Related rates and motion problems.',
    duration_minutes: 30,
    difficulty: 'Advanced',
    order: 5,
    completed: false,
    content: `# Applications of Derivatives

## Related Rates

When two quantities change together, their rates of change are related through the derivative.

## Position, Velocity, Acceleration

- **Position** s(t)
- **Velocity** v(t) = s'(t)
- **Acceleration** a(t) = v'(t) = s''(t)

## Example

If s(t) = t³ - 6t² + 9t, then:
- v(t) = 3t² - 12t + 9
- a(t) = 6t - 12`,
  },
  // Topic 5: Statistics (4 lessons)
  {
    id: 'lesson-5-1',
    topic_id: 'topic-5',
    title: 'Descriptive Statistics',
    description: 'Mean, median, mode, and measures of spread.',
    duration_minutes: 20,
    difficulty: 'Beginner',
    order: 1,
    completed: true,
    content: `# Descriptive Statistics

## Measures of Center

- **Mean**: sum of values ÷ count
- **Median**: middle value when sorted
- **Mode**: most frequent value

## Measures of Spread

- **Range**: max - min
- **Variance**: average of squared deviations from mean
- **Standard deviation**: √variance

## Example

Data: 4, 8, 6, 5, 7
- Mean = 6
- Median = 6
- Range = 4`,
  },
  {
    id: 'lesson-5-2',
    topic_id: 'topic-5',
    title: 'Data Visualization',
    description: 'Choose the right chart for your data.',
    duration_minutes: 15,
    difficulty: 'Beginner',
    order: 2,
    completed: true,
    content: `# Data Visualization

## Chart Types

- **Bar chart**: comparing categories
- **Histogram**: distribution of numerical data
- **Line chart**: trends over time
- **Pie chart**: parts of a whole (use sparingly)
- **Box plot**: showing quartiles and outliers

## Tips

- Label your axes
- Start the y-axis at 0 for bar charts
- Avoid 3D effects — they distort perception`,
  },
  {
    id: 'lesson-5-3',
    topic_id: 'topic-5',
    title: 'Probability Basics',
    description: 'Understand probability rules and counting principles.',
    duration_minutes: 25,
    difficulty: 'Intermediate',
    order: 3,
    completed: true,
    content: `# Probability Basics

## Key Rules

- P(A) ranges from 0 to 1
- P(not A) = 1 - P(A)
- P(A or B) = P(A) + P(B) - P(A and B)
- P(A and B) = P(A) × P(B) if independent

## Example

Rolling a die: P(even) = 3/6 = 1/2.
P(>4) = 2/6 = 1/3.
P(even and >4) = P(6) = 1/6.`,
  },
  {
    id: 'lesson-5-4',
    topic_id: 'topic-5',
    title: 'Distributions & Normal Curve',
    description: 'The bell curve and the 68-95-99.7 rule.',
    duration_minutes: 30,
    difficulty: 'Intermediate',
    order: 4,
    completed: false,
    content: `# The Normal Distribution

The **normal distribution** is a bell-shaped curve defined by mean μ and standard deviation σ.

## The 68-95-99.7 Rule

- ~68% of data within **1σ** of the mean
- ~95% within **2σ**
- ~99.7% within **3σ**

## Standard Score (z-score)

\`\`\`
z = (x - μ) / σ
\`\`\`

A z-score tells you how many standard deviations a value is from the mean.`,
  },
  // Topic 6: Trigonometry (5 lessons)
  {
    id: 'lesson-6-1',
    topic_id: 'topic-6',
    title: 'Introduction to Trig Ratios',
    description: 'Sine, cosine, and tangent in right triangles.',
    duration_minutes: 20,
    difficulty: 'Beginner',
    order: 1,
    completed: true,
    content: `# Trigonometric Ratios

In a right triangle:

\`\`\`
sin(θ) = opposite / hypotenuse
cos(θ) = adjacent / hypotenuse
tan(θ) = opposite / adjacent
\`\`\`

## Remember

**SOH-CAH-TOA**:
- **S**in = **O**pp / **H**yp
- **C**os = **A**dj / **H**yp
- **T**an = **O**pp / **A**dj`,
  },
  {
    id: 'lesson-6-2',
    topic_id: 'topic-6',
    title: 'The Unit Circle',
    description: 'Extend trig ratios to any angle.',
    duration_minutes: 30,
    difficulty: 'Intermediate',
    order: 2,
    completed: true,
    content: `# The Unit Circle

A circle of radius 1 centered at the origin. For any angle θ:

\`\`\`
x = cos(θ)
y = sin(θ)
\`\`\`

## Key Values

- cos(0°) = 1, sin(0°) = 0
- cos(90°) = 0, sin(90°) = 1
- cos(180°) = -1, sin(180°) = 0
- cos(270°) = 0, sin(270°) = -1

## Pythagorean Identity

\`\`\`
sin²(θ) + cos²(θ) = 1
\`\`\``,
  },
  {
    id: 'lesson-6-3',
    topic_id: 'topic-6',
    title: 'Solving Triangles',
    description: 'Use Law of Sines and Law of Cosines for any triangle.',
    duration_minutes: 25,
    difficulty: 'Intermediate',
    order: 3,
    completed: true,
    content: `# Solving Triangles

## Law of Sines

\`\`\`
a/sin(A) = b/sin(B) = c/sin(C)
\`\`\`

## Law of Cosines

\`\`\`
c² = a² + b² - 2ab·cos(C)
\`\`\`

## When to Use

- **SAS** or **SSS**: Law of Cosines
- **ASA**, **AAS**, or **SSA**: Law of Sines`,
  },
  {
    id: 'lesson-6-4',
    topic_id: 'topic-6',
    title: 'Trig Identities',
    description: 'Simplify expressions using fundamental identities.',
    duration_minutes: 30,
    difficulty: 'Advanced',
    order: 4,
    completed: true,
    content: `# Trigonometric Identities

## Fundamental

\`\`\`
sin²(θ) + cos²(θ) = 1
tan(θ) = sin(θ) / cos(θ)
\`\`\`

## Double Angle

\`\`\`
sin(2θ) = 2sin(θ)cos(θ)
cos(2θ) = cos²(θ) - sin²(θ)
\`\`\`

## Sum Formulas

\`\`\`
sin(A+B) = sin(A)cos(B) + cos(A)sin(B)
cos(A+B) = cos(A)cos(B) - sin(A)sin(B)
\`\`\``,
  },
  {
    id: 'lesson-6-5',
    topic_id: 'topic-6',
    title: 'Real-World Trigonometry',
    description: 'Applications in surveying, navigation, and physics.',
    duration_minutes: 25,
    difficulty: 'Advanced',
    order: 5,
    completed: true,
    content: `# Real-World Trigonometry

## Finding Heights

To find the height of a tree, measure the angle of elevation θ and distance d:

\`\`\`
height = d × tan(θ)
\`\`\`

## Navigation

Bearing is measured clockwise from north. Use trig to calculate distances between points.

## Physics

Projectile motion, wave functions, and oscillations all rely on trigonometric functions.`,
  },
  // Topic 7: Number Theory (4 lessons)
  {
    id: 'lesson-7-1',
    topic_id: 'topic-7',
    title: 'Prime Numbers & Divisibility',
    description: 'The fundamental theorem of arithmetic.',
    duration_minutes: 20,
    difficulty: 'Intermediate',
    order: 1,
    completed: true,
    content: `# Prime Numbers & Divisibility

## Prime Number

A number greater than 1 with exactly two factors: 1 and itself.

## Divisibility Rules

- **2**: last digit is even
- **3**: sum of digits divisible by 3
- **5**: last digit is 0 or 5
- **9**: sum of digits divisible by 9

## Fundamental Theorem of Arithmetic

Every integer > 1 has a **unique** prime factorization.

\`\`\`
12 = 2² × 3
\`\`\``,
  },
  {
    id: 'lesson-7-2',
    topic_id: 'topic-7',
    title: 'GCD and LCM',
    description: 'Greatest common divisor and least common multiple.',
    duration_minutes: 20,
    difficulty: 'Intermediate',
    order: 2,
    completed: true,
    content: `# GCD and LCM

## GCD

The largest number that divides two numbers. Use the **Euclidean Algorithm**:

\`\`\`
gcd(48, 18):
48 = 2 × 18 + 12
18 = 1 × 12 + 6
12 = 2 × 6 + 0
gcd = 6
\`\`\`

## LCM

The smallest number both divide into. Relation:

\`\`\`
lcm(a,b) × gcd(a,b) = a × b
\`\`\``,
  },
  {
    id: 'lesson-7-3',
    topic_id: 'topic-7',
    title: 'Arithmetic Sequences',
    description: 'Patterns with a constant difference between terms.',
    duration_minutes: 25,
    difficulty: 'Intermediate',
    order: 3,
    completed: false,
    content: `# Arithmetic Sequences

Each term increases by a constant **d** (common difference).

## Formulas

\`\`\`
aₙ = a₁ + (n-1)d
Sₙ = n/2 × (a₁ + aₙ)
\`\`\`

## Example

3, 7, 11, 15, ... (d = 4)

The 10th term: a₁₀ = 3 + 9×4 = 39
Sum of 10 terms: 10/2 × (3 + 39) = 210`,
  },
  {
    id: 'lesson-7-4',
    topic_id: 'topic-7',
    title: 'Geometric Sequences',
    description: 'Patterns with a constant ratio between terms.',
    duration_minutes: 25,
    difficulty: 'Advanced',
    order: 4,
    completed: false,
    content: `# Geometric Sequences

Each term is multiplied by a constant **r** (common ratio).

## Formulas

\`\`\`
aₙ = a₁ × rⁿ⁻¹
Sₙ = a₁ × (rⁿ - 1) / (r - 1)
\`\`\`

## Example

2, 6, 18, 54, ... (r = 3)

The 5th term: a₅ = 2 × 3⁴ = 162
Sum of 5 terms: 2 × (3⁵ - 1) / (3 - 1) = 242

## Infinite Series (if |r| < 1)

\`\`\`
S = a₁ / (1 - r)
\`\`\``,
  },
  // Topic 8: Advanced Integration (5 lessons)
  {
    id: 'lesson-8-1',
    topic_id: 'topic-8',
    title: 'Integration by Parts',
    description: 'The product rule in reverse.',
    duration_minutes: 35,
    difficulty: 'Advanced',
    order: 1,
    completed: true,
    content: `# Integration by Parts

Derived from the product rule:

\`\`\`
∫ u dv = uv - ∫ v du
\`\`\`

## LIATE Rule

Choose u in order: **L**og, **I**nverse trig, **A**lgebraic, **T**rig, **E**xponential

## Example

∫ x·eˣ dx

Let u = x, dv = eˣ dx → du = dx, v = eˣ

\`\`\`
= xeˣ - ∫ eˣ dx = xeˣ - eˣ + C
\`\`\``,
  },
  {
    id: 'lesson-8-2',
    topic_id: 'topic-8',
    title: 'Partial Fractions',
    description: 'Decompose rational expressions for easier integration.',
    duration_minutes: 30,
    difficulty: 'Advanced',
    order: 2,
    completed: false,
    content: `# Partial Fractions

Break a complex fraction into simpler parts.

## Example

\`\`\`
1 / [(x+1)(x+2)] = A/(x+1) + B/(x+2)
\`\`\`

Solving: A = 1, B = -1

\`\`\`
∫ 1/[(x+1)(x+2)] dx = ln|x+1| - ln|x+2| + C
\`\`\`

## Types

- Distinct linear factors
- Repeated linear factors
- Irreducible quadratic factors`,
  },
  {
    id: 'lesson-8-3',
    topic_id: 'topic-8',
    title: 'Trigonometric Substitution',
    description: 'Use trig identities to simplify integrals.',
    duration_minutes: 35,
    difficulty: 'Advanced',
    order: 3,
    completed: false,
    content: `# Trigonometric Substitution

Use when you see expressions like √(a² - x²), √(a² + x²), or √(x² - a²).

## Substitutions

- √(a² - x²) → x = a·sin(θ)
- √(a² + x²) → x = a·tan(θ)
- √(x² - a²) → x = a·sec(θ)

## Example

For ∫ √(1 - x²) dx, let x = sin(θ).`,
  },
  {
    id: 'lesson-8-4',
    topic_id: 'topic-8',
    title: 'Area Between Curves',
    description: 'Calculate the area enclosed between two functions.',
    duration_minutes: 25,
    difficulty: 'Advanced',
    order: 4,
    completed: false,
    content: `# Area Between Curves

The area between f(x) and g(x) from a to b:

\`\`\`
A = ∫[a to b] |f(x) - g(x)| dx
\`\`\`

## Steps

1. Find where f(x) = g(x) (intersection points)
2. Determine which function is on top in each interval
3. Integrate the difference

## Example

Area between y = x² and y = x from 0 to 1:

\`\`\`
A = ∫[0 to 1] (x - x²) dx = [x²/2 - x³/3] = 1/6
\`\`\``,
  },
  {
    id: 'lesson-8-5',
    topic_id: 'topic-8',
    title: 'Volume of Revolution',
    description: 'Disk and shell methods for finding volumes.',
    duration_minutes: 35,
    difficulty: 'Advanced',
    order: 5,
    completed: false,
    content: `# Volume of Revolution

## Disk Method

Rotate f(x) around the x-axis:

\`\`\`
V = π ∫[a to b] [f(x)]² dx
\`\`\`

## Shell Method

Rotate around the y-axis:

\`\`\`
V = 2π ∫[a to b] x · f(x) dx
\`\`\`

## Example

Volume of y = √x from 0 to 4 rotated around x-axis:

\`\`\`
V = π ∫[0 to 4] x dx = π × 8 = 8π
\`\`\``,
  },
];
