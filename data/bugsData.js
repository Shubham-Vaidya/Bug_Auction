const bugsData = [
  {
    bugId: "BUG001",
    name: "Off-by-One Loop Boundary",
    description: "Loop iterates one step beyond valid array index.",
    marketValue: 140,
    difficulty: "Easy",
    tag: "🟢",
    languageVersions: {
      python: "arr = [1, 2, 3]\nfor i in range(len(arr) + 1):\n    print(arr[i])",
      java: "int[] arr = {1,2,3};\nfor (int i = 0; i <= arr.length; i++) {\n    System.out.println(arr[i]);\n}",
      c: "int arr[] = {1,2,3};\nfor (int i = 0; i <= 3; i++) {\n    printf(\"%d\\n\", arr[i]);\n}"
    }
  },
  {
    bugId: "BUG002",
    name: "Integer Division Truncation",
    description: "Average calculation loses decimal precision.",
    marketValue: 180,
    difficulty: "Easy",
    tag: "🟢",
    languageVersions: {
      python: "a, b = 1, 2\navg = (a + b) // 2\nprint(avg)",
      java: "int a = 1, b = 2;\ndouble avg = (a + b) / 2;\nSystem.out.println(avg);",
      c: "int a = 1, b = 2;\nfloat avg = (a + b) / 2;\nprintf(\"%f\\n\", avg);"
    }
  },
  {
    bugId: "BUG003",
    name: "Missing Empty Array Edge Case",
    description: "Function assumes non-empty input and crashes on empty list.",
    marketValue: 160,
    difficulty: "Easy",
    tag: "🟢",
    languageVersions: {
      python: "def first(nums):\n    return nums[0]\n\nprint(first([]))",
      java: "int first(int[] nums) {\n    return nums[0];\n}",
      c: "int first(int* nums) {\n    return nums[0];\n}"
    }
  },
  {
    bugId: "BUG004",
    name: "Infinite Recursion Base Case",
    description: "Recursive function never reaches a stopping condition.",
    marketValue: 320,
    difficulty: "Medium",
    tag: "🟡",
    languageVersions: {
      python: "def fact(n):\n    if n == 0:\n        return n * fact(n - 1)\n    return 1",
      java: "int fact(int n) {\n    if (n == 0) return n * fact(n - 1);\n    return 1;\n}",
      c: "int fact(int n) {\n    if (n == 0) return n * fact(n - 1);\n    return 1;\n}"
    }
  },
  {
    bugId: "BUG005",
    name: "Binary Search Mid Overflow",
    description: "Midpoint computation can overflow on large bounds.",
    marketValue: 410,
    difficulty: "Hard",
    tag: "🔴",
    languageVersions: {
      python: "def bs(a, x):\n    l, r = 0, len(a) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if a[m] == x: return m\n        if a[m] < x: l = m + 1\n        else: r = m - 1",
      java: "int m = (left + right) / 2; // overflow risk",
      c: "int mid = (left + right) / 2; /* overflow risk */"
    }
  },
  {
    bugId: "BUG006",
    name: "Binary Search Wrong Boundary Update",
    description: "Right boundary update can cause endless loop.",
    marketValue: 360,
    difficulty: "Medium",
    tag: "🟡",
    languageVersions: {
      python: "while l < r:\n    m = (l + r) // 2\n    if arr[m] < target:\n        l = m\n    else:\n        r = m",
      java: "while (l < r) {\n    int m = (l + r) / 2;\n    if (arr[m] < target) l = m;\n    else r = m;\n}",
      c: "while (l < r) {\n    int m = (l + r) / 2;\n    if (arr[m] < target) l = m;\n    else r = m;\n}"
    }
  },
  {
    bugId: "BUG007",
    name: "DFS Without Visited Mark",
    description: "Graph traversal revisits nodes and loops forever on cycles.",
    marketValue: 450,
    difficulty: "Hard",
    tag: "🔴",
    languageVersions: {
      python: "def dfs(u, g):\n    for v in g[u]:\n        dfs(v, g)",
      java: "void dfs(int u, List<Integer>[] g) {\n    for (int v : g[u]) dfs(v, g);\n}",
      c: "void dfs(int u) {\n    for (int i = 0; i < deg[u]; i++) dfs(adj[u][i]);\n}"
    }
  },
  {
    bugId: "BUG008",
    name: "BFS Level Counter Drift",
    description: "Level increments per node instead of per layer.",
    marketValue: 300,
    difficulty: "Medium",
    tag: "🟡",
    languageVersions: {
      python: "level = 0\nwhile q:\n    node = q.pop(0)\n    level += 1",
      java: "int level = 0;\nwhile (!q.isEmpty()) {\n    int node = q.poll();\n    level++;\n}",
      c: "int level = 0;\nwhile (front < rear) {\n    int node = q[front++];\n    level++;\n}"
    }
  },
  {
    bugId: "BUG009",
    name: "DP Table Not Initialized",
    description: "Dynamic programming state starts with garbage values.",
    marketValue: 340,
    difficulty: "Medium",
    tag: "🟡",
    languageVersions: {
      python: "dp = [0] * n\nfor i in range(1, n):\n    dp[i] = max(dp[i], dp[i-1] + a[i])",
      java: "int[] dp = new int[n];\nfor (int i = 1; i < n; i++) {\n    dp[i] = Math.max(dp[i], dp[i - 1] + a[i]);\n}",
      c: "int dp[1000];\nfor (int i = 1; i < n; i++) {\n    dp[i] = dp[i] > dp[i-1] + a[i] ? dp[i] : dp[i-1] + a[i];\n}"
    }
  },
  {
    bugId: "BUG010",
    name: "Knapsack Wrong Transition",
    description: "Uses current row instead of previous row causing overcount.",
    marketValue: 520,
    difficulty: "Hard",
    tag: "🔴",
    languageVersions: {
      python: "for w in range(weight, W + 1):\n    dp[w] = max(dp[w], dp[w - weight] + value)",
      java: "for (int w = weight; w <= W; w++) {\n    dp[w] = Math.max(dp[w], dp[w - weight] + value);\n}",
      c: "for (int w = weight; w <= W; w++) {\n    dp[w] = dp[w] > dp[w-weight] + value ? dp[w] : dp[w-weight] + value;\n}"
    }
  },
  {
    bugId: "BUG011",
    name: "Floating Point Equality Trap",
    description: "Compares floating values using exact equality.",
    marketValue: 260,
    difficulty: "Medium",
    tag: "🟡",
    languageVersions: {
      python: "x = 0.1 + 0.2\nif x == 0.3:\n    print(\"equal\")",
      java: "double x = 0.1 + 0.2;\nif (x == 0.3) System.out.println(\"equal\");",
      c: "double x = 0.1 + 0.2;\nif (x == 0.3) printf(\"equal\\n\");"
    }
  },
  {
    bugId: "BUG012",
    name: "Bubble Sort Inner Loop Overrun",
    description: "Inner loop reads j+1 past end of unsorted region.",
    marketValue: 170,
    difficulty: "Easy",
    tag: "🟢",
    languageVersions: {
      python: "for i in range(len(a)):\n    for j in range(len(a) - i):\n        if a[j] > a[j+1]:\n            a[j], a[j+1] = a[j+1], a[j]",
      java: "for (int i = 0; i < a.length; i++) {\n    for (int j = 0; j < a.length - i; j++) {\n        if (a[j] > a[j+1]) { int t=a[j]; a[j]=a[j+1]; a[j+1]=t; }\n    }\n}",
      c: "for (int i = 0; i < n; i++) {\n    for (int j = 0; j < n - i; j++) {\n        if (a[j] > a[j+1]) { int t=a[j]; a[j]=a[j+1]; a[j+1]=t; }\n    }\n}"
    }
  },
  {
    bugId: "BUG013",
    name: "Quick Sort Pivot Stuck",
    description: "Partition pointers do not move correctly on equal elements.",
    marketValue: 480,
    difficulty: "Hard",
    tag: "🔴",
    languageVersions: {
      python: "while i < j:\n    while arr[i] < pivot: i += 1\n    while arr[j] > pivot: j -= 1\n    arr[i], arr[j] = arr[j], arr[i]",
      java: "while (i < j) {\n    while (a[i] < pivot) i++;\n    while (a[j] > pivot) j--;\n    int t = a[i]; a[i] = a[j]; a[j] = t;\n}",
      c: "while (i < j) {\n    while (a[i] < pivot) i++;\n    while (a[j] > pivot) j--;\n    int t = a[i]; a[i] = a[j]; a[j] = t;\n}"
    }
  },
  {
    bugId: "BUG014",
    name: "Sliding Window Left Pointer Miss",
    description: "Window never shrinks when condition is violated.",
    marketValue: 290,
    difficulty: "Medium",
    tag: "🟡",
    languageVersions: {
      python: "for r in range(len(s)):\n    freq[s[r]] = freq.get(s[r], 0) + 1\n    if freq[s[r]] > 1:\n        pass  # forgot to move left",
      java: "for (int r = 0; r < s.length(); r++) {\n    freq[s.charAt(r)]++;\n    if (freq[s.charAt(r)] > 1) {\n        // forgot to increment left\n    }\n}",
      c: "for (int r = 0; r < n; r++) {\n    freq[s[r]]++;\n    if (freq[s[r]] > 1) {\n        /* forgot to move l */\n    }\n}"
    }
  },
  {
    bugId: "BUG015",
    name: "Two-Pointer Sum Skips Pair",
    description: "Both pointers move after mismatch causing missed solution.",
    marketValue: 210,
    difficulty: "Easy",
    tag: "🟢",
    languageVersions: {
      python: "while l < r:\n    s = a[l] + a[r]\n    if s == target: return True\n    l += 1\n    r -= 1",
      java: "while (l < r) {\n    int s = a[l] + a[r];\n    if (s == target) return true;\n    l++;\n    r--;\n}",
      c: "while (l < r) {\n    int s = a[l] + a[r];\n    if (s == target) return 1;\n    l++;\n    r--;\n}"
    }
  },
  {
    bugId: "BUG016",
    name: "Prefix Sum Wrong Base Index",
    description: "Prefix array starts from wrong index and shifts all ranges.",
    marketValue: 230,
    difficulty: "Easy",
    tag: "🟢",
    languageVersions: {
      python: "pref = [0] * len(a)\nfor i in range(len(a)):\n    pref[i] = pref[i-1] + a[i]",
      java: "int[] pref = new int[a.length];\nfor (int i = 0; i < a.length; i++) {\n    pref[i] = pref[i - 1] + a[i];\n}",
      c: "int pref[1000];\nfor (int i = 0; i < n; i++) {\n    pref[i] = pref[i - 1] + a[i];\n}"
    }
  },
  {
    bugId: "BUG017",
    name: "Modulo Negative Index Bug",
    description: "Negative modulo leads to invalid index in circular array.",
    marketValue: 370,
    difficulty: "Medium",
    tag: "🟡",
    languageVersions: {
      python: "i = (i - k) % n\narr[i] = 1",
      java: "int i = (i - k) % n;\narr[i] = 1;",
      c: "int i = (i - k) % n;\narr[i] = 1;"
    }
  },
  {
    bugId: "BUG018",
    name: "Topological Sort InDegree Leak",
    description: "In-degree not decremented for all neighbors.",
    marketValue: 560,
    difficulty: "Hard",
    tag: "🔴",
    languageVersions: {
      python: "for v in graph[u]:\n    if indeg[v] == 0:\n        q.append(v)",
      java: "for (int v : g[u]) {\n    if (indeg[v] == 0) q.add(v);\n}",
      c: "for (int i = 0; i < deg[u]; i++) {\n    int v = adj[u][i];\n    if (indeg[v] == 0) q[rear++] = v;\n}"
    }
  },
  {
    bugId: "BUG019",
    name: "Memoization Key Collision",
    description: "Cache key ignores one parameter and returns wrong state.",
    marketValue: 430,
    difficulty: "Hard",
    tag: "🔴",
    languageVersions: {
      python: "memo = {}\ndef solve(i, k):\n    if i in memo:\n        return memo[i]\n    memo[i] = solve(i+1, k-1)\n    return memo[i]",
      java: "Map<Integer,Integer> memo = new HashMap<>();\nint solve(int i, int k){\n    if (memo.containsKey(i)) return memo.get(i);\n    memo.put(i, solve(i+1, k-1));\n    return memo.get(i);\n}",
      c: "int memo[1000];\nint seen[1000];\nint solve(int i, int k){\n    if (seen[i]) return memo[i];\n    seen[i] = 1;\n    memo[i] = solve(i+1, k-1);\n    return memo[i];\n}"
    }
  },
  {
    bugId: "BUG020",
    name: "Dijkstra Without Relax Guard",
    description: "Updates distance without checking for better path.",
    marketValue: 600,
    difficulty: "Hard",
    tag: "🔴",
    languageVersions: {
      python: "for v, w in g[u]:\n    dist[v] = dist[u] + w\n    heapq.heappush(pq, (dist[v], v))",
      java: "for (Edge e : g[u]) {\n    dist[e.to] = dist[u] + e.w;\n    pq.add(new Node(e.to, dist[e.to]));\n}",
      c: "for (int i = 0; i < deg[u]; i++) {\n    int v = to[u][i], w = wt[u][i];\n    dist[v] = dist[u] + w;\n    push(v, dist[v]);\n}"
    }
  }
];

module.exports = { bugsData };
