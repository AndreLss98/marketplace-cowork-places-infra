module.exports = function (query) {
    return async (req, res, next) => {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const response = {};

        response.results = await query();

        if (endIndex < response.results.length) {
            response.next = {
                page: page + 1,
                limit
            }
        }

        if (startIndex > 0) {
            response.previous = {
                page: page - 1,
                limit
            }
        }

        response.results = response.results.slice(startIndex, endIndex);

        res.result = response;
        next();
    }
}