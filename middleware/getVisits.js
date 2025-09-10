const { loadAccess } = require('../models/appModel')

const recordAccess = (req, res, next) => {
    const ipAddress = req.ip;
    loadAccess(ipAddress)
      .then(() => {
        next();
      })
      .catch(err => {
        console.error('Error recording access:', err);
        next(err);
      });
  };
  
module.exports = { recordAccess };