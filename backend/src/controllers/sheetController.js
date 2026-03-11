import Sheet from "../models/Sheet.js";

export const getSheetBySlug = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const sheet = await Sheet.findOne({ slug }).lean();

    if (!sheet) {
      return res.status(404).json({
        message: "Sheet not found",
      });
    }

    return res.json({
      message: "Sheet fetched successfully",
      data: {
        title: sheet.title,
        source: sheet.source,
        scraped_at: sheet.scraped_at,
        total_topics: sheet.total_topics,
        total_problems: sheet.total_problems,
        topics: sheet.topics,
      },
    });
  } catch (error) {
    return next(error);
  }
};

