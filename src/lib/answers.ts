export const OTHER_OPTION_LABEL = "Other";
export const OTHER_OPTION_PREFIX = "Other:";

export function isOtherAnswer(value: string): boolean {
  return value === OTHER_OPTION_LABEL || value.startsWith(OTHER_OPTION_PREFIX);
}

export function formatOtherAnswer(text: string): string {
  return `${OTHER_OPTION_PREFIX} ${text.trim()}`;
}

export function extractOtherText(value: string): string {
  if (!value.startsWith(OTHER_OPTION_PREFIX)) {
    return "";
  }

  return value.slice(OTHER_OPTION_PREFIX.length).trim();
}

export function parseStoredAnswer(
  answer: string,
  allowMultiple: boolean,
): string | string[] {
  if (!allowMultiple) {
    return answer;
  }

  try {
    const parsed = JSON.parse(answer) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    // Fall through to plain string.
  }

  return answer ? [answer] : [];
}

export function splitMultiSelectAnswer(saved: string): {
  selections: string[];
  otherText: string;
} {
  const parsed = parseStoredAnswer(saved, true);
  const items = Array.isArray(parsed) ? parsed : [];
  const otherEntry = items.find((item) => isOtherAnswer(item));

  return {
    selections: items.filter((item) => !isOtherAnswer(item)),
    otherText: otherEntry ? extractOtherText(otherEntry) : "",
  };
}

export function buildMultiSelectAnswer(
  selections: string[],
  otherText: string,
): string {
  const values = [...selections];
  const trimmedOther = otherText.trim();

  if (trimmedOther) {
    values.push(formatOtherAnswer(trimmedOther));
  }

  return formatStoredAnswer(values, true);
}

export function formatStoredAnswer(
  value: string | string[],
  allowMultiple: boolean,
): string {
  if (!allowMultiple) {
    return typeof value === "string" ? value : (value[0] ?? "");
  }

  const selections = Array.isArray(value) ? value : [value];
  return JSON.stringify(selections.filter(Boolean));
}

export function formatAnswerForDisplay(
  answer: string,
  allowMultiple: boolean,
): string {
  const parsed = parseStoredAnswer(answer, allowMultiple);
  return Array.isArray(parsed) ? parsed.join(", ") : parsed;
}
