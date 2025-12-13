export function flatMap(arr, fn) {
  return arr.reduce((acc, x) => acc.concat(fn(x)), []);
}

export function setAt(arr, index, value) {
  return arr.map((x, i) => (i === index ? value : x));
}

export function times(n, fn) {
  return Array.from({ length: n }, (_, index) => fn(index));
}

export function toInt(string) {
  const number = parseInt(string, 10);
  if (Number.isNaN(number)) return null;
  return number;
}

export function groupBy(arr, fn) {
  return arr.map(fn).reduce((acc, val, i) => {
    acc[val] = (acc[val] || []).concat(arr[i]);
    return acc;
  }, {});
}

export function uniq(arr) {
  return [...new Set(arr)];
}

export function orderBy(arr, fns, orders = []) {
  if (typeof fns === "function") {
    fns = [fns];
  }
  if (typeof orders === "string") {
    orders = [orders];
  }

  return arr.slice(0).sort((a, b) =>
    fns.reduce((acc, fn, i) => {
      if (acc === 0) {
        const fnA = fn(a);
        const fnB = fn(b);
        const result = fnA > fnB ? 1 : fnA < fnB ? -1 : 0;
        acc = orders[i] === "desc" ? -result : result;
      }
      return acc;
    }, 0)
  );
}

export function partition(arr, fn) {
  return arr.reduce(
    (acc, val, i, arr) => {
      acc[fn(val, i, arr) ? 0 : 1].push(val);
      return acc;
    },
    [[], []]
  );
}

export function min(arr) {
  return arr.reduce((x, y) => (x < y ? x : y));
}

export function max(arr) {
  return arr.reduce((x, y) => (x > y ? x : y));
}

export function minBy(arr, fn) {
  return arr.reduce((x, y) => (fn(x) < fn(y) ? x : y));
}

export function toggleElement(arr, x) {
  return arr.includes(x) ? arr.filter((y) => y !== x) : [x, ...arr];
}

export function clamp(x, left, right) {
  return Math.min(Math.max(x, left), right);
}

export function formatSentence(message) {
  return capitalize(message).replace(/\.?$/, ".");
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Utility to append or set a width search param on image URLs while preserving existing
// query parameters and fragments. Returns the original url if falsy.
export function withImageWidth(imageUrl, width = 100) {
  if (!imageUrl) return imageUrl;

  try {
    // Use base origin to allow relative URLs in the browser environment.
    const base = typeof window !== "undefined" && window.location?.origin ? window.location.origin : undefined;
    const u = base ? new URL(imageUrl, base) : new URL(imageUrl);
    // Only modify images served from Shopify CDN
    if (u.hostname !== "cdn.shopify.com") return imageUrl;
    u.searchParams.set("width", String(width));
    return u.toString();
  } catch (e) {
    // Fallback: handle by string manipulation
    try {
      // Only add/replace width if the hostname in the URL string is cdn.shopify.com
      const match = imageUrl.match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
      if (!match) return imageUrl;
      const host = match[1].toLowerCase();
      if (host !== "cdn.shopify.com") return imageUrl;
      if (/[?&]width=/.test(imageUrl)) {
        return imageUrl.replace(/([?&])width=[^&]*/, `$1width=${width}`);
      }
      return imageUrl + (imageUrl.includes("?") ? `&width=${width}` : `?width=${width}`);
    } catch (fallbackError) {
      return imageUrl;
    }
  }
}

/**
 * Splits results into divisions and returns an array of division objects.
 * Each division object contains the division name and its results.
 * Divisions are ordered by priority: A+, A, B, C, D, then any other divisions alphabetically.
 */
export function splitResultsByDivision(results) {
  const divisionOrder = ["A+", "A", "B", "C", "D"];
  const divisionTime = {
    "A+": "Sub 10 seconds",
    A: "10-19 seconds",
    B: "20-29 seconds",
    C: "30-45 seconds",
    D: "45+ seconds",
  };

  // Group results by division
  const resultsByDivision = groupBy(results, (result) => result.calculatedDivision || "Unknown");

  // Get all division names and sort them
  const divisionNames = Object.keys(resultsByDivision);
  const sortedDivisions = [
    ...divisionOrder.filter((div) => divisionNames.includes(div)),
    ...divisionNames.filter((div) => !divisionOrder.includes(div)).sort(),
  ];

  // Return array of division objects
  return sortedDivisions.map((division) => ({
    name: division,
    time: divisionTime[division] || "Unknown",
    results: resultsByDivision[division],
  }));
}

export function getDivisionLabel(division) {

  if (!division || division === "Unknown") {
    return "DNF/DNS";
  }
  return `Division ${division}`;
}

export function getDivisonTimeLabel(division) {
  const divisionTime = {
    "A+": "(Sub 10 seconds)",
    A: "(10-19 seconds)",
    B: "(20-29 seconds)",
    C: "(30-45 seconds)",
    D: "(45+ seconds)",
    Unknown: "",
  };
  return ` ${divisionTime[division]}` || " Unknown";
}

export function getCompetitionDisplayName(competitionId) {
  const competitionNames = {
    cubuzzle2024: "Season 1",
    cubuzzle2025: "Season 2",
    "cubuzzle-s3": "Season 3",
  };
  return competitionNames[competitionId] || competitionId;
}