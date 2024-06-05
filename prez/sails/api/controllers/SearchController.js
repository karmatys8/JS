/* eslint-disable linebreak-style */
module.exports = {
  search: function (req, res) {
    const { q } = req.query;

    if (q === undefined) {
      return res.status(400).json({ error: 'Missing query parameter \'q\'' });
    }

    return res.send(`Search query: ${q}`);
  },
};
