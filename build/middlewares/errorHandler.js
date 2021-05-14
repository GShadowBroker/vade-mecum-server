export default (err, _req, res, _next) => {
    const status = err.status || 500;
    const message = err.message || "Something went horribly wrong";
    return res.status(status).json({ status, message });
};
