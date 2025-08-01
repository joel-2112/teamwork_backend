import cron from "node-cron";
import { Op } from "sequelize";
import db from "../models/index.js";

const { Job, News } = db;

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

    const [deletedNews] = await News.update(
      { isDeleted: true, deletedAt: new Date() },
      {
        where: {
          deadline: {
            [Op.lt]: now,
          },
          isDeleted: false,
        },
      }
    );

    if (updatedCount === 0 && deletedNews === 0) {
      console.log(`[CRON] No jobs or news updated at ${now.toISOString()}`);
    }

    if (updatedCount > 0) {
      console.log(
        `[CRON] ${updatedCount} job(s) automatically closed at ${now.toISOString()}`
      );
    }

    if (deletedNews > 0) {
      console.log(
        `[CRON] ${deletedNews} News(s) automatically deleted at ${now.toISOString()}`
      );
    }
  } catch (error) {
    console.error("[CRON] Failed to update job statuses:", error.message);
  }
});
