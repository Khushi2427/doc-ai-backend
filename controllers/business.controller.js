export const businessApiHandler = (req, res) => {
  res.json({
    success: true,
    message: "Business API accessed successfully!",
  });
};

export const extractAI = (req, res) => {
  res.json({
    success: true,
    message: "Advanced AI extraction accessed",
  });
};
