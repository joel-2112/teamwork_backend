import cron from "node-cron";
import { Op } from "sequelize";
import db from "../models/index.js";

const { Job } = db;

// Run every Sunday at midnight (00:00)
cron.schedule("0 0 * * 0", async () => {
  try {
    const now = new Date();

    const [updatedCount] = await Job.update(
      { jobStatus: "closed" },
      {
        where: {
          jobStatus: "open",
          deadline: {
            [Op.lt]: now,
          },
          isDeleted: false,
        },
      }
    );

    if (updatedCount > 0) {
      console.log(
        `[CRON] ${updatedCount} job(s) automatically closed at ${now.toISOString()}`
      );
    }
  } catch (error) {
    console.error("[CRON] Failed to update job statuses:", error.message);
  }
});
