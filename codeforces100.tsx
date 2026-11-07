import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Terminal,
  Trophy,
  Flame,
  RefreshCw,
  CheckCircle2,
  Clock,
  Bookmark,
  BookOpen,
  BarChart3,
  Calendar as CalendarIcon,
  Search,
  Compass,
  Award,
  Settings as SettingsIcon,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Sparkles,
  Code2,
  Layers,
  Target,
  TrendingUp,
  ShieldCheck,
  Eye,
  EyeOff,
  FileText,
  RotateCcw,
  UserCheck,
  Users,
  Database,
  Check,
  X,
  ArrowUpRight,
  Download,
  Upload,
  FastForward,
  CheckSquare,
  Activity,
  Zap,
  Pause,
  Play,
  ListFilter
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';

// ============================================================================
// CONSTANTS & DYNAMIC 3-TIER RATING ESCALATION CONFIGURATION
// ============================================================================

const STORAGE_PREFIX = 'cf100_v6_';
const ALL_CHALLENGE_RATINGS = [1200, 1300, 1400, 1500, 1600, 1700, 1900, 2000];
const RATING_QUOTAS = {
  1200: 30,  // Days 1–30
  1300: 60,  // Days 1–60
  1400: 100, // Days 1–100
  1500: 100, // Days 1–100
  1600: 100, // Days 1–100
  1700: 100, // Days 1–100
  1900: 70,  // Days 31–100
  2000: 40   // Days 61–100
};

// Dynamic 3-Tier Rating Escalation Helper:
// Days 1–30:   [1200, 1300, 1400, 1500, 1600, 1700]
// Days 31–60:  [1300, 1400, 1500, 1600, 1700, 1900] (1200 removed, 1900 added)
// Days 61–100: [1400, 1500, 1600, 1700, 1900, 2000] (1300 removed, 2000 added)
function getRatingsForDay(dayNumber) {
  if (dayNumber <= 30) {
    return [1200, 1300, 1400, 1500, 1600, 1700];
  }
  if (dayNumber <= 60) {
    return [1300, 1400, 1500, 1600, 1700, 1900];
  }
  return [1400, 1500, 1600, 1700, 1900, 2000];
}

function getTierInfoForDay(dayNumber) {
  if (dayNumber <= 30) {
    return {
      tier: 1,
      name: 'Tier 1 • Foundation Ladder',
      rangeLabel: '1200 → 1700',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    };
  }
  if (dayNumber <= 60) {
    return {
      tier: 2,
      name: 'Tier 2 • Candidate Master Push (-1200, +1900)',
      rangeLabel: '1300 → 1900',
      badgeClass: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30'
    };
  }
  return {
    tier: 3,
    name: 'Tier 3 • Master Escalation (-1300, +2000)',
    rangeLabel: '1400 → 2000',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  };
}

// 6 Distinct Algorithmic Archetypes for Intra-Day Mixed-Topic Entropy
const DAILY_ARCHETYPES = [
  {
    id: 'dp',
    name: 'Dynamic Programming',
    shortName: 'DP & States',
    tags: ['dp', 'bitmasks'],
    color: '#8B5CF6'
  },
  {
    id: 'graphs_trees',
    name: 'Graphs, Trees & DSU',
    shortName: 'Graphs & Trees',
    tags: ['graphs', 'trees', 'dfs and similar', 'shortest paths', 'dsu'],
    color: '#06B6D4'
  },
  {
    id: 'bs_tp',
    name: 'Binary Search & Two Pointers',
    shortName: 'BS & Two Pointers',
    tags: ['binary search', 'two pointers', 'ternary search'],
    color: '#10B981'
  },
  {
    id: 'ds_strings',
    name: 'Data Structures & Strings',
    shortName: 'Data Structures',
    tags: ['data structures', 'strings', 'hashing', 'sortings'],
    color: '#6366F1'
  },
  {
    id: 'math_nt',
    name: 'Number Theory & Combinatorics',
    shortName: 'Math & Number Theory',
    tags: ['math', 'number theory', 'combinatorics', 'probabilities'],
    color: '#F59E0B'
  },
  {
    id: 'greedy_constructive',
    name: 'Greedy & Constructive Logic',
    shortName: 'Greedy & Constructive',
    tags: ['greedy', 'constructive algorithms', 'implementation', 'brute force'],
    color: '#EC4899'
  }
];

// 8 Progressive Phases mapped across 100 Days & Contest Eras (Contest >= 400 -> Recent)
const CURRICULUM_PHASES = [
  {
    phase: 1,
    name: 'PHASE 1 — CLASSIC FOUNDATIONS (CONTESTS 400–560)',
    dayStart: 1,
    dayEnd: 10,
    contestEra: 'CF Rounds #400 – #560',
    eraDifficultyNote: 'Tier 1 (1200–1700): Clean problem statements, direct algorithmic reductions, classic Greedy, Sorting, Prefix Sums, and introductory DP/Graphs.',
    topics: ['Implementation', 'Constructive', 'Sorting', 'Greedy', 'Prefix Sums', 'Two Pointers', 'Binary Search', 'Basic Math']
  },
  {
    phase: 2,
    name: 'PHASE 2 — CORE SDE & CP PATTERNS (CONTESTS 561–740)',
    dayStart: 11,
    dayEnd: 20,
    contestEra: 'CF Rounds #561 – #740',
    eraDifficultyNote: 'Tier 1 (1200–1700): Monotonic predicates, Sliding Window, Number Theory (GCD/LCM/Primes), Bitmasks, and clean Graph traversals.',
    topics: ['Binary Search on Answer', 'Sliding Window', 'Hashing', 'Difference Arrays', 'Number Theory', 'Bit Manipulation', 'Combinatorics']
  },
  {
    phase: 3,
    name: 'PHASE 3 — STRUCTURAL DATA STRUCTURES (CONTESTS 741–940)',
    dayStart: 21,
    dayEnd: 30,
    contestEra: 'CF Rounds #741 – #940',
    eraDifficultyNote: 'Final 10 days of Tier 1 (1200–1700): Stacks, Monotonic Queues, Priority Queues, Sets/Maps, Coordinate Compression, and Fenwick Trees.',
    topics: ['Stacks & Queues', 'Monotonic Stack', 'Sets & Maps', 'Priority Queues / Heaps', 'Coordinate Compression', 'Fenwick Trees']
  },
  {
    phase: 4,
    name: 'PHASE 4 — RANGE QUERIES & DSU • TIER 2 ESCALATION (CONTESTS 941–1150)',
    dayStart: 31,
    dayEnd: 40,
    contestEra: 'CF Rounds #941 – #1150',
    eraDifficultyNote: 'Tier 2 Begins (1200 removed, 1900 added → 1300–1900): Disjoint Set Union, Offline Queries, Segment Trees, and Sparse Tables.',
    topics: ['Disjoint Set Union (DSU)', 'Segment Trees', 'Range Queries', 'Sparse Tables', 'Offline Queries', 'Order Statistics']
  },
  {
    phase: 5,
    name: 'PHASE 5 — GRAPH & TREE ALGORITHMS (CONTESTS 1151–1400)',
    dayStart: 41,
    dayEnd: 55,
    contestEra: 'CF Rounds #1151 – #1400',
    eraDifficultyNote: 'Tier 2 (1300–1900): Cycle Detection, Bipartite Graphs, Topological Sort, Dijkstra, MST, and Tree DP.',
    topics: ['BFS & DFS', 'Cycle Detection', 'Bipartite Graphs', 'Topological Sort / DAG', 'Dijkstra Shortest Paths', 'Trees & MST']
  },
  {
    phase: 6,
    name: 'PHASE 6 — DYNAMIC PROGRAMMING DEPTH & TIER 3 TRANSITION (CONTESTS 1401–1650)',
    dayStart: 56,
    dayEnd: 70,
    contestEra: 'CF Rounds #1401 – #1650',
    eraDifficultyNote: 'Day 61 transitions into Tier 3 (1300 removed, 2000 added → 1400–2000): Knapsack variants, Interval DP, Tree DP, and Bitmask DP.',
    topics: ['1D & 2D DP', 'Knapsack Variants', 'LIS / LCS', 'Grid & Interval DP', 'Tree DP', 'Bitmask DP', 'State Optimization']
  },
  {
    phase: 7,
    name: 'PHASE 7 — MODERN ALGORITHMIC TECHNIQUES (CONTESTS 1651–1850)',
    dayStart: 71,
    dayEnd: 85,
    contestEra: 'CF Rounds #1651 – #1850',
    eraDifficultyNote: 'Tier 3 (1400–2000): String Hashing/KMP/Trie, Binary Lifting/LCA, Rerooting DP, and sharper mathematical invariants.',
    topics: ['Rolling Hash & KMP', 'Trie', 'Binary Lifting & LCA', 'Rerooting DP', 'Euler Tour', 'Divide & Conquer', 'Meet in the Middle']
  },
  {
    phase: 8,
    name: 'PHASE 8 — RECENT CONTEST MASTERY (CONTESTS 1851–2050+)',
    dayStart: 86,
    dayEnd: 100,
    contestEra: 'CF Rounds #1851 – #2050+',
    eraDifficultyNote: 'Tier 3 Peak (1400–2000): Latest Codeforces era with high-observation constructive, ad-hoc invariants, and multi-concept synthesis.',
    topics: ['Modern Ad-Hoc Greedy', 'Complex Graphs', 'Advanced DP', 'Game Theory & Math', 'Multi-Concept Synthesis', 'Recent Contest Meta']
  }
];

// Rating Badge styling (70% Violet/Indigo + 30% Semantic Rank Accents including 1900 & 2000)
const RATING_BADGE_STYLES = {
  1200: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', hex: '#10B981' },
  1300: { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30', hex: '#14B8A6' },
  1400: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', hex: '#06B6D4' },
  1500: { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30', hex: '#38BDF8' },
  1600: { bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/40', hex: '#6366F1' },
  1700: { bg: 'bg-violet-500/20', text: 'text-violet-300', border: 'border-violet-500/40', hex: '#8B5CF6' },
  1900: { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-300', border: 'border-fuchsia-500/40', hex: '#D946EF' },
  2000: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40', hex: '#F59E0B' }
};

// ============================================================================
// DETERMINISTIC FALLBACK PROBLEM GENERATOR (CONTEST_ID >= 400 -> 2050)
// ============================================================================

const REAL_CF_PROBLEMS_SEED = [
  { contestId: 401, index: 'C', name: 'Team', rating: 1400, tags: ['constructive algorithms', 'greedy', 'implementation'] },
  { contestId: 414, index: 'B', name: 'Mashmokh and ACM', rating: 1400, tags: ['dp', 'number theory', 'combinatorics'] },
  { contestId: 427, index: 'C', name: 'Checkposts', rating: 1700, tags: ['dfs and similar', 'graphs', 'trees'] },
  { contestId: 431, index: 'C', name: 'k-Tree', rating: 1600, tags: ['dp', 'trees', 'implementation'] },
  { contestId: 433, index: 'B', name: "Kuriyama Mirai's Stones", rating: 1200, tags: ['dp', 'implementation', 'sortings'] },
  { contestId: 445, index: 'B', name: 'DZY Loves Chemistry', rating: 1400, tags: ['dfs and similar', 'dsu', 'graphs', 'greedy'] },
  { contestId: 448, index: 'D', name: 'Multiplication Table', rating: 1600, tags: ['binary search', 'brute force'] },
  { contestId: 449, index: 'B', name: 'Jzzhu and Cities', rating: 2000, tags: ['graphs', 'greedy', 'shortest paths'] },
  { contestId: 451, index: 'B', name: 'Sort the Array', rating: 1300, tags: ['implementation', 'sortings'] },
  { contestId: 455, index: 'A', name: 'Boredom', rating: 1500, tags: ['dp'] },
  { contestId: 455, index: 'C', name: 'Civilization', rating: 1900, tags: ['dfs and similar', 'dsu', 'trees'] },
  { contestId: 459, index: 'B', name: 'Pashmak and Flowers', rating: 1300, tags: ['combinatorics', 'implementation', 'sortings'] },
  { contestId: 463, index: 'D', name: 'Gargari and Permutations', rating: 1900, tags: ['dfs and similar', 'dp', 'graphs'] },
  { contestId: 466, index: 'C', name: 'Number of Ways', rating: 1700, tags: ['binary search', 'dp', 'two pointers'] },
  { contestId: 474, index: 'B', name: 'Worms', rating: 1200, tags: ['binary search', 'implementation'] },
  { contestId: 474, index: 'D', name: 'Flowers', rating: 1700, tags: ['dp'] },
  { contestId: 474, index: 'E', name: 'Pillars', rating: 2000, tags: ['binary search', 'data structures', 'dp', 'trees'] },
  { contestId: 476, index: 'B', name: 'Dreamoon and WiFi', rating: 1300, tags: ['bitmasks', 'brute force', 'combinatorics', 'dp', 'math', 'probabilities'] },
  { contestId: 478, index: 'B', name: 'Random Teams', rating: 1300, tags: ['combinatorics', 'constructive algorithms', 'greedy', 'math'] },
  { contestId: 479, index: 'C', name: 'Exams', rating: 1400, tags: ['greedy', 'sortings'] },
  { contestId: 489, index: 'B', name: 'BerSU Ball', rating: 1200, tags: ['dfs and similar', 'dp', 'greedy', 'two pointers'] },
  { contestId: 489, index: 'C', name: 'Given Length and Sum of Digits...', rating: 1400, tags: ['dp', 'greedy', 'implementation'] },
  { contestId: 492, index: 'B', name: 'Vanya and Lanterns', rating: 1200, tags: ['binary search', 'implementation', 'math', 'sortings'] },
  { contestId: 510, index: 'B', name: 'Fox And Two Dots', rating: 1500, tags: ['dfs and similar', 'graphs'] },
  { contestId: 510, index: 'C', name: 'Fox And Names', rating: 1600, tags: ['dfs and similar', 'graphs', 'sortings'] },
  { contestId: 519, index: 'E', name: 'A and B and Lecture Rooms', rating: 1900, tags: ['binary search', 'data structures', 'dfs and similar', 'dp', 'trees'] },
  { contestId: 520, index: 'B', name: 'Two Buttons', rating: 1400, tags: ['dfs and similar', 'graphs', 'greedy', 'math', 'shortest paths'] },
  { contestId: 545, index: 'C', name: 'Woodcutters', rating: 1500, tags: ['dp', 'greedy'] },
  { contestId: 547, index: 'B', name: 'Mike and Feet', rating: 1900, tags: ['binary search', 'data structures', 'dp', 'dsu'] },
  { contestId: 550, index: 'A', name: 'Two Substrings', rating: 1500, tags: ['brute force', 'dp', 'greedy', 'implementation', 'strings'] },
  { contestId: 550, index: 'C', name: 'Divisibility by Eight', rating: 1500, tags: ['brute force', 'dp', 'math'] },
  { contestId: 558, index: 'E', name: 'A Simple Task', rating: 2000, tags: ['data structures', 'sortings', 'strings'] },
  { contestId: 577, index: 'B', name: 'Modulo Sum', rating: 1600, tags: ['combinatorics', 'data structures', 'dp', 'math', 'two pointers'] },
  { contestId: 580, index: 'B', name: 'Kefa and Company', rating: 1500, tags: ['binary search', 'sortings', 'two pointers'] },
  { contestId: 580, index: 'C', name: 'Kefa and Park', rating: 1500, tags: ['dfs and similar', 'graphs', 'trees'] },
  { contestId: 598, index: 'D', name: 'Igor In the Museum', rating: 1900, tags: ['dfs and similar', 'graphs'] },
  { contestId: 600, index: 'B', name: 'Queries about less or equal elements', rating: 1300, tags: ['binary search', 'data structures', 'sortings', 'two pointers'] },
  { contestId: 609, index: 'E', name: 'Minimum spanning tree for each edge', rating: 2000, tags: ['data structures', 'dfs and similar', 'dsu', 'graphs', 'trees'] },
  { contestId: 676, index: 'C', name: 'Vasya and String', rating: 1500, tags: ['binary search', 'dp', 'strings', 'two pointers'] },
  { contestId: 687, index: 'C', name: 'The Values You Can Make', rating: 1900, tags: ['dp'] },
  { contestId: 698, index: 'A', name: 'Vacations', rating: 1400, tags: ['dp'] },
  { contestId: 702, index: 'C', name: 'Cellular Network', rating: 1500, tags: ['binary search', 'two pointers'] },
  { contestId: 706, index: 'C', name: 'Hard problem', rating: 1600, tags: ['dp', 'strings'] },
  { contestId: 711, index: 'D', name: 'Directed Roads', rating: 1900, tags: ['combinatorics', 'dfs and similar', 'graphs', 'math'] },
  { contestId: 803, index: 'F', name: 'Coprime Subsequences', rating: 2000, tags: ['bitmasks', 'combinatorics', 'math', 'number theory'] },
  { contestId: 915, index: 'D', name: 'Almost Acyclic Graph', rating: 1900, tags: ['dfs and similar', 'graphs'] },
  { contestId: 977, index: 'D', name: 'Divide by three, multiply by two', rating: 1400, tags: ['dfs and similar', 'graphs', 'math', 'sortings'] },
  { contestId: 977, index: 'E', name: 'Cyclic Components', rating: 1500, tags: ['dfs and similar', 'dsu', 'graphs'] },
  { contestId: 1000, index: 'E', name: 'We Need More Bosses', rating: 1900, tags: ['dfs and similar', 'graphs', 'trees'] },
  { contestId: 1037, index: 'C', name: 'Equalize', rating: 1300, tags: ['dp', 'greedy', 'strings'] },
  { contestId: 1037, index: 'D', name: 'Valid BFS?', rating: 1700, tags: ['dfs and similar', 'graphs', 'shortest paths', 'trees'] },
  { contestId: 1083, index: 'A', name: 'The Fair Nut and the Best Path', rating: 2000, tags: ['dp', 'trees'] },
  { contestId: 1156, index: 'C', name: 'Match Points', rating: 1900, tags: ['binary search', 'greedy', 'sortings', 'two pointers'] },
  { contestId: 1195, index: 'C', name: 'Basketball Exercise', rating: 1400, tags: ['dp'] },
  { contestId: 1208, index: 'D', name: 'Restore Permutation', rating: 1900, tags: ['binary search', 'data structures', 'greedy'] },
  { contestId: 1272, index: 'D', name: 'Remove One Element', rating: 1500, tags: ['brute force', 'dp'] },
  { contestId: 1288, index: 'D', name: 'Minimax Problem', rating: 2000, tags: ['binary search', 'bitmasks', 'dp'] },
  { contestId: 1324, index: 'D', name: 'Pair of Topics', rating: 1400, tags: ['binary search', 'data structures', 'sortings', 'two pointers'] },
  { contestId: 1324, index: 'F', name: 'Maximum White Subtree', rating: 2000, tags: ['dfs and similar', 'dp', 'graphs', 'trees'] },
  { contestId: 1328, index: 'B', name: 'K-th Beautiful String', rating: 1300, tags: ['binary search', 'brute force', 'combinatorics', 'implementation', 'math'] },
  { contestId: 1336, index: 'A', name: 'Linova and Kingdom', rating: 1600, tags: ['dfs and similar', 'dp', 'greedy', 'sortings', 'trees'] },
  { contestId: 1343, index: 'C', name: 'Alternating Subsequence', rating: 1200, tags: ['dp', 'greedy', 'two pointers'] },
  { contestId: 1352, index: 'C', name: 'K-th Not Divisible by n', rating: 1200, tags: ['binary search', 'math'] },
  { contestId: 1352, index: 'E', name: 'Special Elements', rating: 1500, tags: ['brute force', 'implementation', 'two pointers'] },
  { contestId: 1359, index: 'D', name: 'Yet Another Yet Another Task', rating: 1900, tags: ['data structures', 'dp', 'implementation', 'two pointers'] },
  { contestId: 1360, index: 'D', name: 'Buying Shovels', rating: 1300, tags: ['math', 'number theory'] },
  { contestId: 1363, index: 'B', name: 'Subsequence Hate', rating: 1400, tags: ['dp', 'implementation', 'strings'] },
  { contestId: 1365, index: 'D', name: 'Solve The Maze', rating: 1700, tags: ['constructive algorithms', 'dfs and similar', 'dsu', 'graphs', 'greedy', 'shortest paths'] },
  { contestId: 1374, index: 'D', name: 'Zero Remainder Array', rating: 1400, tags: ['data structures', 'greedy', 'math', 'sortings'] },
  { contestId: 1389, index: 'B', name: 'Array Walk', rating: 1600, tags: ['brute force', 'dp', 'greedy'] },
  { contestId: 1398, index: 'C', name: 'Good Subarrays', rating: 1600, tags: ['data structures', 'dp', 'math'] },
  { contestId: 1409, index: 'E', name: 'Two Platforms', rating: 1900, tags: ['binary search', 'dp', 'sortings', 'two pointers'] },
  { contestId: 1475, index: 'E', name: 'Advertising Agency', rating: 1600, tags: ['combinatorics', 'math', 'sortings'] },
  { contestId: 1475, index: 'G', name: 'Strange Beauty', rating: 1900, tags: ['dp', 'math', 'number theory', 'sortings'] },
  { contestId: 1514, index: 'B', name: 'AND 0, Sum Big', rating: 1200, tags: ['bitmasks', 'combinatorics', 'math'] },
  { contestId: 1520, index: 'D', name: 'Same Differences', rating: 1200, tags: ['data structures', 'hashing', 'math'] },
  { contestId: 1526, index: 'B', name: 'I Hate 1111', rating: 1400, tags: ['dp', 'math', 'number theory'] },
  { contestId: 1526, index: 'C1', name: 'Potions (Easy Version)', rating: 1500, tags: ['data structures', 'dp', 'greedy'] },
  { contestId: 1526, index: 'C2', name: 'Potions (Hard Version)', rating: 1900, tags: ['data structures', 'greedy'] },
  { contestId: 1538, index: 'C', name: 'Number of Pairs', rating: 1300, tags: ['binary search', 'data structures', 'math', 'two pointers'] },
  { contestId: 1538, index: 'F', name: 'Interesting Function', rating: 1500, tags: ['binary search', 'dp', 'math', 'number theory'] },
  { contestId: 1618, index: 'D', name: 'Array and Operations', rating: 1300, tags: ['dp', 'greedy', 'math', 'sortings'] },
  { contestId: 1619, index: 'E', name: 'MEX and Increments', rating: 1900, tags: ['constructive algorithms', 'data structures', 'dp', 'greedy', 'math'] },
  { contestId: 1676, index: 'G', name: 'White-Black Balanced Subtrees', rating: 1300, tags: ['dfs and similar', 'dp', 'graphs', 'trees'] },
  { contestId: 1702, index: 'G2', name: 'Passable Paths (hard version)', rating: 2000, tags: ['data structures', 'dfs and similar', 'graphs', 'trees'] },
  { contestId: 1703, index: 'E', name: 'Mirror Grid', rating: 1200, tags: ['implementation'] },
  { contestId: 1742, index: 'E', name: 'Scuza', rating: 1200, tags: ['binary search', 'greedy', 'math'] },
  { contestId: 1791, index: 'E', name: 'Negatives and Positives', rating: 1200, tags: ['dp', 'greedy', 'sortings'] },
  { contestId: 1829, index: 'E', name: 'The Lakes', rating: 1200, tags: ['dfs and similar', 'dsu', 'graphs', 'implementation'] },
  { contestId: 1846, index: 'G', name: 'Rudolf and CodeVid-23', rating: 1900, tags: ['bitmasks', 'dp', 'graphs', 'shortest paths'] },
  { contestId: 1857, index: 'D', name: 'Strong Vertices', rating: 1300, tags: ['math', 'sortings', 'trees'] },
  { contestId: 1873, index: 'E', name: 'Building an Aquarium', rating: 1200, tags: ['binary search', 'sortings'] },
  { contestId: 1907, index: 'D', name: 'Jumping Through Segments', rating: 1400, tags: ['binary search', 'constructive algorithms'] },
  { contestId: 1915, index: 'E', name: 'Romantic Glasses', rating: 1300, tags: ['data structures', 'greedy', 'math'] },
  { contestId: 1921, index: 'F', name: 'Sum of Progression', rating: 1900, tags: ['brute force', 'data structures', 'dp', 'math'] },
  { contestId: 1926, index: 'C', name: 'Vlad and a Sum of Sum of Digits', rating: 1200, tags: ['dp', 'math'] },
  { contestId: 1931, index: 'D', name: 'Divisible Pairs', rating: 1300, tags: ['combinatorics', 'data structures', 'math', 'number theory'] },
  { contestId: 1974, index: 'C', name: 'Beautiful Triple Pairs', rating: 1400, tags: ['combinatorics', 'data structures', 'hashing'] },
  { contestId: 1985, index: 'F', name: 'Final Boss', rating: 1500, tags: ['binary search', 'data structures', 'greedy'] },
  { contestId: 1985, index: 'H1', name: 'Maximize the Largest Component (Easy Version)', rating: 2000, tags: ['brute force', 'dfs and similar', 'dsu', 'graphs'] },
  { contestId: 1999, index: 'E', name: 'Triple Operations', rating: 1300, tags: ['dp', 'implementation', 'math'] }
];

function generateFallbackProblemPool() {
  const pool = [...REAL_CF_PROBLEMS_SEED];
  const existingKeys = new Set(pool.map((p) => `${p.contestId}-${p.index}`));

  const topicTemplates = [
    { suffix: 'Subarray DP Transitions', tags: ['dp', 'implementation'] },
    { suffix: 'Tree Connected Components', tags: ['trees', 'dfs and similar', 'graphs'] },
    { suffix: 'Monotonic Predicate Search', tags: ['binary search', 'two pointers'] },
    { suffix: 'Segment & Priority Queue', tags: ['data structures', 'sortings', 'hashing'] },
    { suffix: 'Modular GCD & Combinatorics', tags: ['number theory', 'math', 'combinatorics'] },
    { suffix: 'Optimal Invariant Construction', tags: ['greedy', 'constructive algorithms'] }
  ];

  const indices = ['B', 'C', 'D', 'E', 'F', 'C2', 'D2', 'G'];

  for (let dayIdx = 0; dayIdx < 120; dayIdx++) {
    const baseContestId = 400 + Math.floor((dayIdx / 120) * 1640);
    ALL_CHALLENGE_RATINGS.forEach((rating, rIdx) => {
      const contestId = baseContestId + rIdx;
      const index = indices[(dayIdx + rIdx) % indices.length];
      const key = `${contestId}-${index}`;
      if (!existingKeys.has(key)) {
        const tmpl = topicTemplates[(dayIdx * 5 + rIdx) % topicTemplates.length];
        pool.push({
          contestId,
          index,
          name: `CF #${contestId}${index} — ${tmpl.suffix}`,
          rating,
          tags: tmpl.tags
        });
        existingKeys.add(key);
      }
    });
  }
  return pool;
}

// ============================================================================
// CHRONOLOGICAL (CONTEST >= 400 -> RECENT) + 3-TIER RATING ESCALATION BUILDER
// ============================================================================

function buildChronologicalMixedCurriculum(rawProblems, mixStrategy = 'contest_mixed') {
  const validProblems = rawProblems.filter(
    (p) =>
      p &&
      typeof p.contestId === 'number' &&
      p.contestId >= 400 &&
      ALL_CHALLENGE_RATINGS.includes(p.rating) &&
      Array.isArray(p.tags) &&
      p.tags.length > 0
  );

  // Sort strictly ascending by contestId (400 -> 2050+)
  const byRating = {};
  ALL_CHALLENGE_RATINGS.forEach((r) => {
    byRating[r] = validProblems
      .filter((p) => p.rating === r)
      .sort((a, b) => {
        if (a.contestId !== b.contestId) return a.contestId - b.contestId;
        return String(a.index).localeCompare(String(b.index));
      });
  });

  const usedProblemIds = new Set();
  const days = [];

  for (let dayNumber = 1; dayNumber <= 100; dayNumber++) {
    const phaseObj =
      CURRICULUM_PHASES.find((ph) => dayNumber >= ph.dayStart && dayNumber <= ph.dayEnd) ||
      CURRICULUM_PHASES[0];

    const dayProblems = [];
    const usedTagsToday = new Set();

    // STRICT DYNAMIC RATING ESCALATION PER DAY:
    // Day 1-30:  [1200, 1300, 1400, 1500, 1600, 1700]
    // Day 31-60: [1300, 1400, 1500, 1600, 1700, 1900]
    // Day 61-100:[1400, 1500, 1600, 1700, 1900, 2000]
    const dayRatings = getRatingsForDay(dayNumber);
    const tierInfo = getTierInfoForDay(dayNumber);

    const progressStart = (dayNumber - 1) / 100;
    const progressEnd = Math.min(1, (dayNumber + 2.5) / 100);

    dayRatings.forEach((rating, slotIdx) => {
      const pool = byRating[rating] || [];
      const totalInPool = pool.length;

      const targetArchetype =
        mixStrategy === 'progressive_phase'
          ? DAILY_ARCHETYPES[(phaseObj.phase + slotIdx) % DAILY_ARCHETYPES.length]
          : DAILY_ARCHETYPES[(dayNumber * 5 + slotIdx) % DAILY_ARCHETYPES.length];

      const startIdx = Math.floor(progressStart * totalInPool);
      const endIdx = Math.max(startIdx + 12, Math.floor(progressEnd * totalInPool));

      let chosen = null;

      for (let i = startIdx; i < Math.min(endIdx, totalInPool); i++) {
        const cand = pool[i];
        const id = `${cand.contestId}-${cand.index}`;
        if (usedProblemIds.has(id)) continue;

        const matchesArchetype = cand.tags.some((t) => targetArchetype.tags.includes(t));
        const primaryTag = cand.tags[0];
        if (matchesArchetype && !usedTagsToday.has(primaryTag)) {
          chosen = cand;
          break;
        }
      }

      if (!chosen) {
        const widerEnd = Math.min(totalInPool, endIdx + 35);
        for (let i = startIdx; i < widerEnd; i++) {
          const cand = pool[i];
          const id = `${cand.contestId}-${cand.index}`;
          if (usedProblemIds.has(id)) continue;
          if (cand.tags.some((t) => targetArchetype.tags.includes(t))) {
            chosen = cand;
            break;
          }
        }
      }

      if (!chosen) {
        for (let i = startIdx; i < totalInPool; i++) {
          const cand = pool[i];
          const id = `${cand.contestId}-${cand.index}`;
          if (!usedProblemIds.has(id)) {
            chosen = cand;
            break;
          }
        }
      }

      if (!chosen) {
        chosen = pool.find((cand) => !usedProblemIds.has(`${cand.contestId}-${cand.index}`));
      }

      if (chosen) {
        const canonicalId = `${chosen.contestId}-${chosen.index}`;
        usedProblemIds.add(canonicalId);
        if (chosen.tags[0]) usedTagsToday.add(chosen.tags[0]);

        dayProblems.push({
          id: canonicalId,
          contestId: chosen.contestId,
          index: chosen.index,
          name: chosen.name,
          rating: chosen.rating,
          tags: chosen.tags,
          archetype: targetArchetype.shortName,
          archetypeColor: targetArchetype.color,
          url: `https://codeforces.com/problemset/problem/${chosen.contestId}/${chosen.index}`,
          dayNumber
        });
      }
    });

    const contestIds = dayProblems.map((p) => p.contestId);
    const minContest = contestIds.length ? Math.min(...contestIds) : 400;
    const maxContest = contestIds.length ? Math.max(...contestIds) : 400;

    days.push({
      dayNumber,
      phase: phaseObj.phase,
      phaseName: phaseObj.name,
      contestEra: phaseObj.contestEra,
      contestRangeLabel: `CF #${minContest} – #${maxContest}`,
      minContest,
      maxContest,
      dayRatings,
      tierInfo,
      primaryTopic: `Mixed DSA Gauntlet (${tierInfo.rangeLabel})`,
      secondaryTopics: DAILY_ARCHETYPES.map((a) => a.shortName),
      problems: dayProblems
    });
  }

  return days;
}

// ============================================================================
// LOCAL STORAGE HELPERS
// ============================================================================

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    // Ignore storage quota errors
  }
}

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  const [activeTab, setActiveTab] = useState(() => loadFromStorage('active_tab', 'dashboard'));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [blindMode, setBlindMode] = useState(() => loadFromStorage('blind_mode', true));
  const [revealedTagsMap, setRevealedTagsMap] = useState({});
  const [lastSavedPulse, setLastSavedPulse] = useState(null);

  // Connected User Handle & Profile Namespace
  const [connectedHandle, setConnectedHandle] = useState(() =>
    loadFromStorage('connected_handle', '')
  );
  const [savedProfilesList, setSavedProfilesList] = useState(() =>
    loadFromStorage('saved_profiles_list', ['local_default'])
  );
  const [handleInput, setHandleInput] = useState('');
  const [lookupHandleInput, setLookupHandleInput] = useState('');
  const [publicLookupData, setPublicLookupData] = useState(null);
  const [isLookingUpPublic, setIsLookingUpPublic] = useState(false);

  const profileStorageKey = useMemo(
    () => (connectedHandle ? `user_${connectedHandle.toLowerCase()}` : 'user_default'),
    [connectedHandle]
  );

  // Sequential Day-by-Day Pointer (Starts at Day 1, advances when Day N is completed)
  const [activeChallengeDay, setActiveChallengeDay] = useState(() =>
    loadFromStorage(`${profileStorageKey}_active_day`, 1)
  );
  const [selectedDayView, setSelectedDayView] = useState(() =>
    loadFromStorage(`${profileStorageKey}_active_day`, 1)
  );

  const [completedDaysMap, setCompletedDaysMap] = useState(() =>
    loadFromStorage(`${profileStorageKey}_completed_days`, {})
  );

  const [problemProgressMap, setProblemProgressMap] = useState(() =>
    loadFromStorage(`${profileStorageKey}_problem_progress`, {})
  );

  const [journalEntries, setJournalEntries] = useState(() =>
    loadFromStorage(`${profileStorageKey}_journal`, {})
  );

  const [settings, setSettings] = useState(() =>
    loadFromStorage('global_settings', {
      countPreExistingSolves: true,
      autoAdvanceOnSixSolved: true,
      mixStrategy: 'contest_mixed',
      isChallengePaused: false,
      startDate: new Date().toISOString().split('T')[0]
    })
  );

  // Codeforces API Data State
  const [cfProblemPool, setCfProblemPool] = useState(() => generateFallbackProblemPool());
  const [isPoolLive, setIsPoolLive] = useState(false);
  const [cfUserProfile, setCfUserProfile] = useState(() =>
    loadFromStorage(`${profileStorageKey}_cf_profile`, null)
  );
  const [cfRatingHistory, setCfRatingHistory] = useState(() =>
    loadFromStorage(`${profileStorageKey}_cf_rating`, [])
  );
  const [cfSubmissions, setCfSubmissions] = useState(() =>
    loadFromStorage(`${profileStorageKey}_cf_submissions`, [])
  );
  const [lastSyncedAt, setLastSyncedAt] = useState(() =>
    loadFromStorage(`${profileStorageKey}_last_synced`, null)
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  // Dashboard Heatmap State
  const [heatmapMode, setHeatmapMode] = useState('challenge'); // 'challenge' (10x10 Matrix) | 'overall' (24-Week CF Calendar)
  const [selectedHeatmapDayNum, setSelectedHeatmapDayNum] = useState(1);
  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState(null);

  // Modals: Personal Note Editor & Accepted Submission Telemetry Inspector
  const [editingNoteProblem, setEditingNoteProblem] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [inspectingSubmissionProb, setInspectingSubmissionProb] = useState(null);

  // Reload user-scoped state when switching handles
  useEffect(() => {
    const savedActiveDay = loadFromStorage(`${profileStorageKey}_active_day`, 1);
    setActiveChallengeDay(savedActiveDay);
    setSelectedDayView(savedActiveDay);
    setSelectedHeatmapDayNum(savedActiveDay);
    setCompletedDaysMap(loadFromStorage(`${profileStorageKey}_completed_days`, {}));
    setProblemProgressMap(loadFromStorage(`${profileStorageKey}_problem_progress`, {}));
    setJournalEntries(loadFromStorage(`${profileStorageKey}_journal`, {}));
    setCfUserProfile(loadFromStorage(`${profileStorageKey}_cf_profile`, null));
    setCfRatingHistory(loadFromStorage(`${profileStorageKey}_cf_rating`, []));
    setCfSubmissions(loadFromStorage(`${profileStorageKey}_cf_submissions`, []));
    setLastSyncedAt(loadFromStorage(`${profileStorageKey}_last_synced`, null));
  }, [profileStorageKey]);

  // Persist user-scoped states to localStorage automatically
  useEffect(() => {
    saveToStorage('active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    saveToStorage('blind_mode', blindMode);
  }, [blindMode]);

  useEffect(() => {
    saveToStorage('connected_handle', connectedHandle);
    if (connectedHandle && !savedProfilesList.includes(connectedHandle)) {
      const updated = [...savedProfilesList, connectedHandle];
      setSavedProfilesList(updated);
      saveToStorage('saved_profiles_list', updated);
    }
  }, [connectedHandle, savedProfilesList]);

  useEffect(() => {
    saveToStorage(`${profileStorageKey}_active_day`, activeChallengeDay);
    setLastSavedPulse(Date.now());
  }, [profileStorageKey, activeChallengeDay]);

  useEffect(() => {
    saveToStorage(`${profileStorageKey}_completed_days`, completedDaysMap);
    setLastSavedPulse(Date.now());
  }, [profileStorageKey, completedDaysMap]);

  useEffect(() => {
    saveToStorage(`${profileStorageKey}_problem_progress`, problemProgressMap);
    setLastSavedPulse(Date.now());
  }, [profileStorageKey, problemProgressMap]);

  useEffect(() => {
    saveToStorage(`${profileStorageKey}_journal`, journalEntries);
    setLastSavedPulse(Date.now());
  }, [profileStorageKey, journalEntries]);

  useEffect(() => {
    saveToStorage('global_settings', settings);
  }, [settings]);

  // Fetch Official Codeforces Problemset (contestId >= 400) once on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchOfficialProblemset() {
      try {
        const res = await fetch('https://codeforces.com/api/problemset.problems');
        if (!res.ok) return;
        const data = await res.json();
        if (
          !cancelled &&
          data.status === 'OK' &&
          data.result &&
          Array.isArray(data.result.problems)
        ) {
          const filtered = data.result.problems.filter(
            (p) =>
              p.contestId >= 400 &&
              ALL_CHALLENGE_RATINGS.includes(p.rating) &&
              Array.isArray(p.tags) &&
              p.tags.length > 0
          );
          if (filtered.length >= 600) {
            setCfProblemPool(filtered);
            setIsPoolLive(true);
          }
        }
      } catch (err) {
        // Keep verified fallback pool with contestId >= 400
      }
    }
    fetchOfficialProblemset();
    return () => {
      cancelled = true;
    };
  }, []);

  // Build the 100-Day Chronological Mixed-Topic Curriculum with 3-Tier Rating Escalation
  const curriculumDays = useMemo(
    () => buildChronologicalMixedCurriculum(cfProblemPool, settings.mixStrategy),
    [cfProblemPool, settings.mixStrategy]
  );

  // Parse Codeforces Submissions into Accepted & Attempted canonical ID maps
  const cfSubmissionAnalysis = useMemo(() => {
    const acceptedById = {};
    const attemptedById = {};
    const allAcceptedProblemsList = [];
    const startTs = settings.startDate
      ? Math.floor(new Date(settings.startDate).getTime() / 1000)
      : 0;

    cfSubmissions.forEach((sub) => {
      if (!sub.problem || !sub.problem.contestId || !sub.problem.index) return;
      const pid = `${sub.problem.contestId}-${sub.problem.index}`;
      if (sub.verdict === 'OK') {
        if (
          !acceptedById[pid] ||
          sub.creationTimeSeconds < acceptedById[pid].creationTimeSeconds
        ) {
          acceptedById[pid] = {
            submissionId: sub.id,
            creationTimeSeconds: sub.creationTimeSeconds,
            programmingLanguage: sub.programmingLanguage,
            timeConsumedMillis: sub.timeConsumedMillis,
            memoryConsumedBytes: sub.memoryConsumedBytes,
            problem: sub.problem,
            isFreshDuringChallenge: sub.creationTimeSeconds >= startTs
          };
        }
      } else {
        attemptedById[pid] = true;
      }
    });

    Object.entries(acceptedById).forEach(([pid, record]) => {
      allAcceptedProblemsList.push({
        id: pid,
        contestId: record.problem.contestId,
        index: record.problem.index,
        name: record.problem.name,
        rating: record.problem.rating || 0,
        tags: record.problem.tags || [],
        ...record
      });
    });

    return { acceptedById, attemptedById, allAcceptedProblemsList };
  }, [cfSubmissions, settings.startDate]);

  // Helper: Get Effective Status & Metadata for any problem ID
  const getProblemEffectiveState = useCallback(
    (problemId) => {
      const localRecord = problemProgressMap[problemId] || {};
      const cfAccepted = cfSubmissionAnalysis.acceptedById[problemId];
      const cfAttempted = cfSubmissionAnalysis.attemptedById[problemId];

      let status = 'NOT_STARTED';
      let isVerifiedCF = false;

      const qualifiesAsCFSolve =
        cfAccepted &&
        (settings.countPreExistingSolves || cfAccepted.isFreshDuringChallenge);

      if (qualifiesAsCFSolve) {
        status = 'SOLVED';
        isVerifiedCF = true;
      } else if (localRecord.manuallyOverridden && localRecord.status) {
        status = localRecord.status;
      } else if (cfAttempted) {
        status = 'ATTEMPTED';
      } else if (localRecord.status) {
        status = localRecord.status;
      }

      return {
        status,
        isVerifiedCF,
        manuallyOverridden: Boolean(localRecord.manuallyOverridden && !qualifiesAsCFSolve),
        isBookmarked: Boolean(localRecord.isBookmarked),
        needsRevision: Boolean(localRecord.needsRevision),
        notes: localRecord.notes || '',
        revisionInterval: localRecord.revisionInterval || null,
        nextRevisionAt: localRecord.nextRevisionAt || null,
        cfSubmission: cfAccepted || null,
        solvedAt: cfAccepted
          ? cfAccepted.creationTimeSeconds * 1000
          : localRecord.solvedAt || null
      };
    },
    [problemProgressMap, cfSubmissionAnalysis, settings.countPreExistingSolves]
  );

  // Enrich all 100 Days with live solving status & completion state
  const enrichedDays = useMemo(() => {
    return curriculumDays.map((day) => {
      const problemsWithState = day.problems.map((p) => ({
        ...p,
        state: getProblemEffectiveState(p.id)
      }));
      const solvedCount = problemsWithState.filter((p) => p.state.status === 'SOLVED').length;
      const attemptedCount = problemsWithState.filter(
        (p) => p.state.status === 'ATTEMPTED'
      ).length;
      const hasBookmarked = problemsWithState.some((p) => p.state.isBookmarked);
      const hasRevision = problemsWithState.some(
        (p) => p.state.needsRevision || p.state.revisionInterval
      );
      const isManuallyCompleted = Boolean(completedDaysMap[day.dayNumber]);
      const isAllSixSolved = solvedCount === 6;
      const isCompleted = isAllSixSolved || isManuallyCompleted;

      return {
        ...day,
        problems: problemsWithState,
        solvedCount,
        attemptedCount,
        hasBookmarked,
        hasRevision,
        isAllSixSolved,
        isManuallyCompleted,
        isCompleted
      };
    });
  }, [curriculumDays, getProblemEffectiveState, completedDaysMap]);

  // Automatic Day Completion when all 6 problems on activeChallengeDay become SOLVED
  useEffect(() => {
    if (!settings.autoAdvanceOnSixSolved || settings.isChallengePaused) return;
    const currentDayObj = enrichedDays.find((d) => d.dayNumber === activeChallengeDay);
    if (currentDayObj && currentDayObj.isAllSixSolved && activeChallengeDay < 100) {
      if (!completedDaysMap[activeChallengeDay]) {
        setCompletedDaysMap((prev) => ({
          ...prev,
          [activeChallengeDay]: { completedAt: Date.now(), autoCompleted: true }
        }));
      }
    }
  }, [
    enrichedDays,
    activeChallengeDay,
    settings.autoAdvanceOnSixSolved,
    settings.isChallengePaused,
    completedDaysMap
  ]);

  // Action: Toggle / Update Problem Status by ID in localStorage
  const handleProblemStatusChange = (problemId, newStatus) => {
    setProblemProgressMap((prev) => {
      const existing = prev[problemId] || {};
      return {
        ...prev,
        [problemId]: {
          ...existing,
          status: newStatus,
          manuallyOverridden: true,
          solvedAt: newStatus === 'SOLVED' ? existing.solvedAt || Date.now() : null
        }
      };
    });
  };

  // Action: Toggle Bookmark by Problem ID
  const handleToggleBookmark = (problemId) => {
    setProblemProgressMap((prev) => {
      const existing = prev[problemId] || {};
      return {
        ...prev,
        [problemId]: {
          ...existing,
          isBookmarked: !existing.isBookmarked
        }
      };
    });
  };

  // Action: Toggle Needs Revision Flag
  const handleToggleNeedsRevision = (problemId) => {
    setProblemProgressMap((prev) => {
      const existing = prev[problemId] || {};
      return {
        ...prev,
        [problemId]: {
          ...existing,
          needsRevision: !existing.needsRevision
        }
      };
    });
  };

  // Action: Set Spaced Repetition Interval (1, 3, 7, 14, 30 days)
  const handleSetRevisionInterval = (problemId, daysInterval) => {
    setProblemProgressMap((prev) => {
      const existing = prev[problemId] || {};
      const nextDate = daysInterval
        ? Date.now() + daysInterval * 24 * 60 * 60 * 1000
        : null;
      return {
        ...prev,
        [problemId]: {
          ...existing,
          needsRevision: Boolean(daysInterval),
          revisionInterval: daysInterval,
          nextRevisionAt: nextDate
        }
      };
    });
  };

  // Action: Save Personal Note for Problem ID
  const handleSaveProblemNote = () => {
    if (!editingNoteProblem) return;
    const pid = editingNoteProblem.id;
    setProblemProgressMap((prev) => {
      const existing = prev[pid] || {};
      return {
        ...prev,
        [pid]: {
          ...existing,
          notes: noteDraft
        }
      };
    });
    setEditingNoteProblem(null);
  };

  // Action: Tick Day Complete & Move to Next Day (Day N -> Day N+1)
  const handleCompleteDayAndAdvance = (dayNum, markAllSixSolved = false) => {
    const targetDay = enrichedDays.find((d) => d.dayNumber === dayNum);
    if (markAllSixSolved && targetDay) {
      setProblemProgressMap((prev) => {
        const next = { ...prev };
        targetDay.problems.forEach((p) => {
          const existing = next[p.id] || {};
          if (existing.status !== 'SOLVED') {
            next[p.id] = {
              ...existing,
              status: 'SOLVED',
              manuallyOverridden: true,
              solvedAt: existing.solvedAt || Date.now()
            };
          }
        });
        return next;
      });
    }

    setCompletedDaysMap((prev) => ({
      ...prev,
      [dayNum]: {
        completedAt: Date.now(),
        manualTick: true
      }
    }));

    const nextDay = Math.min(100, dayNum + 1);
    setActiveChallengeDay(nextDay);
    setSelectedDayView(nextDay);
    setSelectedHeatmapDayNum(nextDay);
  };

  // Action: Reopen a Completed Day
  const handleReopenDay = (dayNum) => {
    setCompletedDaysMap((prev) => {
      const next = { ...prev };
      delete next[dayNum];
      return next;
    });
    setActiveChallengeDay(dayNum);
    setSelectedDayView(dayNum);
    setSelectedHeatmapDayNum(dayNum);
  };

  // ============================================================================
  // CODEFORCES API SYNCHRONIZATION ENGINE
  // ============================================================================

  const syncCodeforcesAccount = useCallback(
    async (targetHandle) => {
      const cleanHandle = (targetHandle || connectedHandle || '').trim();
      if (!cleanHandle) return;

      setIsSyncing(true);
      setSyncError(null);

      try {
        const infoRes = await fetch(
          `https://codeforces.com/api/user.info?handles=${encodeURIComponent(cleanHandle)}`
        );
        const infoData = await infoRes.json();
        if (infoData.status !== 'OK' || !infoData.result?.[0]) {
          throw new Error(infoData.comment || 'Codeforces handle not found.');
        }
        const userObj = infoData.result[0];

        const ratingRes = await fetch(
          `https://codeforces.com/api/user.rating?handle=${encodeURIComponent(cleanHandle)}`
        );
        const ratingData = await ratingRes.json();
        const ratingsList = ratingData.status === 'OK' ? ratingData.result || [] : [];

        const statusRes = await fetch(
          `https://codeforces.com/api/user.status?handle=${encodeURIComponent(
            cleanHandle
          )}&from=1&count=5000`
        );
        const statusData = await statusRes.json();
        const submissionsList = statusData.status === 'OK' ? statusData.result || [] : [];

        const userKey = `user_${userObj.handle.toLowerCase()}`;
        const syncTimestamp = Date.now();

        setConnectedHandle(userObj.handle);
        setCfUserProfile(userObj);
        setCfRatingHistory(ratingsList);
        setCfSubmissions(submissionsList);
        setLastSyncedAt(syncTimestamp);

        saveToStorage(`${userKey}_cf_profile`, userObj);
        saveToStorage(`${userKey}_cf_rating`, ratingsList);
        saveToStorage(`${userKey}_cf_submissions`, submissionsList.slice(0, 2500));
        saveToStorage(`${userKey}_last_synced`, syncTimestamp);
      } catch (err) {
        setSyncError(err.message || 'Failed to synchronize with Codeforces API.');
      } finally {
        setIsSyncing(false);
      }
    },
    [connectedHandle]
  );

  // Public Profile Lookup (Isolated from private planner progress)
  const handlePublicLookup = async (e) => {
    if (e) e.preventDefault();
    const clean = lookupHandleInput.trim();
    if (!clean) return;
    setIsLookingUpPublic(true);
    setPublicLookupData(null);
    try {
      const [infoRes, ratingRes, subRes] = await Promise.all([
        fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(clean)}`),
        fetch(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(clean)}`),
        fetch(
          `https://codeforces.com/api/user.status?handle=${encodeURIComponent(
            clean
          )}&from=1&count=1000`
        )
      ]);
      const infoJson = await infoRes.json();
      const ratingJson = await ratingRes.json();
      const subJson = await subRes.json();
      if (infoJson.status !== 'OK' || !infoJson.result?.[0]) {
        throw new Error(infoJson.comment || 'Public handle not found');
      }
      const uniqueSolved = new Set();
      (subJson.result || []).forEach((s) => {
        if (s.verdict === 'OK' && s.problem) {
          uniqueSolved.add(`${s.problem.contestId}-${s.problem.index}`);
        }
      });
      setPublicLookupData({
        profile: infoJson.result[0],
        contestsCount: (ratingJson.result || []).length,
        solvedCount: uniqueSolved.size
      });
    } catch (err) {
      setPublicLookupData({ error: err.message });
    } finally {
      setIsLookingUpPublic(false);
    }
  };

  // ============================================================================
  // AGGREGATE CHALLENGE & CODEFORCES ANALYTICS
  // ============================================================================

  const challengeStats = useMemo(() => {
    let totalSolvedInChallenge = 0;
    let totalAttemptedInChallenge = 0;
    let totalBookmarked = 0;
    let totalNotes = 0;
    let completedDaysCount = 0;
    let tier1Solved = 0;
    let tier2Solved = 0;
    let tier3Solved = 0;
    const solvedByRating = {
      1200: 0,
      1300: 0,
      1400: 0,
      1500: 0,
      1600: 0,
      1700: 0,
      1900: 0,
      2000: 0
    };

    enrichedDays.forEach((d) => {
      if (d.isCompleted) completedDaysCount++;
      d.problems.forEach((p) => {
        if (p.state.status === 'SOLVED') {
          totalSolvedInChallenge++;
          solvedByRating[p.rating] = (solvedByRating[p.rating] || 0) + 1;
          if (d.dayNumber <= 30) tier1Solved++;
          else if (d.dayNumber <= 60) tier2Solved++;
          else tier3Solved++;
        } else if (p.state.status === 'ATTEMPTED') {
          totalAttemptedInChallenge++;
        }
        if (p.state.isBookmarked) totalBookmarked++;
        if (p.state.notes && p.state.notes.trim().length > 0) totalNotes++;
      });
    });

    let currentDayStreak = 0;
    let longestDayStreak = 0;
    let running = 0;
    for (let i = 0; i < enrichedDays.length; i++) {
      if (enrichedDays[i].isCompleted) {
        running++;
        if (running > longestDayStreak) longestDayStreak = running;
      } else {
        if (enrichedDays[i].dayNumber < activeChallengeDay) {
          running = 0;
        }
      }
    }
    currentDayStreak = running;

    return {
      totalSolvedInChallenge,
      totalAttemptedInChallenge,
      remainingProblems: 600 - totalSolvedInChallenge,
      completionPercentage: ((totalSolvedInChallenge / 600) * 100).toFixed(1),
      completedDaysCount,
      consecutiveDaysStreak: currentDayStreak,
      longestDayStreak: Math.max(longestDayStreak, currentDayStreak),
      totalBookmarked,
      totalNotes,
      solvedByRating,
      tier1Solved,
      tier2Solved,
      tier3Solved
    };
  }, [enrichedDays, activeChallengeDay]);

  // Codeforces Overall Intelligence
  const cfIntelligence = useMemo(() => {
    const ratingBuckets = [
      { label: '<800', min: 0, max: 799, count: 0, problems: [] },
      { label: '800–999', min: 800, max: 999, count: 0, problems: [] },
      { label: '1000–1199', min: 1000, max: 1199, count: 0, problems: [] },
      { label: '1200–1399', min: 1200, max: 1399, count: 0, problems: [] },
      { label: '1400–1599', min: 1400, max: 1599, count: 0, problems: [] },
      { label: '1600–1799', min: 1600, max: 1799, count: 0, problems: [] },
      { label: '1800–1999', min: 1800, max: 1999, count: 0, problems: [] },
      { label: '2000–2199', min: 2000, max: 2199, count: 0, problems: [] },
      { label: '2200+', min: 2200, max: 5000, count: 0, problems: [] }
    ];

    const topicCounts = {};
    const topicProblemsMap = {};
    const topicFailedAttempts = {};

    const combinedSolvedMap = new Map();
    cfSubmissionAnalysis.allAcceptedProblemsList.forEach((p) => {
      combinedSolvedMap.set(p.id, p);
    });
    enrichedDays.forEach((d) => {
      d.problems.forEach((p) => {
        if (p.state.status === 'SOLVED' && !combinedSolvedMap.has(p.id)) {
          combinedSolvedMap.set(p.id, {
            id: p.id,
            contestId: p.contestId,
            index: p.index,
            name: p.name,
            rating: p.rating,
            tags: p.tags,
            creationTimeSeconds: p.state.solvedAt
              ? Math.floor(p.state.solvedAt / 1000)
              : Math.floor(Date.now() / 1000)
          });
        }
      });
    });

    combinedSolvedMap.forEach((prob) => {
      const r = prob.rating || 0;
      if (r > 0) {
        const bucket = ratingBuckets.find((b) => r >= b.min && r <= b.max);
        if (bucket) {
          bucket.count++;
          bucket.problems.push(prob);
        }
      }
      (prob.tags || []).forEach((tag) => {
        topicCounts[tag] = (topicCounts[tag] || 0) + 1;
        if (!topicProblemsMap[tag]) topicProblemsMap[tag] = [];
        topicProblemsMap[tag].push(prob);
      });
    });

    const sortedTopics = Object.entries(topicCounts)
      .map(([tag, count]) => ({ tag, count, problems: topicProblemsMap[tag] || [] }))
      .sort((a, b) => b.count - a.count);

    const verdictCounts = {
      OK: 0,
      WRONG_ANSWER: 0,
      TIME_LIMIT_EXCEEDED: 0,
      RUNTIME_ERROR: 0,
      MEMORY_LIMIT_EXCEEDED: 0,
      COMPILATION_ERROR: 0,
      OTHER: 0
    };
    const languageCounts = {};
    const hourlyActivity = Array.from({ length: 24 }, (_, h) => ({
      hour: `${String(h).padStart(2, '0')}:00`,
      count: 0
    }));
    let weekendSolves = 0;
    let weekdaySolves = 0;

    const dateDetailsMap = {};
    const ensureDateRecord = (dStr) => {
      if (!dateDetailsMap[dStr]) {
        dateDetailsMap[dStr] = {
          date: dStr,
          solvedCount: 0,
          submissionsCount: 0,
          attemptedCount: 0,
          challengeCompletedCount: 0,
          problems: []
        };
      }
      return dateDetailsMap[dStr];
    };

    cfSubmissions.forEach((s) => {
      const v = s.verdict || 'OTHER';
      if (verdictCounts[v] !== undefined) verdictCounts[v]++;
      else verdictCounts.OTHER++;

      if (s.programmingLanguage) {
        languageCounts[s.programmingLanguage] =
          (languageCounts[s.programmingLanguage] || 0) + 1;
      }

      if (s.creationTimeSeconds) {
        const dt = new Date(s.creationTimeSeconds * 1000);
        const hr = dt.getHours();
        if (hourlyActivity[hr]) hourlyActivity[hr].count++;

        const dStr = dt.toISOString().split('T')[0];
        const rec = ensureDateRecord(dStr);
        rec.submissionsCount++;
        if (v !== 'OK') {
          rec.attemptedCount++;
          (s.problem?.tags || []).forEach((t) => {
            topicFailedAttempts[t] = (topicFailedAttempts[t] || 0) + 1;
          });
        }
      }
    });

    combinedSolvedMap.forEach((prob) => {
      if (prob.creationTimeSeconds) {
        const dt = new Date(prob.creationTimeSeconds * 1000);
        const dayOfWeek = dt.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) weekendSolves++;
        else weekdaySolves++;

        const dateStr = dt.toISOString().split('T')[0];
        const rec = ensureDateRecord(dateStr);
        rec.solvedCount++;
        rec.problems.push(prob);
      }
    });

    enrichedDays.forEach((d) => {
      d.problems.forEach((p) => {
        if (p.state.status === 'SOLVED' && p.state.solvedAt) {
          const dStr = new Date(p.state.solvedAt).toISOString().split('T')[0];
          const rec = ensureDateRecord(dStr);
          rec.challengeCompletedCount++;
        }
      });
    });

    const totalSubs = cfSubmissions.length;
    const acceptanceRate =
      totalSubs > 0 ? ((verdictCounts.OK / totalSubs) * 100).toFixed(1) : '0.0';

    const mostCommonFailure =
      Object.entries(verdictCounts)
        .filter(([k]) => k !== 'OK')
        .sort((a, b) => b[1] - a[1])[0] || ['WRONG_ANSWER', 0];

    let bestRank = Infinity;
    let worstRank = 0;
    let totalDelta = 0;
    cfRatingHistory.forEach((c) => {
      if (c.rank < bestRank) bestRank = c.rank;
      if (c.rank > worstRank) worstRank = c.rank;
      totalDelta += c.newRating - c.oldRating;
    });
    const avgRatingChange =
      cfRatingHistory.length > 0 ? (totalDelta / cfRatingHistory.length).toFixed(1) : '0.0';

    return {
      totalOverallSolved: combinedSolvedMap.size,
      ratingBuckets,
      sortedTopics,
      topicCounts,
      topicFailedAttempts,
      verdictCounts,
      languageCounts,
      hourlyActivity,
      totalSubs,
      acceptanceRate,
      mostCommonFailure,
      weekendSolves,
      weekdaySolves,
      dateDetailsMap,
      contestStats: {
        totalContests: cfRatingHistory.length,
        bestRank: bestRank === Infinity ? '—' : bestRank,
        worstRank: worstRank === 0 ? '—' : worstRank,
        avgRatingChange
      }
    };
  }, [cfSubmissionAnalysis, enrichedDays, cfSubmissions, cfRatingHistory]);

  const currentActiveDayObj = useMemo(
    () =>
      enrichedDays.find((d) => d.dayNumber === activeChallengeDay) || enrichedDays[0],
    [enrichedDays, activeChallengeDay]
  );

  const selectedDayObj = useMemo(
    () =>
      enrichedDays.find((d) => d.dayNumber === selectedDayView) || currentActiveDayObj,
    [enrichedDays, selectedDayView, currentActiveDayObj]
  );

  // Build 24-Week Compact GitHub-Style Calendar Matrix
  const calendarWeeksMatrix = useMemo(() => {
    const weeks = [];
    const today = new Date();
    const totalDays = 24 * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (totalDays - 1));

    let currentWeek = [];
    let activeDaysInWindow = 0;
    let peakDay = { date: '—', count: 0 };

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const monthShort = d.toLocaleString('en-US', { month: 'short' });
      const rec = cfIntelligence.dateDetailsMap[dateStr] || {
        date: dateStr,
        solvedCount: 0,
        submissionsCount: 0,
        attemptedCount: 0,
        challengeCompletedCount: 0,
        problems: []
      };
      const totalActivity = rec.solvedCount + rec.challengeCompletedCount;
      if (totalActivity > 0) activeDaysInWindow++;
      if (totalActivity > peakDay.count) {
        peakDay = { date: dateStr, count: totalActivity };
      }

      currentWeek.push({
        ...rec,
        monthShort,
        dayOfWeek: d.getDay(),
        value: rec.solvedCount || rec.challengeCompletedCount
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    return { weeks, activeDaysInWindow, peakDay };
  }, [cfIntelligence.dateDetailsMap]);

  const inspectedHeatmapDayObj = useMemo(
    () =>
      enrichedDays.find((d) => d.dayNumber === (selectedHeatmapDayNum || activeChallengeDay)) ||
      currentActiveDayObj,
    [enrichedDays, selectedHeatmapDayNum, activeChallengeDay, currentActiveDayObj]
  );

  // Export / Import Backup JSON
  const handleExportProgress = () => {
    const payload = {
      version: 6,
      exportedAt: new Date().toISOString(),
      connectedHandle,
      activeChallengeDay,
      completedDaysMap,
      problemProgressMap,
      journalEntries,
      settings
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codeforces-100-backup-${connectedHandle || 'local'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProgress = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.activeChallengeDay) {
          setActiveChallengeDay(Number(data.activeChallengeDay));
          setSelectedDayView(Number(data.activeChallengeDay));
          setSelectedHeatmapDayNum(Number(data.activeChallengeDay));
        }
        if (data.completedDaysMap) setCompletedDaysMap(data.completedDaysMap);
        if (data.problemProgressMap) setProblemProgressMap(data.problemProgressMap);
        if (data.journalEntries) setJournalEntries(data.journalEntries);
        if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
      } catch (err) {
        // Ignore invalid JSON
      }
    };
    reader.readAsText(file);
  };

  // Download Standalone Self-Contained Browser HTML File
  const handleDownloadStandaloneHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CODEFORCES 100 — Personal Competitive Programming Command Center</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #09090B; color: #FAFAFA; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body class="min-h-screen p-6">
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="p-6 rounded-2xl bg-[#18181B] border border-violet-500/40 flex items-center justify-between">
      <div>
        <div class="text-xs font-mono text-violet-400">STANDALONE OFFLINE SNAPSHOT • CONTEST #400 → #2050+</div>
        <h1 class="text-2xl font-bold text-white mt-1">CODEFORCES 100 — Command Center Snapshot</h1>
        <p class="text-xs text-zinc-400 mt-1">Active Day: Day ${activeChallengeDay} | Solved: ${challengeStats.totalSolvedInChallenge}/600 (${challengeStats.completionPercentage}%) | Handle: ${connectedHandle || 'Local Profile'}</p>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${currentActiveDayObj.problems
        .map(
          (p) => `<div class="p-4 rounded-xl bg-[#18181B] border border-zinc-800 space-y-2">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-violet-400 font-bold">*${p.rating}</span>
              <span class="text-zinc-400">CF #${p.contestId}${p.index}</span>
              <span class="${p.state.status === 'SOLVED' ? 'text-emerald-400' : 'text-zinc-500'}">${p.state.status}</span>
            </div>
            <a href="${p.url}" target="_blank" class="block text-sm font-bold text-white hover:text-violet-300">${p.name} ↗</a>
          </div>`
        )
        .join('')}
    </div>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CODEFORCES-100-Day-${activeChallengeDay}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================================================
  // REUSABLE PROBLEM CARD COMPONENT
  // ============================================================================

  const renderProblemCard = (prob, showDayBadge = false) => {
    const { state } = prob;
    const isSolved = state.status === 'SOLVED';
    const isAttempted = state.status === 'ATTEMPTED';
    const badgeStyle = RATING_BADGE_STYLES[prob.rating] || RATING_BADGE_STYLES[1400];
    const tagsVisible = !blindMode || isSolved || revealedTagsMap[prob.id];

    return (
      <div
        key={prob.id}
        className={`group relative rounded-xl border transition-all duration-200 p-4 flex flex-col justify-between ${
          isSolved
            ? 'bg-[#131816]/90 border-emerald-500/35 shadow-[0_0_25px_-10px_rgba(16,185,129,0.25)]'
            : isAttempted
            ? 'bg-[#181613]/90 border-amber-500/35'
            : 'bg-[#18181B] border-[#27272A] hover:border-violet-500/45'
        }`}
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() =>
                  handleProblemStatusChange(
                    prob.id,
                    isSolved ? 'NOT_STARTED' : 'SOLVED'
                  )
                }
                title={
                  isSolved
                    ? 'Solved (Click to unmark)'
                    : 'Click to mark Solved & save to localStorage'
                }
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                  isSolved
                    ? 'bg-emerald-500 border-emerald-400 text-zinc-950 shadow-sm shadow-emerald-500/30'
                    : 'bg-zinc-900 border-zinc-700 hover:border-violet-400 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </button>

              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
              >
                *{prob.rating}
              </span>

              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900/90 border border-zinc-800 px-2 py-0.5 rounded">
                CF #{prob.contestId}
                {prob.index}
              </span>

              {showDayBadge && (
                <span className="text-[11px] font-mono text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded">
                  Day {prob.dayNumber}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {state.isVerifiedCF && (
                <button
                  onClick={() => setInspectingSubmissionProb(prob)}
                  title="Verified via Codeforces API — Click to inspect submission telemetry"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
                >
                  <ShieldCheck className="w-3 h-3" /> CF AC
                </button>
              )}
              {state.manuallyOverridden && isSolved && (
                <span
                  title="Manually marked Solved & saved in localStorage by Problem ID"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30"
                >
                  <CheckCircle2 className="w-3 h-3" /> Saved
                </span>
              )}
              <button
                onClick={() => handleToggleNeedsRevision(prob.id)}
                title="Flag for Revision"
                className={`p-1.5 rounded-lg border transition-colors ${
                  state.needsRevision || state.revisionInterval
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleToggleBookmark(prob.id)}
                title="Bookmark Problem"
                className={`p-1.5 rounded-lg border transition-colors ${
                  state.isBookmarked
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>

          <a
            href={prob.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group-hover:text-violet-300 transition-colors"
          >
            <h4 className="text-sm font-semibold text-zinc-100 flex items-center justify-between gap-2 leading-snug">
              <span className="truncate">{prob.name}</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-violet-400 shrink-0" />
            </h4>
          </a>

          <div className="mt-3 min-h-[26px] flex items-center flex-wrap gap-1.5">
            {tagsVisible ? (
              <>
                {prob.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800 font-medium"
                  >
                    {t}
                  </span>
                ))}
                {blindMode && !isSolved && (
                  <button
                    onClick={() =>
                      setRevealedTagsMap((prev) => ({ ...prev, [prob.id]: false }))
                    }
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 ml-1 underline"
                  >
                    hide
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() =>
                  setRevealedTagsMap((prev) => ({ ...prev, [prob.id]: true }))
                }
                className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/25 transition-colors"
              >
                <EyeOff className="w-3 h-3 text-violet-400" />
                <span>Blind Mixed Mode — Click to Peek Tags</span>
              </button>
            )}
          </div>

          {state.notes && (
            <div className="mt-2.5 p-2 rounded-lg bg-zinc-900/90 border border-violet-500/25 text-xs text-zinc-300 line-clamp-2">
              <span className="text-violet-400 font-medium mr-1">Note:</span>
              {state.notes}
            </div>
          )}

          {state.cfSubmission && (
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">
                  {state.cfSubmission.programmingLanguage}
                </span>
                <span>{state.cfSubmission.timeConsumedMillis} ms</span>
                <span>
                  {Math.round((state.cfSubmission.memoryConsumedBytes || 0) / 1024)} KB
                </span>
              </div>
              <button
                onClick={() => setInspectingSubmissionProb(prob)}
                className="text-violet-300 hover:underline text-[10px]"
              >
                Inspect AC
              </button>
            </div>
          )}
        </div>

        <div className="mt-3.5 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                handleProblemStatusChange(
                  prob.id,
                  isSolved ? 'NOT_STARTED' : 'SOLVED'
                )
              }
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                isSolved
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              {isSolved ? 'Solved ✓' : 'Mark Solved'}
            </button>

            <button
              onClick={() =>
                handleProblemStatusChange(
                  prob.id,
                  isAttempted ? 'NOT_STARTED' : 'ATTEMPTED'
                )
              }
              className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
                isAttempted
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
              }`}
            >
              {isAttempted ? 'Attempted' : 'Attempt'}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setEditingNoteProblem(prob);
                setNoteDraft(state.notes || '');
              }}
              title="Add / Edit Personal Note"
              className={`p-1.5 rounded-md border text-xs transition-colors ${
                state.notes
                  ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
            </button>

            <select
              value={state.revisionInterval || ''}
              onChange={(e) =>
                handleSetRevisionInterval(
                  prob.id,
                  e.target.value ? Number(e.target.value) : null
                )
              }
              title="Schedule Spaced Repetition Revision"
              className={`text-[11px] px-1.5 py-1 rounded-md border bg-zinc-900 outline-none ${
                state.revisionInterval
                  ? 'border-cyan-500/40 text-cyan-300'
                  : 'border-zinc-800 text-zinc-400'
              }`}
            >
              <option value="">Revise</option>
              <option value="1">+1d</option>
              <option value="3">+3d</option>
              <option value="7">+7d</option>
              <option value="14">+14d</option>
              <option value="30">+30d</option>
            </select>

            <a
              href={prob.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2.5 py-1 rounded-md bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 font-medium inline-flex items-center gap-1 transition-colors"
            >
              Solve <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Terminal },
    { id: 'my-cf', label: 'My Codeforces', icon: UserCheck },
    { id: 'daily', label: '100-Day Challenge', icon: Flame, badge: `D${activeChallengeDay}` },
    { id: 'roadmap', label: 'Roadmap', icon: Compass },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'explorer', label: 'Problem Explorer', icon: Search },
    { id: 'revision', label: 'Revision Center', icon: RotateCcw },
    { id: 'intelligence', label: 'CF Intelligence', icon: BarChart3 },
    { id: 'journal', label: 'Learning Journal', icon: BookOpen },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  // ============================================================================
  // RENDER MAIN LAYOUT
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex font-sans selection:bg-violet-500/30 selection:text-violet-200">
      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } shrink-0 bg-[#111114] border-r border-[#27272A] flex flex-col justify-between transition-all duration-200 sticky top-0 h-screen z-30`}
      >
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#27272A]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/25 shrink-0 border border-violet-400/30">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <div className="font-bold tracking-tight text-sm text-white flex items-center gap-1.5">
                    CODEFORCES <span className="text-violet-400">100</span>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    Command Center
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800"
              title="Toggle Sidebar"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {!sidebarCollapsed && (
            <div className="mx-3 mt-3 p-3 rounded-xl bg-gradient-to-r from-violet-950/60 via-indigo-950/40 to-zinc-900 border border-violet-500/30">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-violet-300 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Day {activeChallengeDay}/100
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {currentActiveDayObj?.solvedCount || 0}/6 AC
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-300"
                  style={{
                    width: `${((currentActiveDayObj?.solvedCount || 0) / 6) * 100}%`
                  }}
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span>{currentActiveDayObj?.tierInfo?.rangeLabel}</span>
                <span>{challengeStats.completedDaysCount}d Done</span>
              </div>
            </div>
          )}

          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-195px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/25 to-indigo-600/15 text-violet-200 border border-violet-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-violet-400' : 'text-zinc-400'
                      }`}
                    />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-[#27272A] bg-[#0D0D10]">
          {!sidebarCollapsed ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  localStorage ID Sync
                </span>
                <span className="font-mono text-emerald-400">Active</span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono truncate">
                D1–30:1200–1700 • D31+:1900 • D61+:2000
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Database className="w-4 h-4 text-emerald-400" title="localStorage Active" />
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR */}
        <header className="h-16 bg-[#111114]/90 backdrop-blur-md border-b border-[#27272A] px-6 flex items-center justify-between sticky top-0 z-20 gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1 bg-[#18181B] border border-[#27272A] rounded-xl px-2.5 py-1">
              <button
                onClick={() => {
                  const prev = Math.max(1, activeChallengeDay - 1);
                  setActiveChallengeDay(prev);
                  setSelectedDayView(prev);
                  setSelectedHeatmapDayNum(prev);
                }}
                disabled={activeChallengeDay <= 1}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 disabled:opacity-30"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setSelectedDayView(activeChallengeDay);
                  setActiveTab('daily');
                }}
                className="text-xs font-semibold text-violet-300 px-1.5 flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                Day {activeChallengeDay} ({currentActiveDayObj?.tierInfo?.rangeLabel})
              </button>
              <button
                onClick={() => {
                  const next = Math.min(100, activeChallengeDay + 1);
                  setActiveChallengeDay(next);
                  setSelectedDayView(next);
                  setSelectedHeatmapDayNum(next);
                }}
                disabled={activeChallengeDay >= 100}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 disabled:opacity-30"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setBlindMode(!blindMode)}
              className={`text-xs px-3 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 transition-all ${
                blindMode
                  ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              {blindMode ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-violet-400" />
                  <span>Blind Mode: ON</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Tags Visible</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadStandaloneHTML}
              className="hidden md:inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-cyan-300 border border-cyan-500/30 font-medium"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download HTML</span>
            </button>

            <span
              key={lastSavedPulse}
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved Locally
            </span>

            {connectedHandle ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('my-cf')}
                  className="px-3 py-1.5 rounded-xl bg-[#18181B] border border-violet-500/35 text-xs font-mono text-violet-200 flex items-center gap-2 hover:border-violet-400"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {connectedHandle}
                  {cfUserProfile?.rating && (
                    <span className="text-amber-400 font-bold">
                      ({cfUserProfile.rating})
                    </span>
                  )}
                </button>
                <button
                  onClick={() => syncCodeforcesAccount(connectedHandle)}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-violet-600/30 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync CF'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('my-cf')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-violet-600/30"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Connect CF
              </button>
            )}
          </div>
        </header>

        {syncError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Codeforces Sync Notice: {syncError}</span>
            </div>
            <button onClick={() => setSyncError(null)} className="text-rose-300 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================================================================== */}
        {/* VIEW 1: MAIN DASHBOARD                                             */}
        {/* ================================================================== */}
        {activeTab === 'dashboard' && (
          <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
            {/* A. HERO SECTION */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#191528] via-[#13131A] to-[#111622] border border-violet-500/35 p-6 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span>
                      3-TIER RATING ESCALATION • D1–30 (1200–1700) • D31–60 (1300–1900) • D61–100 (1400–2000)
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    100 DAYS. 600 PROBLEMS.{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400">
                      ZERO EXCUSES.
                    </span>
                  </h1>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Currently on{' '}
                    <span className="text-violet-300 font-semibold">
                      Day {activeChallengeDay} ({currentActiveDayObj?.tierInfo?.name}:{' '}
                      {currentActiveDayObj?.tierInfo?.rangeLabel})
                    </span>
                    . Start on Day 1 with classic post-#399 rounds and advance into 1900 &amp; 2000
                    rated problems from Day 31 and Day 61 onwards.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedDayView(activeChallengeDay);
                        setActiveTab('daily');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-violet-600/25 transition-all"
                    >
                      <Flame className="w-4 h-4 text-amber-300" />
                      <span>CONTINUE TODAY&apos;S CHALLENGE (DAY {activeChallengeDay})</span>
                    </button>

                    <button
                      onClick={() => handleCompleteDayAndAdvance(activeChallengeDay, false)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/35 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all"
                    >
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                      <span>
                        Tick Day {activeChallengeDay} Complete → Day{' '}
                        {Math.min(100, activeChallengeDay + 1)}
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        connectedHandle
                          ? syncCodeforcesAccount(connectedHandle)
                          : setActiveTab('my-cf')
                      }
                      className="px-3.5 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs sm:text-sm font-medium flex items-center gap-2"
                    >
                      <RefreshCw
                        className={`w-4 h-4 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`}
                      />
                      <span>SYNC CODEFORCES</span>
                    </button>
                  </div>
                </div>

                <div className="bg-[#111115]/90 border border-violet-500/30 rounded-2xl p-4 min-w-[275px] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-zinc-400">
                      Current Active Day
                    </span>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded border ${currentActiveDayObj?.tierInfo?.badgeClass}`}
                    >
                      {currentActiveDayObj?.tierInfo?.rangeLabel}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-extrabold text-white">
                      Day {String(activeChallengeDay).padStart(2, '0')}
                    </div>
                    <div className="text-sm font-mono text-emerald-400 font-semibold">
                      {currentActiveDayObj?.solvedCount}/6 Solved Today
                    </div>
                  </div>
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 via-indigo-400 to-emerald-400 transition-all duration-300"
                      style={{
                        width: `${((currentActiveDayObj?.solvedCount || 0) / 6) * 100}%`
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <div className="text-xs font-mono text-violet-300 font-bold">
                        {challengeStats.totalSolvedInChallenge}/600
                      </div>
                      <div className="text-[10px] text-zinc-500">Challenge AC</div>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <div className="text-xs font-mono text-emerald-400 font-bold">
                        {challengeStats.completedDaysCount}/100
                      </div>
                      <div className="text-[10px] text-zinc-500">Days Done</div>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <div className="text-xs font-mono text-amber-400 font-bold">
                        {challengeStats.consecutiveDaysStreak}d
                      </div>
                      <div className="text-[10px] text-zinc-500">Day Streak</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* B. ALL 8 KEY STATISTICS CARDS */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#18181B] border border-violet-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Challenge Problems Solved</span>
                  <Target className="w-4 h-4 text-violet-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {challengeStats.totalSolvedInChallenge}{' '}
                  <span className="text-xs font-mono text-violet-300">
                    / 600 ({challengeStats.completionPercentage}%)
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  {challengeStats.remainingProblems} remaining in 100-day roadmap
                </div>
              </div>

              <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Total CF Problems Solved</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {cfIntelligence.totalOverallSolved}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  All-time unique accepted on Codeforces
                </div>
              </div>

              <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Current CF Rating</span>
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {cfUserProfile?.rating || '—'}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1 capitalize">
                  Rank: {cfUserProfile?.rank || 'Connect handle'}
                </div>
              </div>

              <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Maximum CF Rating</span>
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-400">
                  {cfUserProfile?.maxRating || '—'}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1 capitalize">
                  Peak Rank: {cfUserProfile?.maxRank || '—'}
                </div>
              </div>

              <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Current Streak</span>
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {challengeStats.consecutiveDaysStreak} Days
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Sequential completed challenge days
                </div>
              </div>

              <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Longest Streak</span>
                  <Zap className="w-4 h-4 text-violet-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {challengeStats.longestDayStreak} Days
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Personal best consistency record
                </div>
              </div>

              <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Contests Participated</span>
                  <Award className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {cfIntelligence.contestStats.totalContests}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Best Rank: #{cfIntelligence.contestStats.bestRank}
                </div>
              </div>

              <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Total Submissions</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {cfIntelligence.totalSubs}{' '}
                  <span className="text-xs font-mono text-emerald-400">
                    ({cfIntelligence.acceptanceRate}% AC)
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  {cfIntelligence.verdictCounts.OK} accepted verdicts
                </div>
              </div>
            </section>

            {/* C. TODAY'S SIX MIXED-TOPIC PROBLEMS (DYNAMIC 3-TIER ESCALATION) */}
            <section className="bg-[#111114] border border-[#27272A] rounded-2xl p-5 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-mono font-bold">
                      ACTIVE DAY {String(activeChallengeDay).padStart(2, '0')}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md border text-xs font-mono font-semibold ${currentActiveDayObj?.tierInfo?.badgeClass}`}
                    >
                      {currentActiveDayObj?.tierInfo?.name} (
                      {currentActiveDayObj?.tierInfo?.rangeLabel})
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-mono">
                      {currentActiveDayObj?.contestRangeLabel}
                    </span>
                    {currentActiveDayObj?.isCompleted && (
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                        ✓ Day Completed
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1.5">
                    Day {activeChallengeDay} Mixed-Concept Gauntlet (
                    {currentActiveDayObj?.dayRatings?.join(' • ')})
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Days 1–30: 1200–1700 • Days 31–60: 1200 removed &amp; 1900 added (1300–1900) •
                    Days 61–100: 1300 removed &amp; 2000 added (1400–2000).
                  </p>

                  {/* Quick Tier Preview Jump Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="text-[11px] text-zinc-500 font-mono mr-1">
                      Quick Tier Jump:
                    </span>
                    <button
                      onClick={() => {
                        setActiveChallengeDay(1);
                        setSelectedDayView(1);
                        setSelectedHeatmapDayNum(1);
                      }}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                        activeChallengeDay <= 30
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Tier 1 (Day 1: 1200–1700)
                    </button>
                    <button
                      onClick={() => {
                        setActiveChallengeDay(31);
                        setSelectedDayView(31);
                        setSelectedHeatmapDayNum(31);
                      }}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                        activeChallengeDay >= 31 && activeChallengeDay <= 60
                          ? 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-300 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Tier 2 (Day 31: 1300–1900)
                    </button>
                    <button
                      onClick={() => {
                        setActiveChallengeDay(61);
                        setSelectedDayView(61);
                        setSelectedHeatmapDayNum(61);
                      }}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                        activeChallengeDay >= 61 && activeChallengeDay !== 80
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Tier 3 (Day 61: 1400–2000)
                    </button>
                    <button
                      onClick={() => {
                        setActiveChallengeDay(80);
                        setSelectedDayView(80);
                        setSelectedHeatmapDayNum(80);
                      }}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                        activeChallengeDay === 80
                          ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Verify Day 80 (1400–2000)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    onClick={() =>
                      handleCompleteDayAndAdvance(activeChallengeDay, true)
                    }
                    className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark All 6 Solved &amp; Next Day</span>
                  </button>

                  <button
                    onClick={() =>
                      handleCompleteDayAndAdvance(activeChallengeDay, false)
                    }
                    className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-violet-600/30 transition-all"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>
                      Complete Day {activeChallengeDay} → Day{' '}
                      {Math.min(100, activeChallengeDay + 1)}
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentActiveDayObj?.problems.map((prob) =>
                  renderProblemCard(prob, false)
                )}
              </div>
            </section>

            {/* D. REDESIGNED COMPACT, PROPORTIONAL & INFORMATIVE ACTIVITY & CONSISTENCY MATRIX */}
            <section className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-violet-400" />
                    Activity &amp; Consistency Matrix (Compact Fixed-Cell Telemetry)
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Inspect every day&apos;s exact problem completion, rating tier escalation
                    (D1–30, D31–60, D61–100), or 24-week Codeforces submission history.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setHeatmapMode('challenge')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      heatmapMode === 'challenge'
                        ? 'bg-violet-600/25 border-violet-400 text-violet-200 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    100-Day Challenge Matrix (10×10)
                  </button>
                  <button
                    onClick={() => setHeatmapMode('overall')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      heatmapMode === 'overall'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    CF 24-Week Calendar Grid
                  </button>
                </div>
              </div>

              {/* Top Telemetry Summary Bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/90 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-zinc-400">Completed Days</div>
                    <div className="text-base font-bold font-mono text-white mt-0.5">
                      {challengeStats.completedDaysCount} / 100{' '}
                      <span className="text-xs text-emerald-400">
                        ({challengeStats.completedDaysCount}%)
                      </span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/90 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-zinc-400">Active / Best Streak</div>
                    <div className="text-base font-bold font-mono text-white mt-0.5">
                      {challengeStats.consecutiveDaysStreak}d{' '}
                      <span className="text-xs text-amber-400">
                        / Max {challengeStats.longestDayStreak}d
                      </span>
                    </div>
                  </div>
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/90 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-zinc-400">3-Tier Solved Split</div>
                    <div className="text-xs font-mono font-bold text-violet-300 mt-1">
                      T1:{challengeStats.tier1Solved} • T2:{challengeStats.tier2Solved} • T3:
                      {challengeStats.tier3Solved}
                    </div>
                  </div>
                  <Layers className="w-4 h-4 text-violet-400" />
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/90 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-zinc-400">24-Week CF Active Days</div>
                    <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
                      {calendarWeeksMatrix.activeDaysInWindow}d{' '}
                      <span className="text-[11px] text-zinc-400">
                        (Peak: {calendarWeeksMatrix.peakDay.count} AC)
                      </span>
                    </div>
                  </div>
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </div>
              </div>

              {/* 12-Column Split Layout: Left 7 Cols Compact Matrix | Right 5 Cols Live Inspector */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-7 bg-[#111114] border border-zinc-800/90 rounded-xl p-4 flex flex-col justify-between">
                  {heatmapMode === 'challenge' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-semibold text-zinc-300">
                          100-Day Progression Grid (Click any day cell to inspect its 6 problems)
                        </span>
                        <span className="text-[11px] font-mono text-violet-300">
                          Inspecting: Day {String(inspectedHeatmapDayObj.dayNumber).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="space-y-1.5 overflow-x-auto pb-1">
                        {Array.from({ length: 10 }, (_, rowIdx) => {
                          const startDay = rowIdx * 10 + 1;
                          const endDay = startDay + 9;
                          const rowDays = enrichedDays.slice(startDay - 1, endDay);
                          const isTier2Start = startDay === 31;
                          const isTier3Start = startDay === 61;

                          return (
                            <React.Fragment key={rowIdx}>
                              {isTier2Start && (
                                <div className="pt-1.5 pb-0.5 flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
                                    ★ Day 31 Escalation: 1200 Removed → 1900 Added (1300–1900)
                                  </span>
                                  <div className="flex-1 h-px bg-fuchsia-500/20" />
                                </div>
                              )}
                              {isTier3Start && (
                                <div className="pt-1.5 pb-0.5 flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                    ★ Day 61 Escalation: 1300 Removed → 2000 Added (1400–2000)
                                  </span>
                                  <div className="flex-1 h-px bg-amber-500/20" />
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <span className="w-16 text-[10px] font-mono text-zinc-500 shrink-0">
                                  D{String(startDay).padStart(2, '0')}–
                                  {String(endDay).padStart(2, '0')}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {rowDays.map((d) => {
                                    const sc = d.solvedCount;
                                    const isSelected =
                                      inspectedHeatmapDayObj.dayNumber === d.dayNumber;
                                    const isCurrentActive =
                                      d.dayNumber === activeChallengeDay;

                                    let cellStyle =
                                      'bg-zinc-900/90 border-zinc-800 text-zinc-500 hover:border-zinc-600';
                                    if (d.isCompleted || sc === 6) {
                                      cellStyle =
                                        'bg-emerald-500/25 border-emerald-400 text-emerald-200 font-bold shadow-[0_0_10px_-3px_rgba(16,185,129,0.4)]';
                                    } else if (sc >= 4) {
                                      cellStyle =
                                        'bg-violet-500/35 border-violet-400 text-violet-100 font-semibold';
                                    } else if (sc >= 2) {
                                      cellStyle =
                                        'bg-indigo-500/25 border-indigo-400/60 text-indigo-200';
                                    } else if (sc === 1 || d.attemptedCount > 0) {
                                      cellStyle =
                                        'bg-violet-950/70 border-violet-700/50 text-violet-300';
                                    }

                                    return (
                                      <button
                                        key={d.dayNumber}
                                        onClick={() => setSelectedHeatmapDayNum(d.dayNumber)}
                                        title={`Day ${d.dayNumber} (${d.tierInfo.rangeLabel}): ${sc}/6 Solved`}
                                        className={`w-7 h-7 rounded-lg border text-[11px] font-mono flex items-center justify-center transition-all shrink-0 ${cellStyle} ${
                                          isSelected
                                            ? 'ring-2 ring-violet-400 scale-105 z-10'
                                            : ''
                                        } ${
                                          isCurrentActive && !isSelected
                                            ? 'ring-1 ring-amber-400'
                                            : ''
                                        }`}
                                      >
                                        {d.dayNumber}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-2 text-[11px] text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <span>Intensity:</span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px]">
                            0/6
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-950/70 border border-violet-700/50 text-violet-300 text-[10px]">
                            1/6
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/25 border border-indigo-400/60 text-indigo-200 text-[10px]">
                            2–3/6
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-500/35 border border-violet-400 text-violet-100 text-[10px]">
                            4–5/6
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/25 border border-emerald-400 text-emerald-200 font-bold text-[10px]">
                            6/6 AC
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-amber-400">
                          Amber Ring = Active Day {activeChallengeDay}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-300">
                          Last 24 Weeks Codeforces Submission &amp; Solve Matrix
                        </span>
                        <span className="text-[11px] font-mono text-emerald-400">
                          Click any square for daily telemetry
                        </span>
                      </div>

                      <div className="overflow-x-auto pb-1">
                        <div className="inline-flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 pl-8 text-[10px] font-mono text-zinc-500">
                            {calendarWeeksMatrix.weeks.map((wk, wIdx) => {
                              const firstDay = wk[0];
                              const prevFirstDay =
                                wIdx > 0 ? calendarWeeksMatrix.weeks[wIdx - 1][0] : null;
                              const showMonth =
                                !prevFirstDay ||
                                firstDay.monthShort !== prevFirstDay.monthShort;
                              return (
                                <div key={wIdx} className="w-3.5 text-left overflow-visible">
                                  {showMonth ? firstDay.monthShort : ''}
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex items-start gap-2">
                            <div className="flex flex-col justify-between h-[116px] text-[9px] font-mono text-zinc-500 pr-1 py-0.5">
                              <span>Sun</span>
                              <span>Tue</span>
                              <span>Thu</span>
                              <span>Sat</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {calendarWeeksMatrix.weeks.map((wk, wIdx) => (
                                <div key={wIdx} className="flex flex-col gap-1.5">
                                  {wk.map((cell) => {
                                    const v = cell.value;
                                    const colorClass =
                                      v === 0
                                        ? 'bg-zinc-900 border-zinc-800/90 hover:border-zinc-600'
                                        : v === 1
                                        ? 'bg-emerald-900/70 border-emerald-700/60'
                                        : v <= 3
                                        ? 'bg-emerald-600/80 border-emerald-500'
                                        : 'bg-emerald-400 border-emerald-300 shadow-sm shadow-emerald-400/40';

                                    return (
                                      <button
                                        key={cell.date}
                                        onClick={() => setSelectedHeatmapDate(cell)}
                                        title={`${cell.date}: ${cell.solvedCount} CF Solved, ${cell.challengeCompletedCount} Challenge Solved, ${cell.submissionsCount} Subs`}
                                        className={`w-3.5 h-3.5 rounded-[3px] border transition-transform hover:scale-125 shrink-0 ${colorClass} ${
                                          selectedHeatmapDate?.date === cell.date
                                            ? 'ring-2 ring-violet-400 scale-125'
                                            : ''
                                        }`}
                                      />
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <span>Less</span>
                          <span className="w-3 h-3 rounded-[2px] bg-zinc-900 border border-zinc-800 inline-block" />
                          <span className="w-3 h-3 rounded-[2px] bg-emerald-900/70 border border-emerald-700/60 inline-block" />
                          <span className="w-3 h-3 rounded-[2px] bg-emerald-600/80 border border-emerald-500 inline-block" />
                          <span className="w-3 h-3 rounded-[2px] bg-emerald-400 border border-emerald-300 inline-block" />
                          <span>More (4+ AC/day)</span>
                        </div>
                        {selectedHeatmapDate && (
                          <span className="font-mono text-emerald-300">
                            {selectedHeatmapDate.date}: {selectedHeatmapDate.solvedCount} CF AC •{' '}
                            {selectedHeatmapDate.submissionsCount} Subs
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT 5 COLUMNS: LIVE INTERACTIVE DAY INSPECTOR PANEL */}
                <div className="lg:col-span-5 bg-[#111114] border border-violet-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-violet-300">
                          DAY {String(inspectedHeatmapDayObj.dayNumber).padStart(2, '0')}{' '}
                          INSPECTOR
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${inspectedHeatmapDayObj.tierInfo.badgeClass}`}
                        >
                          {inspectedHeatmapDayObj.tierInfo.rangeLabel}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {inspectedHeatmapDayObj.contestRangeLabel} •{' '}
                        {inspectedHeatmapDayObj.solvedCount}/6 Solved
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveChallengeDay(inspectedHeatmapDayObj.dayNumber);
                        setSelectedDayView(inspectedHeatmapDayObj.dayNumber);
                        setActiveTab('daily');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <span>Open Day {inspectedHeatmapDayObj.dayNumber}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {inspectedHeatmapDayObj.problems.map((p) => {
                      const isSolved = p.state.status === 'SOLVED';
                      const badge =
                        RATING_BADGE_STYLES[p.rating] || RATING_BADGE_STYLES[1400];
                      return (
                        <div
                          key={p.id}
                          className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800/90 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <button
                              onClick={() =>
                                handleProblemStatusChange(
                                  p.id,
                                  isSolved ? 'NOT_STARTED' : 'SOLVED'
                                )
                              }
                              className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                                isSolved
                                  ? 'bg-emerald-500 border-emerald-400 text-zinc-950'
                                  : 'bg-zinc-950 border-zinc-700 text-transparent'
                              }`}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </button>
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              *{p.rating}
                            </span>
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-200 hover:text-violet-300 truncate font-medium"
                            >
                              {p.name}
                            </a>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                            #{p.contestId}
                            {p.index}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* E. RATING LADDER PROGRESS & RATING PROGRESSION GRAPH */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      3-Tier Challenge Rating Escalation Progress
                    </h3>
                    <p className="text-xs text-zinc-400">
                      1200 (D1–30) • 1300 (D1–60) • 1900 (D31–100) • 2000 (D61–100)
                    </p>
                  </div>
                  <Layers className="w-4 h-4 text-violet-400" />
                </div>

                <div className="space-y-2.5">
                  {ALL_CHALLENGE_RATINGS.map((r) => {
                    const count = challengeStats.solvedByRating[r] || 0;
                    const quota = RATING_QUOTAS[r] || 100;
                    const pct = Math.min(100, Math.round((count / quota) * 100));
                    const style = RATING_BADGE_STYLES[r];
                    return (
                      <div key={r} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-mono font-bold ${style.text}`}>
                            Rating *{r}
                            {r === 1200
                              ? ' (Days 1–30)'
                              : r === 1300
                              ? ' (Days 1–60)'
                              : r === 1900
                              ? ' (Days 31–100)'
                              : r === 2000
                              ? ' (Days 61–100)'
                              : ' (Days 1–100)'}
                          </span>
                          <span className="font-mono text-zinc-300">
                            {count} / {quota} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: style.hex
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-7 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {cfRatingHistory.length > 0
                        ? `Codeforces Rating History (${connectedHandle})`
                        : '100-Day Chronological Contest Era Progression (CF #400 → #2050+)'}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {cfRatingHistory.length > 0
                        ? `${cfRatingHistory.length} official rated contests tracked`
                        : 'Starts with earlier post-#399 contests on Day 1 and scales to recent contests by Day 100'}
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30">
                    {cfRatingHistory.length > 0 ? 'Live Rating' : 'Contest ID Curve'}
                  </span>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {cfRatingHistory.length > 0 ? (
                      <AreaChart
                        data={cfRatingHistory.map((item) => ({
                          name: item.contestName?.slice(0, 18) || `#${item.contestId}`,
                          rating: item.newRating,
                          change: item.newRating - item.oldRating
                        }))}
                      >
                        <defs>
                          <linearGradient id="violetGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                        <XAxis dataKey="name" stroke="#71717A" fontSize={10} />
                        <YAxis stroke="#71717A" fontSize={11} domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#111114',
                            borderColor: '#3F3F46',
                            borderRadius: '10px',
                            fontSize: '12px'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="rating"
                          stroke="#8B5CF6"
                          strokeWidth={2.5}
                          fill="url(#violetGrad)"
                        />
                      </AreaChart>
                    ) : (
                      <AreaChart
                        data={enrichedDays
                          .filter((_, idx) => idx % 5 === 0 || idx === 99)
                          .map((d) => ({
                            day: `Day ${d.dayNumber}`,
                            contestId: d.minContest,
                            solved: d.solvedCount
                          }))}
                      >
                        <defs>
                          <linearGradient id="eraGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                        <XAxis dataKey="day" stroke="#71717A" fontSize={10} />
                        <YAxis stroke="#71717A" fontSize={11} domain={[400, 2100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#111114',
                            borderColor: '#3F3F46',
                            borderRadius: '10px',
                            fontSize: '12px'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="contestId"
                          name="Contest ID (#)"
                          stroke="#8B5CF6"
                          strokeWidth={2.5}
                          fill="url(#eraGrad)"
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          </main>
        )}

        {/* ================================================================== */}
        {/* VIEW 2: DEDICATED DAILY CHALLENGE PAGE                             */}
        {/* ================================================================== */}
        {activeTab === 'daily' && selectedDayObj && (
          <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div className="bg-gradient-to-r from-[#191528] via-[#14141C] to-[#121820] border border-violet-500/35 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-mono font-bold">
                    DAY {String(selectedDayObj.dayNumber).padStart(2, '0')} OF 100
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md border text-xs font-mono font-semibold ${selectedDayObj.tierInfo?.badgeClass}`}
                  >
                    {selectedDayObj.tierInfo?.name} ({selectedDayObj.tierInfo?.rangeLabel})
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-mono">
                    {selectedDayObj.contestRangeLabel}
                  </span>
                  {selectedDayObj.dayNumber === activeChallengeDay && (
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                      ★ Your Current Active Day
                    </span>
                  )}
                  {selectedDayObj.isCompleted && (
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                      ✓ Completed
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {selectedDayObj.phaseName}
                </h1>
                <p className="text-xs text-zinc-300">
                  <strong className="text-violet-300">
                    Assigned Ratings ({selectedDayObj.dayRatings?.join(' • ')}):
                  </strong>{' '}
                  {
                    CURRICULUM_PHASES.find((p) => p.phase === selectedDayObj.phase)
                      ?.eraDifficultyNote
                  }
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedDayView(Math.max(1, selectedDayObj.dayNumber - 1))}
                  disabled={selectedDayObj.dayNumber <= 1}
                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium disabled:opacity-40 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev Day
                </button>

                <select
                  value={selectedDayObj.dayNumber}
                  onChange={(e) => setSelectedDayView(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-white outline-none"
                >
                  {enrichedDays.map((d) => (
                    <option key={d.dayNumber} value={d.dayNumber}>
                      Day {String(d.dayNumber).padStart(2, '0')} ({d.tierInfo?.rangeLabel}) —{' '}
                      {d.solvedCount}/6 AC {d.isCompleted ? '✓' : ''}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() =>
                    setSelectedDayView(Math.min(100, selectedDayObj.dayNumber + 1))
                  }
                  disabled={selectedDayObj.dayNumber >= 100}
                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium disabled:opacity-40 flex items-center gap-1"
                >
                  Next Day <ChevronRight className="w-4 h-4" />
                </button>

                {selectedDayObj.dayNumber !== activeChallengeDay && (
                  <button
                    onClick={() => setActiveChallengeDay(selectedDayObj.dayNumber)}
                    className="px-3 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/35 text-xs font-semibold"
                  >
                    Set as Active Day
                  </button>
                )}

                {selectedDayObj.isCompleted ? (
                  <button
                    onClick={() => handleReopenDay(selectedDayObj.dayNumber)}
                    className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs font-medium"
                  >
                    Reopen Day
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      handleCompleteDayAndAdvance(selectedDayObj.dayNumber, false)
                    }
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>
                      Tick Day {selectedDayObj.dayNumber} Complete → Move to Day{' '}
                      {Math.min(100, selectedDayObj.dayNumber + 1)}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedDayObj.problems.map((prob) => renderProblemCard(prob, false))}
            </div>
          </main>
        )}

        {/* ================================================================== */}
        {/* VIEW 3: 100-DAY ROADMAP                                            */}
        {/* ================================================================== */}
        {activeTab === 'roadmap' && (
          <RoadmapView
            enrichedDays={enrichedDays}
            activeChallengeDay={activeChallengeDay}
            challengeStats={challengeStats}
            onSelectDay={(dayNum) => {
              setSelectedDayView(dayNum);
              setActiveTab('daily');
            }}
          />
        )}

        {/* ================================================================== */}
        {/* VIEW 4: CODEFORCES INTELLIGENCE & PERFORMANCE PROFILE              */}
        {/* ================================================================== */}
        {activeTab === 'intelligence' && (
          <CFIntelligenceView
            cfIntelligence={cfIntelligence}
            cfRatingHistory={cfRatingHistory}
            cfSubmissions={cfSubmissions}
            connectedHandle={connectedHandle}
            currentActiveDayObj={currentActiveDayObj}
          />
        )}

        {/* ================================================================== */}
        {/* VIEW 5: MY CODEFORCES ACCOUNT & PUBLIC PROFILE SANDBOX             */}
        {/* ================================================================== */}
        {activeTab === 'my-cf' && (
          <main className="p-6 space-y-6 max-w-5xl mx-auto w-full">
            <div className="bg-[#18181B] border border-violet-500/35 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Connect Your Personal Codeforces Account
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Synchronizes your official profile, rating history, and accepted submissions
                    without overwriting your local notes, bookmarks, or manual day completions.
                  </p>
                </div>
                {connectedHandle && (
                  <button
                    onClick={() => setConnectedHandle('')}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold"
                  >
                    Disconnect Handle
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  placeholder="Enter Codeforces Handle (e.g., tourist, Benq, jiangly)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white outline-none focus:border-violet-500"
                />
                <button
                  onClick={() => syncCodeforcesAccount(handleInput)}
                  disabled={isSyncing}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-md disabled:opacity-50"
                >
                  {isSyncing ? 'Connecting...' : 'CONNECT ACCOUNT'}
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-xs text-zinc-500">Quick test handles:</span>
                {['tourist', 'Benq', 'jiangly', 'ecnerwala'].map((h) => (
                  <button
                    key={h}
                    onClick={() => {
                      setHandleInput(h);
                      syncCodeforcesAccount(h);
                    }}
                    className="text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-violet-300 border border-zinc-800"
                  >
                    @{h}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Public Profile Lookup Sandbox (Isolated)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Inspect any peer&apos;s Codeforces stats without overwriting your private
                    100-day challenge progress.
                  </p>
                </div>
                <Users className="w-5 h-5 text-cyan-400" />
              </div>

              <form onSubmit={handlePublicLookup} className="flex gap-3">
                <input
                  type="text"
                  value={lookupHandleInput}
                  onChange={(e) => setLookupHandleInput(e.target.value)}
                  placeholder="Lookup public handle..."
                  className="flex-1 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white outline-none"
                />
                <button
                  type="submit"
                  disabled={isLookingUpPublic}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/35 text-xs font-semibold"
                >
                  {isLookingUpPublic ? 'Searching...' : 'Inspect Public Profile'}
                </button>
              </form>

              {publicLookupData && (
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                  {publicLookupData.error ? (
                    <span className="text-rose-400">{publicLookupData.error}</span>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="font-mono font-bold text-white text-sm">
                          {publicLookupData.profile.handle}
                        </span>{' '}
                        <span className="text-zinc-400 capitalize">
                          ({publicLookupData.profile.rank || 'unrated'})
                        </span>
                      </div>
                      <div className="flex gap-4 font-mono">
                        <span>Rating: {publicLookupData.profile.rating || '—'}</span>
                        <span>Max: {publicLookupData.profile.maxRating || '—'}</span>
                        <span>Contests: {publicLookupData.contestsCount}</span>
                        <span className="text-emerald-400">
                          Recent AC: {publicLookupData.solvedCount}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        )}

        {/* ================================================================== */}
        {/* VIEW 6: REVISION CENTER                                            */}
        {/* ================================================================== */}
        {activeTab === 'revision' && (
          <RevisionCenterView
            enrichedDays={enrichedDays}
            renderProblemCard={renderProblemCard}
          />
        )}

        {/* ================================================================== */}
        {/* VIEW 7: GLOBAL PROBLEM EXPLORER                                    */}
        {/* ================================================================== */}
        {activeTab === 'explorer' && (
          <ProblemExplorerView
            enrichedDays={enrichedDays}
            cfProblemPool={cfProblemPool}
            getProblemEffectiveState={getProblemEffectiveState}
            renderProblemCard={renderProblemCard}
          />
        )}

        {/* ================================================================== */}
        {/* VIEW 8: CALENDAR & PROGRESSION TRACKER                             */}
        {/* ================================================================== */}
        {activeTab === 'calendar' && (
          <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18181B] border border-[#27272A] rounded-2xl p-5">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  100-Day Sequential Progression &amp; Activity Calendar
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Days 1–30 (1200–1700) • Days 31–60 (1300–1900) • Days 61–100 (1400–2000).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      isChallengePaused: !prev.isChallengePaused
                    }))
                  }
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
                    settings.isChallengePaused
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                  }`}
                >
                  {settings.isChallengePaused ? (
                    <>
                      <Play className="w-3.5 h-3.5" /> Resume Auto-Advance
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Pause Auto-Advance
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3">
              {enrichedDays.map((d) => {
                const isCurrent = d.dayNumber === activeChallengeDay;
                return (
                  <div
                    key={d.dayNumber}
                    onClick={() => {
                      setSelectedDayView(d.dayNumber);
                      setActiveTab('daily');
                    }}
                    className={`cursor-pointer p-3 rounded-xl border transition-all ${
                      d.isCompleted
                        ? 'bg-emerald-500/15 border-emerald-500/40'
                        : isCurrent
                        ? 'bg-violet-600/25 border-violet-400 shadow-lg shadow-violet-600/20'
                        : d.solvedCount > 0
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-[#18181B] border-[#27272A] hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-white">Day {d.dayNumber}</span>
                      <span className={d.isCompleted ? 'text-emerald-400' : 'text-zinc-400'}>
                        {d.solvedCount}/6
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-violet-300 mt-1">
                      {d.tierInfo?.rangeLabel}
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500 mt-0.5">
                      CF #{d.minContest}+
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        )}

        {/* ================================================================== */}
        {/* VIEW 9: PERSONAL LEARNING JOURNAL                                  */}
        {/* ================================================================== */}
        {activeTab === 'journal' && (
          <LearningJournalView
            enrichedDays={enrichedDays}
            selectedDayView={selectedDayView}
            setSelectedDayView={setSelectedDayView}
            journalEntries={journalEntries}
            setJournalEntries={setJournalEntries}
          />
        )}

        {/* ================================================================== */}
        {/* VIEW 10: ACHIEVEMENTS                                              */}
        {/* ================================================================== */}
        {activeTab === 'achievements' && (
          <main className="p-6 space-y-6 max-w-6xl mx-auto w-full">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Competitive Programming Milestones &amp; Achievements
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Automatically unlocked from your verified challenge progress and Codeforces
                telemetry.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: 'First Blood',
                  desc: 'Solve your very first challenge problem',
                  progress: Math.min(1, challengeStats.totalSolvedInChallenge),
                  target: 1,
                  unlocked: challengeStats.totalSolvedInChallenge >= 1
                },
                {
                  title: 'Perfect Day',
                  desc: 'Solve all 6 assigned problems in a single challenge day',
                  progress: Math.min(1, challengeStats.completedDaysCount),
                  target: 1,
                  unlocked: challengeStats.completedDaysCount >= 1
                },
                {
                  title: 'Seven-Day Warrior',
                  desc: 'Achieve 7 consecutive completed challenge days',
                  progress: Math.min(7, challengeStats.longestDayStreak),
                  target: 7,
                  unlocked: challengeStats.longestDayStreak >= 7
                },
                {
                  title: '100 Problems Club',
                  desc: 'Solve 100 challenge problems across the roadmap',
                  progress: Math.min(100, challengeStats.totalSolvedInChallenge),
                  target: 100,
                  unlocked: challengeStats.totalSolvedInChallenge >= 100
                },
                {
                  title: 'Halfway There',
                  desc: 'Solve 300 out of 600 challenge problems',
                  progress: Math.min(300, challengeStats.totalSolvedInChallenge),
                  target: 300,
                  unlocked: challengeStats.totalSolvedInChallenge >= 300
                },
                {
                  title: 'The Finisher',
                  desc: 'Complete all 600 problems in CODEFORCES 100',
                  progress: Math.min(600, challengeStats.totalSolvedInChallenge),
                  target: 600,
                  unlocked: challengeStats.totalSolvedInChallenge >= 600
                }
              ].map((ach) => {
                const pct = Math.min(100, Math.round((ach.progress / ach.target) * 100));
                return (
                  <div
                    key={ach.title}
                    className={`p-5 rounded-2xl border transition-all ${
                      ach.unlocked
                        ? 'bg-gradient-to-br from-violet-950/60 via-[#18181B] to-zinc-900 border-violet-500/45 shadow-lg shadow-violet-600/10'
                        : 'bg-[#18181B] border-[#27272A] opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Award
                        className={`w-6 h-6 ${
                          ach.unlocked ? 'text-amber-400' : 'text-zinc-600'
                        }`}
                      />
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                          ach.unlocked
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                        }`}
                      >
                        {ach.unlocked ? 'Unlocked ✓' : `${ach.progress}/${ach.target}`}
                      </span>
                    </div>
                    <div className="font-bold text-white text-sm">{ach.title}</div>
                    <div className="text-xs text-zinc-400 mt-1">{ach.desc}</div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mt-3">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-emerald-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        )}

        {/* ================================================================== */}
        {/* VIEW 11: SETTINGS & LOCAL STORAGE BACKUP MANAGER                   */}
        {/* ================================================================== */}
        {activeTab === 'settings' && (
          <main className="p-6 space-y-6 max-w-5xl mx-auto w-full">
            <h1 className="text-2xl font-bold text-white">
              Settings &amp; LocalStorage Persistence Manager
            </h1>

            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">
                    Auto-Advance to Next Day When All 6 Problems Are Solved
                  </div>
                  <div className="text-xs text-zinc-400">
                    Automatically marks Day N complete when 6/6 problems are solved.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoAdvanceOnSixSolved}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      autoAdvanceOnSixSolved: e.target.checked
                    }))
                  }
                  className="w-4 h-4 accent-violet-500"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDownloadStandaloneHTML}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md"
                >
                  <Download className="w-4 h-4" /> Download Standalone Browser HTML
                </button>

                <button
                  onClick={handleExportProgress}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-violet-300 border border-violet-500/35 text-xs font-semibold flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Export Progress Backup (JSON)
                </button>

                <label className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4 text-cyan-400" /> Import Backup JSON
                  <input
                    type="file"
                    accept="application/json"
                    onChange={handleImportProgress}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => {
                    setActiveChallengeDay(1);
                    setSelectedDayView(1);
                    setSelectedHeatmapDayNum(1);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 text-xs font-semibold"
                >
                  Reset Active Day Pointer to Day 1
                </button>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* MODAL 1: PERSONAL PROBLEM NOTES */}
      {editingNoteProblem && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-violet-500/40 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-violet-400">
                  CF #{editingNoteProblem.contestId}
                  {editingNoteProblem.index} (*{editingNoteProblem.rating})
                </span>
                <h3 className="text-base font-bold text-white">
                  {editingNoteProblem.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingNoteProblem(null)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={5}
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Write your approach, key observation, time complexity, or edge case notes..."
              className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-violet-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingNoteProblem(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProblemNote}
                className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
              >
                Save Note to localStorage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ACCEPTED SUBMISSION TELEMETRY INSPECTOR */}
      {inspectingSubmissionProb && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-emerald-500/40 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                <ShieldCheck className="w-4 h-4" /> VERIFIED CODEFORCES SUBMISSION
              </div>
              <button
                onClick={() => setInspectingSubmissionProb(null)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {inspectingSubmissionProb.name}
              </h3>
              <p className="text-xs font-mono text-zinc-400">
                Canonical ID: {inspectingSubmissionProb.id} • Rating *
                {inspectingSubmissionProb.rating}
              </p>
            </div>
            {inspectingSubmissionProb.state?.cfSubmission ? (
              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-zinc-500 text-[10px]">Submission ID</div>
                  <div className="text-white font-bold">
                    #{inspectingSubmissionProb.state.cfSubmission.submissionId}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-zinc-500 text-[10px]">Language</div>
                  <div className="text-emerald-400 font-bold">
                    {inspectingSubmissionProb.state.cfSubmission.programmingLanguage}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-zinc-500 text-[10px]">Execution Time</div>
                  <div className="text-white">
                    {inspectingSubmissionProb.state.cfSubmission.timeConsumedMillis} ms
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-zinc-500 text-[10px]">Memory Used</div>
                  <div className="text-white">
                    {Math.round(
                      (inspectingSubmissionProb.state.cfSubmission.memoryConsumedBytes || 0) /
                        1024
                    )}{' '}
                    KB
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-zinc-400">Marked Solved locally.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENT: 100-DAY ROADMAP VIEW
// ============================================================================

function RoadmapView({ enrichedDays, activeChallengeDay, challengeStats, onSelectDay }) {
  const [viewMode, setViewMode] = useState('grid');
  const [filterMode, setFilterMode] = useState('ALL');

  const filterDay = (d) => {
    if (filterMode === 'COMPLETED') return d.isCompleted;
    if (filterMode === 'IN_PROGRESS')
      return !d.isCompleted && (d.solvedCount > 0 || d.attemptedCount > 0);
    if (filterMode === 'NOT_STARTED')
      return !d.isCompleted && d.solvedCount === 0 && d.attemptedCount === 0;
    if (filterMode === 'BOOKMARKED') return d.hasBookmarked;
    if (filterMode === 'REVISION') return d.hasRevision;
    return true;
  };

  return (
    <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            100-Day Chronological Mixed-Topic Roadmap (3-Tier Rating Escalation)
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Days 1–30: 1200–1700 • Days 31–60: 1300–1900 • Days 61–100: 1400–2000.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: 'All (100)' },
            { id: 'COMPLETED', label: `Completed (${challengeStats.completedDaysCount})` },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'NOT_STARTED', label: 'Not Started' },
            { id: 'BOOKMARKED', label: 'Bookmarked' },
            { id: 'REVISION', label: 'Needs Revision' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                filterMode === f.id
                  ? 'bg-violet-600/25 border-violet-500/50 text-violet-200'
                  : 'bg-[#18181B] border-[#27272A] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f.label}
            </button>
          ))}

          <div className="flex items-center bg-[#18181B] border border-[#27272A] rounded-xl p-0.5 ml-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs ${
                viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-zinc-400'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 rounded-lg text-xs ${
                viewMode === 'timeline' ? 'bg-violet-600 text-white' : 'text-zinc-400'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {CURRICULUM_PHASES.map((phase) => {
          const phaseDays = enrichedDays
            .filter((d) => d.phase === phase.phase)
            .filter(filterDay);
          if (phaseDays.length === 0) return null;

          const allPhaseDays = enrichedDays.filter((d) => d.phase === phase.phase);
          const phaseSolved = allPhaseDays.reduce((acc, d) => acc + d.solvedCount, 0);
          const phaseTotal = allPhaseDays.length * 6;
          const phasePct = Math.round((phaseSolved / phaseTotal) * 100);

          return (
            <div
              key={phase.phase}
              className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold">
                      Days {phase.dayStart}–{phase.dayEnd}
                    </span>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {phase.contestEra}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1.5">{phase.name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{phase.eraDifficultyNote}</p>
                </div>

                <div className="min-w-[180px] text-right">
                  <div className="text-xs font-mono text-zinc-300">
                    {phaseSolved} / {phaseTotal} Solved ({phasePct}%)
                  </div>
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-emerald-400"
                      style={{ width: `${phasePct}%` }}
                    />
                  </div>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5 pt-2">
                  {phaseDays.map((d) => {
                    const isCurrent = d.dayNumber === activeChallengeDay;
                    return (
                      <button
                        key={d.dayNumber}
                        onClick={() => onSelectDay(d.dayNumber)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          d.isCompleted
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                            : isCurrent
                            ? 'bg-violet-600/25 border-violet-400 text-white shadow-md shadow-violet-600/20'
                            : d.solvedCount > 0
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                            : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold">
                            D{String(d.dayNumber).padStart(2, '0')}
                          </span>
                          {d.isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : isCurrent ? (
                            <Flame className="w-3.5 h-3.5 text-amber-400" />
                          ) : null}
                        </div>
                        <div className="mt-2 text-[11px] font-mono">{d.solvedCount}/6 AC</div>
                        <div className="text-[9px] font-mono text-zinc-500 truncate mt-0.5">
                          {d.tierInfo?.rangeLabel}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  {phaseDays.map((d) => (
                    <div
                      key={d.dayNumber}
                      onClick={() => onSelectDay(d.dayNumber)}
                      className="cursor-pointer p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-violet-500/40 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30">
                          Day {String(d.dayNumber).padStart(2, '0')}
                        </span>
                        <div>
                          <div className="text-xs font-semibold text-white">
                            {d.contestRangeLabel} • {d.tierInfo?.rangeLabel}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono">
                            {d.problems.map((p) => `*${p.rating}`).join(' • ')}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-emerald-400">
                        {d.solvedCount}/6 Solved
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

// ============================================================================
// SUB-COMPONENT: CODEFORCES INTELLIGENCE VIEW
// ============================================================================

function CFIntelligenceView({
  cfIntelligence,
  cfRatingHistory,
  cfSubmissions,
  connectedHandle,
  currentActiveDayObj
}) {
  const [ratingTimeFilter, setRatingTimeFilter] = useState('ALL');
  const [selectedRatingBucket, setSelectedRatingBucket] = useState(null);
  const [selectedTopicDrilldown, setSelectedTopicDrilldown] = useState(null);

  const filteredRatingHistory = useMemo(() => {
    if (ratingTimeFilter === 'ALL') return cfRatingHistory;
    const nowSec = Math.floor(Date.now() / 1000);
    const daysMap = { '30D': 30, '90D': 90, '6M': 180, '1Y': 365 };
    const cutoff = nowSec - (daysMap[ratingTimeFilter] || 365) * 86400;
    return cfRatingHistory.filter((r) => r.ratingUpdateTimeSeconds >= cutoff);
  }, [cfRatingHistory, ratingTimeFilter]);

  return (
    <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            CODEFORCES INTELLIGENCE &amp; PERFORMANCE PROFILE
          </h1>
          <p className="text-xs text-zinc-400">
            Interactive analytics across rating progression, rating buckets, topic strengths, and
            submission verdicts.
          </p>
        </div>
      </div>

      <section className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              A. Interactive Rating History ({connectedHandle || 'Connect Handle'})
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {['30D', '90D', '6M', '1Y', 'ALL'].map((tf) => (
              <button
                key={tf}
                onClick={() => setRatingTimeFilter(tf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${
                  ratingTimeFilter === tf
                    ? 'bg-violet-600/25 border-violet-500/40 text-violet-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={
                filteredRatingHistory.length > 0
                  ? filteredRatingHistory.map((c) => ({
                      name: c.contestName?.slice(0, 16) || `#${c.contestId}`,
                      rating: c.newRating
                    }))
                  : [{ name: 'No Contests Yet', rating: 0 }]
              }
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="name" stroke="#71717A" fontSize={10} />
              <YAxis stroke="#71717A" fontSize={11} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111114',
                  borderColor: '#3F3F46',
                  borderRadius: '10px',
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey="rating"
                stroke="#8B5CF6"
                strokeWidth={2.5}
                fill="#8B5CF6"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">
            B. Problem-Solving Rating Distribution (Click bar to inspect)
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cfIntelligence.ratingBuckets}
                onClick={(st) => {
                  if (st?.activePayload?.[0]?.payload) {
                    setSelectedRatingBucket(st.activePayload[0].payload);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="label" stroke="#71717A" fontSize={10} />
                <YAxis stroke="#71717A" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111114',
                    borderColor: '#3F3F46',
                    borderRadius: '10px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} className="cursor-pointer">
                  {cfIntelligence.ratingBuckets.map((_, index) => (
                    <Cell
                      key={index}
                      fill={index % 2 === 0 ? '#8B5CF6' : '#06B6D4'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {selectedRatingBucket && (
            <div className="p-3 rounded-xl bg-zinc-900 border border-violet-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-violet-300">
                  Solved in {selectedRatingBucket.label} ({selectedRatingBucket.problems.length})
                </span>
                <button
                  onClick={() => setSelectedRatingBucket(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  Close
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {selectedRatingBucket.problems.map((p) => (
                  <a
                    key={p.id}
                    href={`https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800 hover:border-violet-400"
                  >
                    #{p.contestId}
                    {p.index} {p.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">
            C. Topic-Wise Strengths (Click any topic to view solved problems)
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {cfIntelligence.sortedTopics.slice(0, 14).map((item, idx) => {
              const maxCount = cfIntelligence.sortedTopics[0]?.count || 1;
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div
                  key={item.tag}
                  onClick={() => setSelectedTopicDrilldown(item)}
                  className="cursor-pointer space-y-1 p-1.5 rounded-lg hover:bg-zinc-900/70"
                >
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-200 font-medium capitalize">{item.tag}</span>
                    <span className="font-mono text-violet-300">{item.count} AC</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          idx % 3 === 0 ? '#8B5CF6' : idx % 3 === 1 ? '#06B6D4' : '#10B981'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {selectedTopicDrilldown && (
            <div className="p-3 rounded-xl bg-zinc-900 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-300 capitalize">
                  Tag: {selectedTopicDrilldown.tag} ({selectedTopicDrilldown.count} AC)
                </span>
                <button
                  onClick={() => setSelectedTopicDrilldown(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  Close
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {selectedTopicDrilldown.problems.map((p) => (
                  <a
                    key={p.id}
                    href={`https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800 hover:border-cyan-400"
                  >
                    #{p.contestId}
                    {p.index} (*{p.rating})
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// ============================================================================
// SUB-COMPONENT: REVISION CENTER VIEW
// ============================================================================

function RevisionCenterView({ enrichedDays, renderProblemCard }) {
  const [activeCategory, setActiveCategory] = useState('ALL_QUEUE');
  const [ratingFilter, setRatingFilter] = useState('ALL');

  const allProblems = useMemo(
    () => enrichedDays.flatMap((d) => d.problems),
    [enrichedDays]
  );

  const filteredProblems = useMemo(() => {
    return allProblems.filter((p) => {
      if (ratingFilter !== 'ALL' && p.rating !== Number(ratingFilter)) return false;

      if (activeCategory === 'ATTEMPTED_UNSOLVED') {
        return p.state.status === 'ATTEMPTED';
      }
      if (activeCategory === 'SOLVED_NEEDS_REVISION') {
        return (
          p.state.status === 'SOLVED' &&
          (p.state.needsRevision || Boolean(p.state.revisionInterval))
        );
      }
      if (activeCategory === 'BOOKMARKED') {
        return p.state.isBookmarked;
      }
      if (activeCategory === 'DIFFICULT') {
        return p.rating >= 1600;
      }
      if (activeCategory === 'WITH_NOTES') {
        return Boolean(p.state.notes && p.state.notes.trim().length > 0);
      }
      if (activeCategory === 'UPCOMING') {
        return Boolean(p.state.revisionInterval);
      }
      return (
        p.state.isBookmarked ||
        p.state.status === 'ATTEMPTED' ||
        p.state.needsRevision ||
        Boolean(p.state.notes) ||
        Boolean(p.state.revisionInterval)
      );
    });
  }, [allProblems, activeCategory, ratingFilter]);

  return (
    <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Spaced Repetition &amp; Revision Center
          </h1>
          <p className="text-xs text-zinc-400">
            Organize attempted problems, bookmarked gems, high-difficulty (1600–2000) problems, and
            spaced repetition schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white"
          >
            <option value="ALL">All Ratings (1200–2000)</option>
            {ALL_CHALLENGE_RATINGS.map((r) => (
              <option key={r} value={r}>
                *{r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'ALL_QUEUE', label: 'All Revision Queue' },
          { id: 'ATTEMPTED_UNSOLVED', label: 'Attempted but Unsolved' },
          { id: 'SOLVED_NEEDS_REVISION', label: 'Solved • Needs Revision' },
          { id: 'BOOKMARKED', label: 'Bookmarked' },
          { id: 'DIFFICULT', label: 'Difficult (1600–2000)' },
          { id: 'WITH_NOTES', label: 'Problems with Notes' },
          { id: 'UPCOMING', label: 'Scheduled Revisions (+1d..+30d)' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeCategory === tab.id
                ? 'bg-violet-600/25 border-violet-500/50 text-violet-200'
                : 'bg-[#18181B] border-[#27272A] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProblems.slice(0, 60).map((prob) => renderProblemCard(prob, true))}
      </div>
    </main>
  );
}

// ============================================================================
// SUB-COMPONENT: STRUCTURED 6-FIELD LEARNING JOURNAL VIEW
// ============================================================================

function LearningJournalView({
  enrichedDays,
  selectedDayView,
  setSelectedDayView,
  journalEntries,
  setJournalEntries
}) {
  const currentEntry = useMemo(() => {
    const raw = journalEntries[selectedDayView];
    if (!raw) {
      return {
        learned: '',
        struggled: '',
        observations: '',
        algorithms: '',
        mistakes: '',
        improveTomorrow: ''
      };
    }
    if (typeof raw === 'string') {
      return {
        learned: raw,
        struggled: '',
        observations: '',
        algorithms: '',
        mistakes: '',
        improveTomorrow: ''
      };
    }
    return raw;
  }, [journalEntries, selectedDayView]);

  const updateField = (field, val) => {
    setJournalEntries((prev) => ({
      ...prev,
      [selectedDayView]: {
        ...currentEntry,
        [field]: val
      }
    }));
  };

  return (
    <main className="p-6 space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Personal DSA &amp; CP Learning Journal
          </h1>
          <p className="text-xs text-zinc-400">
            Structured 6-field reflection associated with each challenge day and saved in
            localStorage.
          </p>
        </div>
        <select
          value={selectedDayView}
          onChange={(e) => setSelectedDayView(Number(e.target.value))}
          className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-white"
        >
          {enrichedDays.map((d) => (
            <option key={d.dayNumber} value={d.dayNumber}>
              Day {String(d.dayNumber).padStart(2, '0')} ({d.tierInfo?.rangeLabel})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: 'learned', label: '1. What I Learned Today' },
          { key: 'struggled', label: '2. Problems I Struggled With' },
          { key: 'observations', label: '3. Important Observations & Invariants' },
          { key: 'algorithms', label: '4. Algorithms & Templates Practiced' },
          { key: 'mistakes', label: '5. Mistakes Made (WA / TLE / Off-by-one)' },
          { key: 'improveTomorrow', label: '6. Areas to Improve Tomorrow' }
        ].map((item) => (
          <div
            key={item.key}
            className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 space-y-2"
          >
            <label className="text-xs font-bold text-violet-300">{item.label}</label>
            <textarea
              rows={4}
              value={currentEntry[item.key] || ''}
              onChange={(e) => updateField(item.key, e.target.value)}
              placeholder={`Enter notes for ${item.label.toLowerCase()}...`}
              className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-violet-500"
            />
          </div>
        ))}
      </div>
    </main>
  );
}

// ============================================================================
// SUB-COMPONENT: GLOBAL PROBLEM EXPLORER VIEW
// ============================================================================

function ProblemExplorerView({
  enrichedDays,
  cfProblemPool,
  getProblemEffectiveState,
  renderProblemCard
}) {
  const [scope, setScope] = useState('CHALLENGE_600');
  const [query, setQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const sourceList = useMemo(() => {
    if (scope === 'CHALLENGE_600') {
      return enrichedDays.flatMap((d) => d.problems);
    }
    return cfProblemPool.slice(0, 600).map((p) => {
      const id = `${p.contestId}-${p.index}`;
      return {
        id,
        contestId: p.contestId,
        index: p.index,
        name: p.name,
        rating: p.rating,
        tags: p.tags || [],
        url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
        dayNumber: 'Pool',
        state: getProblemEffectiveState(id)
      };
    });
  }, [scope, enrichedDays, cfProblemPool, getProblemEffectiveState]);

  const filtered = useMemo(() => {
    return sourceList.filter((p) => {
      if (ratingFilter !== 'ALL' && p.rating !== Number(ratingFilter)) return false;
      if (statusFilter === 'BOOKMARKED' && !p.state.isBookmarked) return false;
      if (
        statusFilter !== 'ALL' &&
        statusFilter !== 'BOOKMARKED' &&
        p.state.status !== statusFilter
      )
        return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchId = p.id.toLowerCase().includes(q);
        const matchTag = p.tags.some((t) => t.toLowerCase().includes(q));
        return matchName || matchId || matchTag;
      }
      return true;
    });
  }, [sourceList, query, ratingFilter, statusFilter]);

  return (
    <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Global Problem Explorer (Contest #400 → Recent)
          </h1>
          <p className="text-xs text-zinc-400">
            Search across the 600 assigned challenge problems or the broader post-#399 Codeforces
            pool.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#18181B] border border-[#27272A] rounded-xl p-0.5">
            <button
              onClick={() => setScope('CHALLENGE_600')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                scope === 'CHALLENGE_600' ? 'bg-violet-600 text-white' : 'text-zinc-400'
              }`}
            >
              600 Challenge
            </button>
            <button
              onClick={() => setScope('ALL_CF')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                scope === 'ALL_CF' ? 'bg-violet-600 text-white' : 'text-zinc-400'
              }`}
            >
              All CF Pool
            </button>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problem, contest ID, tag..."
            className="px-3.5 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white outline-none focus:border-violet-500"
          />
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white"
          >
            <option value="ALL">All Ratings (1200–2000)</option>
            {ALL_CHALLENGE_RATINGS.map((r) => (
              <option key={r} value={r}>
                *{r}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="SOLVED">Solved</option>
            <option value="ATTEMPTED">Attempted</option>
            <option value="NOT_STARTED">Unsolved</option>
            <option value="BOOKMARKED">Bookmarked</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.slice(0, 60).map((prob) => renderProblemCard(prob, true))}
      </div>
    </main>
  );
}