import { parseISO, isToday, isYesterday, isThisWeek, isThisYear, format } from 'date-fns';

export function groupByDateLabel<T>(items: T[], dateKey: keyof T) {
  const grouped: { [label: string]: T[] } = {};

  for (const item of items) {
    const rawDate = item[dateKey] as unknown as string;
    if (!rawDate) continue;

    const date = parseISO(rawDate);
    let label = '';

    if (isToday(date)) label = 'Hoy';
    else if (isYesterday(date)) label = 'Ayer';
    else if (isThisWeek(date)) label = 'Esta semana';
    else if (isThisYear(date)) label = format(date, 'MMMM', { locale: undefined });
    else label = format(date, 'MMMM yyyy');

    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(item);
  }

  return Object.entries(grouped)
    .map(([label, entries]) => ({ label, entries }))
    .sort((a, b) => {
      const d1 = parseISO((a.entries[0][dateKey] as unknown as string));
      const d2 = parseISO((b.entries[0][dateKey] as unknown as string));
      return d2.getTime() - d1.getTime();
    });
}
