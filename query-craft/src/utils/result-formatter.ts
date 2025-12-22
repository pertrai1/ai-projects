export interface TableColumn {
  name: string;
  type: string;
  width?: number;
}

export class ResultFormatter {
  /**
   * Format query results as an ASCII table
   */
  static formatAsTable(
    data: any[],
    columns: TableColumn[],
    options: {
      maxRows?: number;
      maxColumnWidth?: number;
    } = {},
  ): string {
    const maxRows = options.maxRows || 10;
    const maxColumnWidth = options.maxColumnWidth || 30;

    if (!data || data.length === 0) {
      return "No results returned";
    }

    // Calculate column widths
    const columnWidths = columns.map((col) => {
      const headerWidth = col.name.length;
      const dataWidth = Math.max(
        ...data.slice(0, maxRows).map((row) => {
          const value = String(row[col.name] ?? "");
          return Math.min(value.length, maxColumnWidth);
        }),
      );
      return Math.max(headerWidth, dataWidth, 3); // minimum 3 chars
    });

    // Build table
    let table = "";

    // Top border
    table += "┌" + columnWidths.map((w) => "─".repeat(w + 2)).join("┬") + "┐\n";

    // Header row
    table += "│";
    columns.forEach((col, i) => {
      table += " " + this.padString(col.name, columnWidths[i]) + " │";
    });
    table += "\n";

    // Header separator
    table += "├" + columnWidths.map((w) => "─".repeat(w + 2)).join("┼") + "┤\n";

    // Data rows
    const displayRows = data.slice(0, maxRows);
    displayRows.forEach((row) => {
      table += "│";
      columns.forEach((col, i) => {
        const value = row[col.name];
        const displayValue = this.formatValue(value, maxColumnWidth);
        table += " " + this.padString(displayValue, columnWidths[i]) + " │";
      });
      table += "\n";
    });

    // Bottom border
    table += "└" + columnWidths.map((w) => "─".repeat(w + 2)).join("┴") + "┘\n";

    // Show truncation message
    if (data.length > maxRows) {
      table += `\n... and ${data.length - maxRows} more rows (use --limit to see more)\n`;
    }

    return table;
  }

  /**
   * Format query results as JSON
   */
  static formatAsJSON(data: any[], pretty: boolean = true): string {
    return JSON.stringify(data, null, pretty ? 2 : 0);
  }

  /**
   * Format query as CSV
   */
  static formatAsCSV(data: any[], columns: TableColumn[]): string {
    if (!data || data.length === 0) {
      return "";
    }

    // Header
    let csv = columns.map((col) => this.escapeCSV(col.name)).join(",") + "\n";

    // Rows
    data.forEach((row) => {
      csv +=
        columns
          .map((col) => {
            const value = row[col.name];
            return this.escapeCSV(String(value ?? ""));
          })
          .join(",") + "\n";
    });

    return csv;
  }

  /**
   * Pad string to specified width
   */
  private static padString(str: string, width: number): string {
    if (str.length > width) {
      return str.substring(0, width - 3) + "...";
    }
    return str + " ".repeat(width - str.length);
  }

  /**
   * Format value for display
   */
  private static formatValue(value: any, maxWidth: number): string {
    if (value === null || value === undefined) {
      return "NULL";
    }

    if (typeof value === "object") {
      const str = JSON.stringify(value);
      if (str.length > maxWidth) {
        return str.substring(0, maxWidth - 3) + "...";
      }
      return str;
    }

    const str = String(value);
    if (str.length > maxWidth) {
      return str.substring(0, maxWidth - 3) + "...";
    }
    return str;
  }

  /**
   * Escape CSV value
   */
  private static escapeCSV(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  }

  /**
   * Format execution summary
   */
  static formatExecutionSummary(result: {
    success: boolean;
    executionTime: number;
    rowCount: number;
    truncated?: boolean;
  }): string {
    let summary = "";

    if (result.success) {
      summary += "✓ Query executed successfully\n";
      summary += `✓ Execution time: ${result.executionTime}ms\n`;
      summary += `✓ Rows returned: ${result.rowCount}\n`;
      if (result.truncated) {
        summary += "   Results were truncated\n";
      }
    } else {
      summary += `✗ Query execution failed\n`;
    }

    return summary;
  }
}
