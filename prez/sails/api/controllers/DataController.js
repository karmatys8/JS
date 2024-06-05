/* eslint-disable linebreak-style */
module.exports = {
  postData: function (req, res) {
    const data = req.body;
    return res.json({ receivedData: data });
  },
};
