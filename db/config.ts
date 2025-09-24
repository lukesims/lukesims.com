import { column, defineDb, defineTable, NOW } from "astro:db";

/**
 * Individual requests to view one of the CVs.
 */
const accessRequests = defineTable({
  columns: {
    // We manually create IDs for this table, so they're non-sequential,
    // since they'll be used in the URL when a visitor views one of the CVs.
    id: column.text({ primaryKey: true }),
    // The ID of the content entry for the CV being requested.
    // Passed to import("astro:content").getEntry() to get the CV content.
    cv: column.text(),
    visitorId: column.number({ references: () => visitors.columns.id }),
    requestedAt: column.date({ default: NOW }),
  },
});

/**
 * The people requesting to view one of the CVs.
 */
const visitors = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    email: column.text({ unique: true }),
    company: column.text({ optional: true }),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    accessRequests,
    visitors,
  },
});
