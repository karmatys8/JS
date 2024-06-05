/* eslint-disable linebreak-style */
module.exports = {
  getUser: function (req, res) {
    const { id } = req.params;
    return res.send(`User ID: ${id}`);
  },
};
