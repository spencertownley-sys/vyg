import type { Metadata } from "next";
import {
  getAllCruiseLines,
  getRecentIngestionRuns,
  getSailingCountByLine,
  getLastSuccessfulRun,
} from "@/db/queries";
import { SourcesTable } from "@/components/admin/sources-table";
import { ActiveJobsPanel } from "@/components/admin/active-jobs-panel";
import { RunsHistory } from "@/components/admin/runs-history";
import { RefreshAllButton } from "@/components/admin/refresh-button";

export const metadata: Metadata = {
  title: "Sources — Admin",
};

export default function AdminPage() {
  const lines = getAllCruiseLines();
  const recentRuns = getRecentIngestionRuns(50);

  const rows = lines.map((line) => ({
    line: {
      id: line.id,
      name: line.name,
      enabled: line.enabled,
      crawlerId: line.crawlerId,
    },
    lastRun: getLastSuccessfulRun(line.id),
    sailingCount: getSailingCountByLine(line.id),
  }));

  const enabledLineIds = lines.filter((l) => l.enabled).map((l) => l.id);

  return (
    <div className="container-max" style={{ padding: "40px 16px" }}>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 32,
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Sources</h1>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>
            {lines.length} cruise lines · {enabledLineIds.length} enabled
          </p>
        </div>
        <RefreshAllButton enabledLineIds={enabledLineIds} />
      </div>

      {/* Active jobs (client-side polling) */}
      <ActiveJobsPanel />

      {/* Sources table */}
      <div style={{ marginBottom: 40 }}>
        <SourcesTable rows={rows} />
      </div>

      {/* Recent runs */}
      <RunsHistory runs={recentRuns} limit={10} />
    </div>
  );
}
