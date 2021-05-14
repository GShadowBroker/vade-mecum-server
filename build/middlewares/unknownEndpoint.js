export default (_req, res, _next) => {
    return res.status(404).json({ status: 404, message: "Unknown endpoint" });
};
