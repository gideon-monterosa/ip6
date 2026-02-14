import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {
  exportToCSV(data: Record<string, unknown>[], filename: string): void {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((h) => {
        const val = String(row[h] ?? '');
        return val.includes(',') || val.includes('"') || val.includes('\n')
          ? `"${val.replace(/"/g, '""')}"`
          : val;
      }).join(','),
    );
    const csv = [headers.join(','), ...rows].join('\n');
    this.download(csv, `${filename}.csv`, 'text/csv');
  }

  exportToJSON(data: unknown, filename: string): void {
    const output = {
      exportDate: new Date().toISOString(),
      data,
    };
    const json = JSON.stringify(output, null, 2);
    this.download(json, `${filename}.json`, 'application/json');
  }

  private download(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
