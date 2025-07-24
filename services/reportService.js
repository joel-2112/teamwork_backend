import db from "../models/index.js";

const { Report } = db;

export const createReportService = async (data) => {
  const report = await Report.create(data);
  return report;
};
